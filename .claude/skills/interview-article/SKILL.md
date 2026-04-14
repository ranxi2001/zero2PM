---
name: interview-article
description: 根据用户提供的面经素材（文字/截图），自动生成结构化的 PM 面试真题文章并集成到 zero2PM 站点。
---

# 面试真题文章生成技能

根据用户提供的面经原始素材（文字、截图、笔记），自动生成结构化的产品经理面试真题文章，并完成站点集成（nav.yml、首页统计、引号修复）。

## 适用场景

- 用户提供了一份面经素材（可以是文字、截图、备忘录笔记）
- 需要将其整理为 zero2PM 站点风格的面试真题文章
- 文章需要集成到现有的 PM 面试模块导航中

## 输入要求

用户需要提供：
1. **面经素材：** 面试问题列表（文字或截图均可）
2. **公司名称**
3. **岗位名称**
4. **所属方向：** AI 产品 / B 端产品 / C 端产品 / Web3 产品 / 其他（新建）

可选信息（有则更好）：
- 面试轮次和流程
- 面试时长
- 岗位背景（候选人经历）
- 面试结果（已 Offer / 已通过 / 复盘）
- 面试体验评分

## 文章结构模板

```markdown
---
title: "{{公司}} {{岗位}}面试真题（{{结果/轮次}}）"
layout: default
description: "{{一句话描述，包含公司、岗位、题目数量、核心考察点}}"
eyebrow: "面试 · {{方向}} · 真题"
---

# {{公司}} {{岗位}}面试真题

{{1-2 句话概述：候选人背景、面试轮次、整体风格}}

| 信息 | 详情 |
|------|------|
| 面试岗位 | {{岗位}} |
| 面试公司 | {{公司}} |
| 面试轮次 | {{轮次}} |
| {{其他信息行}} | {{详情}} |

---

## {{轮次标题}}（按面试轮次分节）

### {{序号}}."{{原始面试问题}}"

**回答要点：** {{1-2 句话点出这道题考察什么}}

{{展开分析：具体的回答思路、框架、案例，2-4 段}}

---

## 面试总结

{{3-5 个要点总结面试特点}}

### 备考建议

{{4-6 条具体可操作的备考建议}}
```

## 写作规范

### 语言风格
- 中文口语化 + 专业术语并存，不要学术腔
- 第二人称"你"为主，像在跟读者对话
- 每道题的回答分析要有实质内容，不能只复述问题

### 回答分析要求
- **每道题必须有"回答要点"**：1-2 句话说清考察点
- **展开部分要给框架**：不是告诉读者"答什么"，而是"怎么想"
- **有具体案例或场景**：让读者能直接套用
- **区分层次**：新手答 vs 高手答、表面回答 vs 深度回答

### 格式规范
- 标题使用 `##` 和 `###` 两级
- 面试问题用 `### 序号."问题内容"` 格式
- 使用中文弯引号 `""` 而非直引号（YAML frontmatter 中保留直引号）
- 表格用 Markdown pipe 语法
- 列表项使用 `-` 而非 `*`

## 站点集成步骤

文章写完后，按以下步骤集成到站点：

### 1. 确定文件路径

根据所属方向确定路径：

| 方向 | 路径前缀 |
|------|---------|
| AI 产品 | `learn-pm-interview/ai-pm/` |
| B 端产品 | `learn-pm-interview/tob-pm/` |
| C 端产品 | `learn-pm-interview/toc-pm/` |
| Web3 产品 | `learn-pm-interview/web3-pm/` |
| 新方向 | `learn-pm-interview/{{slug}}/`（需新建目录） |

文件命名：`{{序号}}-{{公司缩写}}-{{岗位缩写}}-real/index.md`

示例：`ai-pm/03-bytedance-ai-pm-real/index.md`

### 2. 创建目录和文件

```bash
mkdir -p learn-pm-interview/{{方向}}/{{文件名}}
# 写入 index.md
```

### 3. 更新 nav.yml

在 `_data/nav.yml` 的 PM 面试模块下，找到对应方向的 section，添加文章条目：

```yaml
- title: "{{侧边栏显示标题}}"
  slug: "{{方向}}/{{文件名}}"
```

如果是新方向，还需要先添加 section：

```yaml
- section: "{{方向名称}}"
- title: "{{文章标题}}"
  slug: "{{方向}}/{{文件名}}"
```

### 4. 修复引号

```bash
python .claude/skills/chinese-quotes-fix/fix_quotes.py learn-pm-interview/{{路径}}/index.md
```

如果有 pairing issues，用 Python 脚本逐行修复（参考 chinese-quotes-fix 技能）。

### 5. 更新首页统计

更新 `index.html` 中的两处统计数字：
- hero 区域的 `<strong>` 文章数
- stats-bar 区域的 `stats-value` 文章数
- PM 面试模块的 badge 数字

### 6. 提交

```bash
git add _data/nav.yml index.html learn-pm-interview/{{路径}}/
git commit -m "feat: 添加{{公司}} {{岗位}}面试真题"
git push
```

## 验收清单

- [ ] 文章 frontmatter 正确（title、layout、description、eyebrow）
- [ ] 所有面试问题都已覆盖并有回答分析
- [ ] 中文弯引号已修复（check_quotes.py 报告 OK 或仅有多行引用的 pairing issues）
- [ ] nav.yml 已更新
- [ ] index.html 统计数字已更新
- [ ] `git push` 成功
