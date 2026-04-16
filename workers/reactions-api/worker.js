/**
 * zero2PM Reactions API — Cloudflare Worker + KV
 *
 * KV binding name: REACTIONS
 *
 * GET  /reactions?page=<pageId>               → { likes, dislikes }
 * POST /reactions?page=<pageId>  { type, action } → { likes, dislikes }
 *   type:   "like" | "dislike"
 *   action: "add"  | "remove"
 */

const ALLOWED_ORIGINS = [
    'https://onefly.top',
    'http://localhost:4000',   // Jekyll dev server
];

function corsHeaders(request) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.find(o => origin.startsWith(o)) || ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    };
}

function json(data, status, request) {
    return new Response(JSON.stringify(data), { status, headers: corsHeaders(request) });
}

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders(request) });
        }

        const url = new URL(request.url);

        if (!url.pathname.endsWith('/reactions')) {
            return json({ error: 'not found' }, 404, request);
        }

        const page = url.searchParams.get('page');
        if (!page || page.length > 200) {
            return json({ error: 'invalid page param' }, 400, request);
        }

        const key = 'r:' + page;

        /* ---- GET: fetch counts ---- */
        if (request.method === 'GET') {
            const data = await env.REACTIONS.get(key, 'json') || { likes: 0, dislikes: 0 };
            return json(data, 200, request);
        }

        /* ---- POST: update counts ---- */
        if (request.method === 'POST') {
            let body;
            try { body = await request.json(); }
            catch { return json({ error: 'invalid JSON' }, 400, request); }

            const { type, action } = body;
            if (!['like', 'dislike'].includes(type) || !['add', 'remove'].includes(action)) {
                return json({ error: 'invalid type or action' }, 400, request);
            }

            const data = await env.REACTIONS.get(key, 'json') || { likes: 0, dislikes: 0 };
            const field = type === 'like' ? 'likes' : 'dislikes';

            if (action === 'add') {
                data[field]++;
            } else {
                data[field] = Math.max(0, data[field] - 1);
            }

            await env.REACTIONS.put(key, JSON.stringify(data));
            return json(data, 200, request);
        }

        return json({ error: 'method not allowed' }, 405, request);
    }
};
