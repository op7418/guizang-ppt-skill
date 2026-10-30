# 瑞士国际主义风格 · 主题色预设（Swiss Themes）

4 套基于瑞士国际主义风格（Swiss Style）的高反差配色。**每套都遵循"高级灰白底 + 单一高饱和高亮色"的极简原则**——这是瑞士风的灵魂,不允许混搭多个高亮色。

---

<!-- GZ:THEMES:START · guizang-design 生成，不要手改；改主题请改 guizang-design/tokens/palettes.json 后运行 scripts/sync-skill.mjs -->
## 使用方法

全部主题已内置在模板的 `GZ:TOKENS` 区块里。选定主题后，只改拷贝好的模板第一行 `<html>` 上的 `data-theme`：

```html
<html lang="zh-CN" data-family="swiss" data-medium="slide" data-theme="lemon">
```

不要改 `GZ:TOKENS` 区块，也不要在页面里写颜色值。文字、线条、强调色一律用语义变量：

| 变量 | 用途 |
|---|---|
| `--paper` / `--ink` | 底色 / 主文字 |
| `--text-body` / `--text-secondary` / `--text-helper` | 正文 / 次要 / 辅助文字，对比度已校验，代替 opacity |
| `--line` / `--line-strong` / `--line-subtle` | 分割线 |
| `--accent` | 强调色：色块、细线、圆点、高亮条 |
| `--accent-ink` | 强调色用作**小字**颜色时用它（浅色强调色会自动加深到可读） |
| `--accent-display` | 强调色用作**大字**（标题、KPI 数字）颜色时用它 |
| `--accent-on` / `--accent-on-rgb` | 强调色色块上的文字颜色（黄、绿上是墨色，蓝、橙上是白色） |

### 用户给了品牌色或 logo 主色

不要直接使用这个颜色。运行：

```bash
node <SKILL_ROOT>/scripts/gz-theme.mjs brand "#4D6BFE" --family swiss
```

把输出的 `[data-theme="brand"]{…}` 贴到 deck `<style>` 的末尾，再把 `data-theme` 改成 `brand`。
脚本会把颜色收进本风格精调色板的明度 / 彩度区间，并检查 WCAG 与 APCA 对比度；不达标时会说明原因，这时从下面的预设里选。杂志风会把彩度压到 0.12 以内，高饱和的品牌色会变得更克制（例如 #FF2442 → #b75a59，第一行注释会写明调整）；需要保留鲜艳度时用瑞士风。

---

## 🔵 克莱因蓝 · `ikb`（默认）

**适合**：通用场合、商业发布、AI/科技产品、设计领域分享。最经典的瑞士风配色，绝不出错。
**调性**：纯白底 + IKB 克莱因蓝，极致冷静、理性、有学术感，像 Helvetica Forever 或 Massimo Vignelli 的作品集。

| paper | ink | accent | accent-ink | accent-on | 正文对比度 |
|---|---|---|---|---|---|
| `#fafaf8` | `#0a0a0a` | `#002FA7` | `#002FA7` | `#ffffff` | 14.7 / 99 |

---

## 🟡 柠檬黄 · `lemon`

**适合**：年轻、运动、零售、消费品、活力主题、Y2K 复古设计。
**调性**：浅米白底 + 柠檬黄，鲜亮、有活力、警示感强，像 IKEA 或 Beck Design 的视觉语言。

| paper | ink | accent | accent-ink | accent-on | 正文对比度 |
|---|---|---|---|---|---|
| `#fafaf8` | `#0a0a0a` | `#FFD500` | `#7a5f00` | `#0a0a0a` | 14.7 / 99 |

---

## 🟢 柠檬绿 · `lemon-green`

**适合**：生态、可持续、健康、新兴科技、Z 世代品牌、AI 创业项目。
**调性**：浅米白底 + 荧光柠檬绿，有未来感、年轻、当代，像 Acne Studios 或 Off-White 的视觉。

| paper | ink | accent | accent-ink | accent-on | 正文对比度 |
|---|---|---|---|---|---|
| `#fafaf8` | `#0a0a0a` | `#C5E803` | `#4a6400` | `#0a0a0a` | 14.7 / 99 |

---

## 🟠 安全橙 · `safety-orange`

**适合**：工业、警示、运动、施工、汽车工业、技术发布会的「警告/重点」页。
**调性**：浅米白底 + 安全橙，工业感、紧迫感、视觉锚点感，像 Saul Bass 海报或 Highway Gothic 标识系统。

| paper | ink | accent | accent-ink | accent-on | 正文对比度 |
|---|---|---|---|---|---|
| `#fafaf8` | `#0a0a0a` | `#FF6B35` | `#c2410c` | `#ffffff` | 14.7 / 99 |

> 强调色色块上的文字只用大号粗体（APCA 59）。

---
<!-- GZ:THEMES:END -->

## 推荐选择参考

| 如果是... | 推荐主题 |
|---|---|
| 不知道选啥 / 第一次用 / AI/科技/设计 | 🔵 克莱因蓝 |
| 年轻、活力、消费、零售 | 🟡 柠檬黄 |
| 生态、未来、Z 世代、新兴 | 🟢 柠檬绿 |
| 工业、警示、汽车、紧迫感 | 🟠 安全橙 |

---

## 切换原则

- **一份 deck 只用一套主题**,不要中途换 accent 色
- 灰阶变量（`--grey-1/2/3`）在 4 套主题里完全相同,无需调整
- WebGL 网格背景会自动读取 `--accent` 变量,翻页时鼠标附近会偷渡一抹高亮色
- 选定主题后,可以在 chrome 文案里用一个相关词强化语义（如 IKB 配 `International / Helvetica` ,柠檬黄配 `Active / Living`）

---

## ❌ 不要做的事

- ❌ **不允许混搭**（例如 IKB 蓝 + 柠檬黄同时出现作高亮）——彻底违反瑞士风"单一锚点色"原则
- ❌ **不要把用户给的 hex 值直接写进页面**——用 `scripts/gz-theme.mjs --family swiss` 生成受约束的品牌主题；灰色或彩度太低的颜色会被拒绝，这时展示 4 套预设让选
- ❌ **不要改灰阶变量**——`--paper` / `--grey-1/2/3` / `--ink` 跨主题统一,只换 accent
- ❌ **不要用渐变**——瑞士风拒绝任何渐变,所有色块必须纯色
- ❌ **不要给 accent 加阴影 / 圆角 / 透明度**——直角、纯色、不透明,这是瑞士风的硬规则

---

## 关于灰阶（跨主题统一）

| 变量 | 值 | 用途 |
|---|---|---|
| `--paper` | `#fafaf8` | 主底色（极浅暖白） |
| `--grey-1` | `#f0f0ee` | 浅灰底（用于 `.grey-block` / 区块底） |
| `--grey-2` | `#d4d4d2` | 中灰（分割线、border） |
| `--grey-3` | `#737373` | 暗灰（辅助文字 / meta） |
| `--ink` | `#0a0a0a` | 文字主色（近黑） |

这套灰阶是经过校色的"高级灰",在任何 accent 色下都不抢戏。**不要**改成纯白（`#fff`）或纯黑（`#000`）——会损失瑞士风的"克制"质感。

---

选定主题后,告诉用户："用 🔵 克莱因蓝 / 🟡 柠檬黄 ..." 并在 deck 项目记录里备注,方便后续迭代时保持一致。
