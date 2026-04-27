---
name: guizang-ppt-skill
description: 生成"电子杂志 × 电子墨水"风格的横向翻页网页 PPT（单 HTML 文件），含 WebGL 流体背景、衬线标题 + 非衬线正文、章节幕封、数据大字报、图片网格等模板。当用户需要制作分享 / 演讲 / 发布会风格的网页 PPT，或提到"杂志风 PPT"、"horizontal swipe deck"、"editorial magazine"、"e-ink presentation"时使用。
---

# Magazine Web Ppt

## 这个 Skill 做什么

生成一份**单文件 HTML**的横向翻页 PPT，视觉基调是：

- **电子杂志 + 电子墨水**混血风格
- **WebGL 流体 / 等高线 / 色散背景**（hero 页可见）
- **衬线标题（Noto Serif SC + Playfair Display）+ 非衬线正文（Noto Sans SC + Inter）+ 等宽元数据（IBM Plex Mono）**
- **Lucide 线性图标**（不用 emoji）
- **横向左右翻页**（键盘 ← →、滚轮、触屏滑动、底部圆点、ESC 索引）
- **主题平滑插值**：翻到 hero 页时颜色和 shader 柔顺过渡
- **翻页入场动效**（Motion One 驱动,5 种 recipe 自动匹配布局,本地 + CDN 双保险,离线可用）

同时,这个 skill 会把图片当成可规划、可验收的内容资产来处理:

- 判断每一页是否需要图片,以及需要几张图
- 为背景图、主图、辅助图、装饰图、证据截图等分配角色和层级
- 为每张图写 prompt、比例、文件名、放置路径和 HTML placement
- 在用户尚未放入图片时,在 HTML 上显示半透明缺图占位
- 用户补齐图片后,检查缺失、比例、命名、风格一致性、内容关联性和阅读遮挡

**硬约束**:不要直接调用任何生图 API,不要真正生成图片。只做 prompt、图片规格、路径、占位、动效规划和后续检查。

这个 skill 的美学不是"商务 PPT"，也不是"消费互联网 UI"——它像 *Monocle* 杂志贴上了代码后的样子。

## 何时使用

**合适的场景**：
- 线下分享 / 行业内部讲话 / 私享会
- AI 新产品发布 / demo day
- 带有强烈个人风格的演讲
- 需要"一次做完，不用翻页工具"的网页版 slides

**不合适的场景**：
- 大段表格数据、图表叠加（用常规 PPT）
- 培训课件（信息密度不够）
- 需要多人协作编辑（这是静态 HTML）

## 工作流

### Step 1 · 需求澄清(**动手前必做**)

**如果用户已经给了完整的大纲 + 图片**,可以跳过直接进 Step 2。

**如果用户只给了主题或一个模糊想法**,用这 6 个问题逐个对齐后再动手。不要基于猜测就开始写 slide——一旦结构定错,后期翻修代价很高:

#### 6 问澄清清单

| # | 问题 | 为什么要问 |
|---|------|-----------|
| 1 | **受众是谁?分享场景?**(行业内部 / 商业发布 / demo day / 私享会) | 决定语言风格和深度 |
| 2 | **分享时长?** | 15 分钟 ≈ 10 页,30 分钟 ≈ 20 页,45 分钟 ≈ 25-30 页 |
| 3 | **有没有原始素材?**(文档 / 数据 / 旧 PPT / 文章链接) | 有素材就基于素材,没有就帮他搭 |
| 4 | **有没有图片?放在哪?如果还没准备图片,要不要预留后续补图空缺?** | 决定 `image_mode`,详见下方"图片模式选择" |
| 5 | **想要哪套主题色?** | 见 `references/themes.md`,5 套预设挑一 |
| 6 | **有没有硬约束?**(必须包含 XX 数据 / 不能出现 YY) | 避免返工 |

#### 大纲协助(如果用户没有大纲)

用"叙事弧"模板搭骨架,再填内容:

```
钩子(Hook)       → 1 页   : 抛一个反差 / 问题 / 硬数据让人停下来
定调(Context)    → 1-2 页 : 说明背景 / 你是谁 / 为什么讲这个
主体(Core)       → 3-5 页 : 核心内容,用 Layout 4/5/6/9/10 穿插
转折(Shift)      → 1 页   : 打破预期 / 提出新观点
收束(Takeaway)   → 1-2 页 : 金句 / 悬念问题 / 行动建议
```

叙事弧 + 页数规划 + 主题节奏表(见 `layouts.md`),**三张表对齐后**再进 Step 2。

大纲建议保存为 `项目记录.md` 或 `大纲-v1.md`,便于后续迭代。

#### 图片模式选择(构建大纲时必问)

如果用户没有准备图片,不要默认规划图片占位。必须先问:

> 你现在没有准备图片的话,这份 PPT 要采用哪种图片策略?
> 1. **预留补图空缺**:我会判断哪些页面值得放图,输出 prompt / 比例 / 文件名 / 路径,HTML 里先显示半透明缺图占位,等你后面把图片找齐再检查。
> 2. **无图版**:不添加图片,不生成图片需求清单,改用大标题、数据、引用、流程和排版节奏完成表达。

根据用户选择记录 `image_mode`:

| image_mode | 适用 | 后续行为 |
|---|---|---|
| `provided` | 用户已有图片 | 按真实图片路径规划和检查 |
| `placeholder` | 用户没图,但希望后面补图 | 输出图片需求清单,HTML 保留缺图占位 |
| `text_only` | 用户没图,也不想后面补图 | 不添加图片,优先选无图布局或把图文布局改成纯排版 |

没有得到这个选择前,不要进入 Step 1.5。若用户说"你看着办",默认选 `placeholder`,但要明确告诉用户会生成的是**补图空缺**,不是图片本身。

#### 图片约定(告知用户)

在动手前向用户说清:

- **文件夹位置**:`项目/XXX/ppt/images/` 下(和 `index.html` 同级)
- **命名规范**:`{页号}-{角色}-{语义}.{ext}`,例如 `01-bg-cover.jpg` / `03-main-figma.jpg` / `05-deco-arrow.png`
  - 页号补零便于排序
  - 角色用英文短词:`bg` 背景图 / `main` 主图 / `support` 辅助图 / `deco` 装饰图 / `proof` 证据截图 / `portrait` 人物 / `logo` 标识
  - 语义用英文,短、具体、和内容对应
- **规格建议**:
  - 单张 ≥ 1600px 宽(避免大屏模糊)
  - JPG 用于照片/截图,PNG 用于透明 UI/图表
  - 总大小控制在 10MB 内(影响翻页流畅度)
- **如何替换**:保持**同名覆盖**最稳(HTML 里不用改路径);如果文件名变了,记得全局搜 `images/旧名` 改成新名
- **没图怎么办**:先询问图片模式。如果用户选 `placeholder`,不要调用任何生图 API,也不要真的生成图片,只规划 prompt / 比例 / 文件名 / 放置路径,把 HTML 做成缺图占位状态;如果用户选 `text_only`,就不添加图片,改用纯排版方案。

### Step 1.5 · 图片与动效规划（**生成 HTML 前必做**）

本 skill 的新工作流是**先确定 `image_mode`,再判断每页是否需要图片,最后生成 PPT 骨架**。不要等 HTML 写完后才临时塞图。

如果 `image_mode=text_only`,仍然要写每页 `visual_intent` 和 `motion_level`,但图片需求清单应标记为"无图版,不需要图片",并避免使用依赖图片成立的 Layout 4 / 5 / 10。可以用 Layout 3 / 6 / 7 / 8 / 9 或纯文字变体替代。

#### 1.5.1 每页视觉意图

为每页写一条 `visual_intent`,说明这一页希望观众看到什么、记住什么。它不是文案复述,而是视觉任务:

```markdown
| 页 | layout | visual_intent | motion_level |
|---|---|---|---|
| 01 | Cover | 建立冷静、克制、带技术感的开场气质 | M |
| 05 | Image Grid | 用多平台截图证明传播规模,让证据自己说话 | L |
```

#### 1.5.2 动效等级

每页必须有 `motion_level`:

| 等级 | 用法 | 规则 |
|---|---|---|
| `S` | 静态或近静态 | 内容密集、截图多、需要读清楚 |
| `L` | 轻动效 | 默认值;标题、正文、图片顺序淡入 |
| `M` | 中等动效 | hero / 转场 / 观点页,可用更慢 stagger |
| `H` | 强动效 | 只给关键转折页;整份 deck 不超过 10-15% |

每个可见元素都要写 `animation`:如 `fade-up` / `fade-left` / `fade-right` / `line-reveal` / `step-reveal` / `none`。落到 HTML 时对应 `data-anim` / `data-animate`:

- `fade-up` → `data-anim`
- `fade-left` → `data-anim="left"`
- `fade-right` → `data-anim="right"`
- `line-reveal` → section `data-animate="quote"` + 元素 `data-anim="line"`
- `step-reveal` → section `data-animate="pipeline"` + 元素 `data-anim="step"`
- `none` → 不加 `data-anim`

#### 1.5.3 图片需求清单

当 `image_mode=provided` 或 `placeholder` 时,逐页判断是否需要图。支持一页多图,也支持不同图片角色。只规划,不生成。

如果 `image_mode=placeholder`,必须向用户返回这张表,让用户按表找图并放到 `images/`:

```markdown
| 页 | image_id | role | prompt | ratio | filename | path | placement | animation | required |
|---|---|---|---|---|---|---|---|---|---|
| 01 | 01-bg-cover | bg | 抽象电子墨水流体背景,低对比,杂志封面气质 | 16:9 | 01-bg-cover.jpg | images/01-bg-cover.jpg | hero 背景,弱化到 20% | none | optional |
| 03 | 03-main-product | main | 产品界面截图,顶部导航完整,浅色背景,可读 | 16:10 | 03-main-product.png | images/03-main-product.png | 右列主图 | fade-right | required |
| 05 | 05-proof-weibo | proof | 微博账号数据截图,顶部和数字完整 | fixed 26vh | 05-proof-weibo.png | images/05-proof-weibo.png | 3x2 网格第 1 张 | fade-up | required |
```

字段要求:

- `role`:必须是 `bg` / `main` / `support` / `deco` / `proof` / `portrait` / `logo` 之一。
- `prompt`:描述图片内容、风格、构图、禁止项;不要写"生成一张图"这种执行指令。
- `ratio`:只用标准值 `16:9` / `16:10` / `4:3` / `3:2` / `3:4` / `1:1` / `fixed 26vh`。
- `filename`:必须与 `path` 最后一段一致,页号补零,英文小写,用连字符。
- `placement`:写清在页面的位置和层级,如"背景层,文字下方,透明度 18%"、"右列主图"、"标题旁装饰"。
- `required`:正文证据图、截图、人物照片通常是 required;纯装饰图和背景图可 optional。

如果 `image_mode=text_only`,不要输出假图片需求,改输出:

```markdown
图片策略: text_only
本 deck 不添加图片。以下页面原本可用图片增强,但已改为纯排版表达:
| 页 | 原可用图片 | 替代方案 |
|---|---|---|
| 03 | 产品界面截图 | 改用 3 个关键指标 + 一句 quote |
```

#### 1.5.4 图片层级

按层级规划图片,避免图片抢字:

| 层级 | 用途 | HTML / CSS 建议 |
|---|---|---|
| `background` | hero 背景、氛围图 | 放在 slide 内第一个视觉元素,低透明度,不要压过文字 |
| `content` | 主图、截图、人物、证据 | 用 `.frame-img`,必须有 caption 和 alt |
| `decoration` | 纹理、箭头、局部形状 | 面积小、低对比,不承载核心信息 |

背景图和装饰图必须满足:即使删除,页面文案仍然完整;如果影响阅读,宁可不用。

#### 1.5.5 HTML 缺图占位

如果图片文件还不存在,仍然把 HTML 路径写好,并给 `<figure>` 增加图片元数据。模板会在图片加载失败时自动绘制半透明缺图层:

```html
<figure
  class="frame-img"
  style="aspect-ratio:16/10; max-height:56vh"
  data-image-id="03-main-product"
  data-role="main"
  data-ratio="16:10"
  data-prompt="产品界面截图,顶部导航完整,浅色背景,可读"
  data-missing-label="03-main-product · images/03-main-product.png"
  data-anim="right">
  <img src="images/03-main-product.png" alt="产品界面截图">
  <figcaption class="img-cap">Product · Interface Proof</figcaption>
</figure>
```

不要为了消除 broken image 而删除 `<img>`。缺图状态本身就是给用户补素材的提示。

### Step 2 · 拷贝模板

从 `assets/template.html` 拷贝一份到目标位置（通常是 `项目/XXX/ppt/index.html`），同时在同级建一个 `images/` 文件夹准备接图片。若已经完成 Step 1.5,把图片需求清单另存为 `image-plan.md` 或写进项目记录,方便用户逐项补图。

```bash
mkdir -p "项目/XXX/ppt/images"
cp "<SKILL_ROOT>/assets/template.html" "项目/XXX/ppt/index.html"
```

`template.html` 是一个**完整可运行**的文件——CSS、WebGL shader、翻页 JS、字体/图标 CDN 全已预设好，只有 `<main id="deck">` 里面是 3 个示例 slide（封面、章节幕封、空白填充页）。

#### 2.1 · 必改占位符（**容易漏**）

拷贝后立刻改掉以下占位符，否则浏览器 Tab 会显示"[必填] 替换为 PPT 标题"这种尴尬文字：

| 位置 | 原始 | 需改为 |
|------|------|--------|
| `<title>` | `[必填] 替换为 PPT 标题 · Deck Title` | 实际 deck 标题(如 `一种新的工作方式 · Luke Wroblewski`) |

每次拷贝完 template.html 第一件事:grep 一下"[必填]" 确认全部替换完。

#### 2.2 · 选定主题色(5 套预设 · 不允许自定义)

本 skill **只允许从 5 套精心调配的预设里选一套**,不接受用户自定义 hex 值——颜色搭配错了画面瞬间变丑,保护美学比给自由更重要。

| # | 主题 | 适合 |
|---|------|------|
| 1 | 🖋 墨水经典 | 通用 / 商业发布 / 不知道选啥的默认 |
| 2 | 🌊 靛蓝瓷 | 科技 / 研究 / 数据 / 技术发布会 |
| 3 | 🌿 森林墨 | 自然 / 可持续 / 文化 / 非虚构 |
| 4 | 🍂 牛皮纸 | 怀旧 / 人文 / 文学 / 独立杂志 |
| 5 | 🌙 沙丘 | 艺术 / 设计 / 创意 / 画廊 |

**操作**:
1. 基于内容主题推荐一套,或直接问用户选哪一套
2. 打开 `references/themes.md`,找到对应主题的 `:root` 块
3. **整体替换** `assets/template.html`(已拷贝版本)开头 `:root{` 块里标有"主题色"注释的那几行(`--ink` / `--ink-rgb` / `--paper` / `--paper-rgb` / `--paper-tint` / `--ink-tint`)
4. 其他 CSS 都走 `var(--...)`,无需任何其他改动

**硬规则**:
- 一份 deck 只用一套主题,不要中途换色
- 不要接受用户给的任意 hex 值——委婉拒绝并展示 5 套让选
- 不要混搭(例如 ink 取墨水经典、paper 取沙丘)——会彻底违和

### Step 3 · 填充内容

先基于 Step 1.5 的 `visual_intent`、`motion_level`、图片需求清单写 slide,再挑布局。每一页都要能回答三个问题:

1. 这一页是否需要图片?如果需要,需要几张?
2. 每张图片的角色是什么:背景、主图、辅助图、装饰图、证据图、人物、logo?
3. 图片和文字谁是主角?图片是否会影响阅读?

#### 3.0 · 预检:类名必须在 template.html 里有定义（**最重要**）

**这是所有生成问题的源头**。layouts.md 的骨架使用了很多类名(`h-hero` / `h-xl` / `stat-card` / `pipeline` / `grid-2-7-5` 等),如果 `assets/template.html` 的 `<style>` 里没有对应定义,浏览器会 fallback 到默认样式——大标题变成非衬线、数据卡片挤成一团、pipeline 糊成一行、图片堆到页面底部。

**在写任何 slide 代码之前:**

1. **先 Read `assets/template.html`**(至少读到 `<style>` 块末尾)
2. **对照 layouts.md 的 Pre-flight 列表**,确认你要用的每个类都在 `<style>` 里存在
3. 如果某个类缺失:**在 template.html 的 `<style>` 里补上**,不要在每个 slide 里 inline 重写
4. **template.html 是唯一的类名来源**——不要发明新类名,如需自定义用 `style="..."` inline

常见容易遗漏的类(必须预先确认存在):
`h-hero` / `h-xl` / `h-sub` / `h-md` / `lead` / `kicker` / `meta-row` / `stat-card` / `stat-label` / `stat-nb` / `stat-unit` / `stat-note` / `pipeline-section` / `pipeline-label` / `pipeline` / `step` / `step-nb` / `step-title` / `step-desc` / `grid-2-7-5` / `grid-2-6-6` / `grid-2-8-4` / `grid-3-3` / `grid-6` / `grid-3` / `grid-4` / `frame` / `frame-img` / `img-cap` / `callout` / `callout-src` / `chrome` / `foot`

#### 3.0.5 · 规划主题节奏（**和类预检同等重要**)

**在挑布局之前**,必须先列出每一页的主题 class(`hero dark` / `hero light` / `light` / `dark`)并写到文档或草稿里对齐。详细规则看 `references/layouts.md` 开头的"主题节奏规划"一节。

**强制规则**:

- 每页 section 必须带 `light` / `dark` / `hero light` / `hero dark` 之一,不要只写 `hero`
- 连续 3 页以上同主题 = 视觉疲劳,不允许
- 8 页以上必须有 ≥1 个 `hero dark` + ≥1 个 `hero light`
- 整个 deck 不能只有 `light` 正文页,必须有 `dark` 正文页制造呼吸
- 每 3-4 页插入 1 个 hero 页(封面/幕封/问题/大引用)

**生成后自检**:`grep 'class="slide' index.html` 列出所有主题,人工确认节奏合理再交付。

#### 3.1 · 挑布局

**不要从零写 slide**。打开 `references/layouts.md`,里面有 10 种现成布局骨架,每种都是完整可粘贴的 `<section>` 代码块:

| Layout | 用途 |
|---|---|
| 1. 开场封面 | 第 1 页 |
| 2. 章节幕封 | 每幕开场 |
| 3. 数据大字报 | 抛硬数据 |
| 4. 左文右图(Quote + Image) | 身份反差 / 故事 |
| 5. 图片网格 | 多图对比 / 截图实证 |
| 6. 两列流水线(Pipeline) | 工作流程 |
| 7. 悬念收束 / 问题页 | 幕末 / 收尾 |
| 8. 大引用页(Big Quote) | 衬线金句 / takeaway |
| 9. 并列对比(Before / After) | 旧模式 vs 新模式 |
| 10. 图文混排(Lead Image + Side Text) | 信息密集的图文页 |

选对应 layout,粘过去,改文案和图片路径即可。**务必先完成 3.0 预检**。

#### 3.2 · 图片比例规范

永远用**标准比例**,不要用原图奇葩比例(如 `2592/1798`):

| 场景 | 推荐比例 |
|------|---------|
| 左文右图 主图 | 16:10 或 4:3 + `max-height:56vh` |
| 图片网格(多图对比) | **固定 `height:26vh`**,不用 aspect-ratio |
| 左小图 + 右文字 | 1:1 或 3:2 |
| 全屏主视觉 | 16:9 + `max-height:64vh` |
| 图文混排小插图 | 3:2 或 3:4 |

**图片绝不使用 `align-self:end`**——会滑到 cell 底被浏览器工具栏遮挡。用 grid 容器 + `align-items:start`(template 已预设)让图片贴顶即可;左列若想贴底,用 flex column + `justify-content:space-between`。

组件细节(字体、颜色、网格、图标、callout、stat-card 等)在 `references/components.md`。

### Step 4 · 对照检查清单自检

生成完一定要打开 `references/checklist.md`，逐项对照。里面总结了**真实迭代过程中踩过的所有坑**，P0 级别的问题（emoji、图片撑破、标题换行、字体分工）必须全部通过。

特别要注意的几条：

1. **大标题必须是衬线字体**——如果显示成非衬线,99% 是 Step 3.0 预检没做,`h-hero` 类在 template.html 里缺失
2. **图片网格里只用 `height:Nvh`,不用 `aspect-ratio`**(会撑破)
3. **图片不能堆到页面底部**——不要用 `align-self:end`,用 grid + `align-items:start`(见 Step 3.2)
4. **图片只能用标准比例**(16:10 / 4:3 / 3:2 / 1:1 / 16:9),不要复制原图的奇葩比例
5. **中文大标题 ≤ 5 字且 `nowrap`**(避免 1 字 1 行)
6. **用 Lucide,不用 emoji**
7. **标题用衬线,正文用非衬线,元数据用等宽**

#### 4.1 · 用户补图后的图片验收

当用户把图片放入 `images/` 后,必须进行一次图片专项检查。不要只看文件是否存在。

检查项:

| 项 | 怎么查 | 不通过时怎么处理 |
|---|---|---|
| 缺失 | 对照 `image-plan.md` / HTML 中 `images/...` 路径,确认文件存在 | 保留缺图占位,告诉用户缺哪些文件 |
| 比例 | 读取图片尺寸,和 `data-ratio` / 规划比例比较 | 建议裁切到标准比例,不要改成原图奇葩比例 |
| 命名 | 文件名是否 `{页号}-{角色}-{语义}.{ext}` | 要求重命名或同步更新 HTML 路径 |
| 风格一致性 | 是否同一套摄影/截图/插画语言,明暗和颗粒感是否一致 | 退回风格突兀的图,或降低为装饰/删除 |
| 内容关联性 | 图片是否直接支撑本页 `visual_intent` | 无关图不要硬放,宁可用纯排版 |
| 阅读影响 | 图片是否压住标题、降低对比、抢走主文注意力 | 降低透明度、移到装饰层、缩小或删掉 |
| 裁切 | 顶部/左右是否完整,截图标题栏是否被切 | 调整 `object-position` 或换裁切版本 |

可用检查输出格式:

```markdown
图片验收结果:
- 通过: 8/10
- 缺失: `images/05-proof-wechat.png`, `images/09-deco-map.png`
- 比例需调整: `images/03-main-product.png` 当前 1240x900,建议裁成 16:10
- 风格风险: 第 7 页人物图偏商业棚拍,和电子墨水杂志风不一致
- 阅读风险: 第 1 页背景图中心高亮压住标题,建议透明度降到 12-16%
```

### Step 5 · 本地预览

直接在浏览器打开 `index.html` 就行。macOS 下：

```bash
open "项目/XXX/ppt/index.html"
```

不需要本地服务器。图片走相对路径 `images/xxx.png`。

### Step 6 · 迭代

根据用户反馈修改——模板的 CSS 已经高度参数化，90% 的调整都是改 inline style（字号 `font-size:Xvw` / 高度 `height:Yvh` / 间距 `gap:Zvh`）。

---

## 资源文件导览

```
guizang-ppt-skill/
├── SKILL.md              ← 你正在读
├── assets/
│   ├── template.html     ← 完整的可运行模板（种子文件）
│   └── motion.min.js     ← Motion One 本地副本（离线兜底,约 64KB）
└── references/
    ├── components.md     ← 组件手册（字体、色、网格、图标、callout、stat、pipeline、动效...）
    ├── image-workflow.md ← 图片规划与验收（prompt、角色、比例、缺图占位、补图检查）
    ├── layouts.md        ← 10 种页面布局骨架（可直接粘贴,含动效标记）
    ├── themes.md         ← 5 套主题色预设（只能选不能自定义）
    └── checklist.md      ← 质量检查清单（P0/P1/P2/P3 分级）
```

**加载顺序建议**：
1. 先读完 `SKILL.md`(这个文件)了解整体
2. Step 1 需求澄清完成后,读 `themes.md` 帮用户选定一套主题色
3. 读 `image-workflow.md` 生成每页 `visual_intent`、`motion_level` 和图片需求清单
4. **动手前 Read `assets/template.html` 的 `<style>` 块**——这是类名的唯一来源,缺类会导致整页样式崩
5. 读 `layouts.md` 挑布局(顶部有 Pre-flight 类名清单、主题节奏规划、动效 recipe 决策树)
6. 细节调整时读 `components.md` 查组件(含 Motion 动效系统章节)
7. 生成后读 `checklist.md` 自检(顶部 P0-0 规则强制预检 + 图片验收 + 动效自检块)

**动效相关**:模板已把 Motion One 的加载和 5 种 recipe 逻辑全部内嵌到 `template.html` 底部的 module script。你不需要改 JS,只需要按 `layouts.md` 的骨架在 HTML 里加 `data-anim` / `data-animate` 即可。离线演示靠 `assets/motion.min.js`,断网时自动降级为"无动画但内容可读"。

## 核心设计原则（哲学）

> 这些原则是"一人公司"分享 PPT 的 5 轮迭代总结出来的。违反其中任何一条，视觉感都会垮。

1. **克制优于炫技** — WebGL 背景只在 hero 页透出，普通页几乎看不见
2. **结构优于装饰** — 不用阴影、不用浮动卡片、不用 padding box，一切信息靠**大字号 + 字体对比 + 网格留白**
3. **内容层级由字号和字体共同定义** — 最大衬线 = 主标题，中衬线 = 副标，大非衬线 = lead，小非衬线 = body，等宽 = 元数据
4. **图片是第一公民** — 图片只裁底部，保证顶部和左右完整；网格用 `height:Nvh` 固定，不要用 `aspect-ratio` 撑
5. **节奏靠 hero 页** — hero 和 non-hero 交替，才不累眼睛
6. **术语统一** — Skills 就是 Skills，不要中英混合翻译

## 参考作品

本 skill 的视觉基调参考了：

- 歸藏 "一人公司：被 AI 折叠的组织" 分享（2026-04-22，27 页）
- *Monocle* 杂志的版式
- YC 总裁 Garry Tan "Thin Harness, Fat Skills" 那篇博客的 demo

可以把它们当做风格锚点。
