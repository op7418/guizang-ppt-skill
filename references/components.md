# 组件参考 · Components

这是 `guizang-ppt-skill` skill 的组件手册。template.html 已经定义好了所有样式，这里只写"这个组件长什么样、怎么用"。

## 目录

- [基础 Slide 外壳](#基础-slide-外壳)
- [字体 Typography](#字体-typography)
- [Chrome & Foot](#chrome--foot)
- [Callout 引用框](#callout-引用框)
- [Stat 数字矩阵](#stat-数字矩阵)
- [Platform 平台卡](#platform-平台卡)
- [Rowline 表格行](#rowline-表格行)
- [Pillar 支柱卡](#pillar-支柱卡)
- [Tag & Kicker](#tag--kicker)
- [Figure 图片框](#figure-图片框)
- [Icons 图标](#icons-图标)
- [Ghost 巨型背景字](#ghost-巨型背景字)
- [Highlight 荧光标记](#highlight-荧光标记)
- [Motion 动效系统](#motion-动效系统)

---

## 基础 Slide 外壳

每一页都是一个 `<section class="slide ...">`。必须包含 `data-theme` 属性（`light` 或 `dark`），JS 翻页时会根据这个属性切换背景。

```html
<section class="slide light" data-theme="light">   <!-- 浅色页 -->
<section class="slide dark" data-theme="dark">     <!-- 深色页 -->
<section class="slide light hero" data-theme="light">  <!-- Hero 页：浅色 + 薄遮罩透出 WebGL -->
<section class="slide dark hero" data-theme="dark">    <!-- Hero 页：深色 + 薄遮罩 -->
```

**light vs dark 的使用：交替使用**，每 2-3 页切换一次主题，避免连续超过 3 页同色。翻页时 WebGL 背景会自动在两个 shader 之间渐变过渡。

**hero 类的使用**：只给视觉主导的页面加（封面、金句页、章节过渡、结尾）。加 `hero` 后遮罩降到 12-16%，WebGL 背景会大幅透出，所以不要在 hero 页上放太多文字。

---

## 字体 Typography

字体分工是本模板最重要的规则，严禁混用。

| Class | 用途 | 字体 |
|---|---|---|
| `.display` | 超大号英文（Hero 页） | Playfair Display 700, 11vw |
| `.display-zh` | 超大号中文标题 | `--serif-display-zh`, 700, 7.8vw |
| `.h1-zh` | 页面主标题 | `--serif-display-zh`, 700, 4.6vw |
| `.h2-zh` | 副标题 | `--serif-display-zh`, 600, 3.2vw |
| `.h3-zh` | 流水线步骤标题 | `--serif-display-zh`, 500, 1.9vw |
| `.lead` | 引导段（比 body 大） | `--serif-display-zh`, 400, 1.9vw |
| `.body-zh` | **正文/描述（非衬线）** | Noto Sans SC 400, 1.22vw |
| `.body-serif` | 正文（衬线） | Noto Serif SC 400, 1.3vw |
| `.kicker` | 小节提示（标题上方） | IBM Plex Mono, 12px uppercase |
| `.meta` | 元信息标签 | IBM Plex Mono, 0.88vw uppercase |
| `.big-num` | 巨型数字 | Playfair Display 800, 10vw |
| `.mid-num` | 中号数字 | Playfair Display 700, 5.5vw |

**核心规则**：
- **展示衬线**（`serif-display-zh` / `serif-en`）：标题、重点金句、lead、数字 —— 用于"视觉重音"
- **正文衬线**（`serif-zh`）：长段衬线正文。默认是 Noto Serif SC,也作为展示字体的回退
- **非衬线**（`sans-zh`）：正文描述、大段阅读内容 —— 用于"信息密度"
- **等宽**（`mono`）：kicker、meta、foot 的英文标签 —— 用于"装饰节奏"

`--serif-display-zh` 可在主题里指向本机已合法安装的中文展示字体（例如仓耳今楷 / Tsanger Jinkai）。模板不分发商业字体;没装时应自动回落到 `--serif-zh`。

**强调技巧**：
- `<em class="en">英文词</em>` —— 把英文词渲染成 Playfair Display 斜体（很好看）
- `<em style="opacity:.65">短语</em>` —— 让标题后半段淡出，制造节奏

---

## Chrome & Foot

每一页的顶部和底部的元信息条。几乎所有页都应该有。

```html
<div class="chrome">
  <div class="left">
    <span>第一幕 · 硬数据</span>
    <span class="sep"></span>
    <span>Act I</span>
  </div>
  <div class="right"><span>02 / 27</span></div>
</div>

<!-- ... 页面主体 ... -->

<div class="foot">
  <div class="title">项目名 · CodePilot　|　github.com/codepilot</div>
  <div>Act I · Dev Numbers</div>
</div>
```

**规则**：
- `chrome.right` 总是放页码 `NN / TOTAL` （TOTAL 为总页数）
- `foot.title` 是中文说明，`foot.right` 是英文 act 标记
- chrome 和 foot 共同构成杂志感的"页眉页脚"

---

## Callout 引用框

展示金句 / 关键观点 / 他人引言。

```html
<div class="callout" style="max-width:80vw">
  <div class="q-big">"这东西在三年前，<br>需要一个十人团队做一年。"</div>
  <span class="cite">— 一个观察者的判断</span>
</div>
```

变体：
- 不带 cite：去掉 `<span class="cite">` 即可
- 带英文金句：`<em class="en">"Thin Harness, Fat Skills."</em>`
- 在 hero 页使用：外层加 `style="position:relative;z-index:2"`（避免被背景遮罩盖住）

---

## Stat 数字矩阵

展示数据指标，常与 `.grid-6` / `.grid-4` 配合。

```html
<div class="grid-6">
  <div class="stat">
    <span class="m">Duration</span>
    <span class="n">64<em style="font-size:.4em;opacity:.5;font-style:normal"> 天</em></span>
    <span class="l">从 0 到现在</span>
  </div>
  <!-- ... 更多 stat ... -->
</div>
```

三段式结构：`.m` 等宽小标签 → `.n` 巨型数字 → `.l` 描述说明。数字后的单位用 `<em>` 缩小到 0.4em，opacity 0.5。

**常用布局容器**：
- `.grid-6` — 3×2 网格（最常用，6 个 stat）
- `.grid-4` — 2×2 网格（4 个 stat）
- `.grid-3` — 3 等分单行（3 个 stat / pillar）

---

## Platform 平台卡

展示社交平台 / 渠道 + 粉丝数。

```html
<div class="plat">
  <div class="sub">Weibo</div>
  <div class="name">微博</div>
  <div class="nb">289K</div>
</div>
```

可选第四行（补充说明）：
```html
<div class="body-zh" style="font-size:max(11px,.8vw);opacity:.5;margin-top:.6vh">
  含小绿书同步
</div>
```

**"Also On" 变体**（补充平台）：
```html
<div class="plat" style="border-top-style:dashed;opacity:.72">
  <div class="sub">Also On</div>
  <div class="body-zh" style="font-weight:600;margin-top:.8vh">
    B 站　·　知乎
  </div>
</div>
```

---

## Rowline 表格行

列表式内容，每行一个条目。

```html
<div class="rowline">
  <div class="k">CLAUDE.md</div>
  <div class="v">你该怎么做事 —— 行为规则 + 工作偏好 + 禁止事项</div>
  <div class="m">EMPLOYEE · HANDBOOK</div>
</div>
```

三列结构：`.k` 衬线关键词 · `.v` 正文描述 · `.m` 等宽标签（右对齐）。第一个和最后一个 rowline 自动加上下边框。

**变体：2 列**：`style="grid-template-columns:1fr 3fr"` 去掉 `.m` 列。

---

## Pillar 支柱卡

三支柱结构，常用于"概念并列"类型页面。

```html
<div class="grid-3">
  <div class="pillar">
    <div class="ic">01</div>
    <div class="t">三层<br>文档体系</div>
    <div class="d">CLAUDE.md<br>+ 项目知识库<br>+ 护栏文件</div>
  </div>
  <!-- ... 更多 pillar ... -->
</div>
```

**带图标的 pillar（用于强调性页面）**：
```html
<div class="pillar" style="padding:4vh 2vw;border:1px solid currentColor;border-color:rgba(10,10,11,.2)">
  <div class="ic"><i data-lucide="compass" class="ico-lg"></i></div>
  <div class="t">判断力</div>
  <div class="d">决策和方向的权威。<br>取舍、品味、方向感。</div>
</div>
```

`.ic` 可以是序号（`01 / 02 / 03` 或 `A. / B. / C.`），也可以是 Lucide 图标。

---

## Tag & Kicker

**Kicker** 是标题上方的小提示文字（等宽、全大写、小字号）：
```html
<div class="kicker">过去 64 天 · 开发篇</div>
<div class="h1-zh">一个人，做了什么。</div>
```

**Tag** 是独立的标签胶囊（带边框）：
```html
<div style="display:flex;gap:1.6vw;flex-wrap:wrap">
  <div class="tag">早上 10 点起床</div>
  <div class="tag">周二 / 四下午健身</div>
  <div class="tag accent">钛金主题锚点</div>
</div>
```

`.tag.accent` 使用当前主题的 `--accent`,适合钛金开物这类需要一点金色题签的页面。只用 1-2 个,不要整组全加 accent。

---

## Figure 图片框

**这是本模板最容易踩坑的组件，务必遵守以下规则**。

### 基础结构

```html
<figure class="tile">
  <div class="frame-img" style="height:26vh">
    <img src="图片素材/xxx.png" alt="说明">
  </div>
  <figcaption class="frame-cap">
    <span class="pf">推特 · Twitter</span>
    <span class="nb">137K</span>
  </figcaption>
</figure>
```

### 关键约束（血泪经验，不要违反）

1. **图片网格必须用 `height:Nvh` 固定高度**，不要用 `aspect-ratio`。
   - 原因：网格里用 aspect-ratio 容易撑破父容器，导致图片堆叠。
   - 推荐尺寸：`.h-16` (小型面板) / `.h-18` (紧凑条形) / `.h-22` (标准网格) / `.h-26` (突出展示) / `.h-28` (大图)。
   - 单张主图可以用模板提供的比例类：`.r-16x9` / `.r-16x10` / `.r-4x3` / `.r-3x2` / `.r-3x4` / `.r-1x1`。
   - 同一组图片必须使用同一个高度类,不要一张 `25vh`、一张 `21vh` 混用。

2. **`object-position:top center`（已在 CSS 里设好）**，只允许裁掉底部。
   - 严禁裁剪左右和顶部 —— 这是图片的核心身份信息区。

3. **网格里多张图时，用内联 grid 而不是 `grid-3`**：
   ```html
   <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1vh 1.2vw">
     <figure class="tile">...</figure>
     <figure class="tile">...</figure>
     <figure class="tile">...</figure>
   </div>
   ```

4. **图片与布局其他部分对齐**：使用 `.grid-2-7-5` / `.grid-2-6-6` / `.grid-2-8-4` 的 grid 结构自然顶对齐。不要给图片加 `align-self:end`。

5. **信息图 / 截图再设计**：给 `.frame-img` 同时加 `.fit-contain`，避免图内文字和标注被裁切。

6. **用户原始截图比例不合适时**：优先按 `screenshot-framing.md` 做 CleanShot X 式程序化适配;只有截图太长、太窄或需要重构信息时,才重新生成"截图再设计 / UI 情景图"。

### Frame Caption 变体

```html
<!-- 标准：左 figure 名，右数字 -->
<figcaption class="frame-cap">
  <span class="pf">推特 · Twitter</span>
  <span class="nb">137K</span>
</figcaption>

<!-- 带编号 -->
<figcaption class="frame-cap">
  <span class="idx">01</span>
  <span class="pf">AI 润色</span>
  <span>Polish</span>
</figcaption>
```

### 图片占位（设计阶段占位符）

图片还没有就位时，用虚线框占位：
```html
<div class="img-slot r-4x3">  <!-- r-4x3 / r-16x9(default) / r-3x2 / r-1x1 -->
  <span class="plus">+</span>
  <span class="label">GitHub 截图位置</span>
</div>
```

---

## Icons 图标

**严禁使用 emoji**。用 Lucide via CDN（template.html 已引入）。

```html
<i data-lucide="compass" class="ico-lg"></i>     <!-- 大图标（pillar 用） -->
<i data-lucide="target" class="ico-md"></i>      <!-- 中图标（列表项用） -->
<i data-lucide="check-circle" class="ico-sm"></i>  <!-- 小图标（inline 用） -->
```

**常用 Lucide 图标名**（按含义分组）：

- 判断类：`compass`, `target`, `crosshair`, `search-check`
- 关系类：`share-2`, `users`, `network`, `link`, `handshake`
- 品牌类：`crown`, `gem`, `award`, `star`, `badge-check`
- 流程类：`workflow`, `route`, `arrow-right-left`, `repeat`
- 数据类：`grid-2x2`, `bar-chart-3`, `trending-up`, `activity`
- 审美类：`palette`, `brush`, `eye`, `sparkles`
- 对错类：`check-circle`, `x-circle`, `check`, `x`
- 方向类：`arrow-right`, `arrow-up-right`, `corner-down-right`

**图标与文字 inline 组合**：
```html
<div class="h3-zh" style="display:flex;align-items:center;gap:.8em">
  <i data-lucide="target" class="ico-md"></i>
  判断 — 什么值得写
</div>
```

---

## Ghost 巨型背景字

用作"装饰性背景字"，极低透明度，营造杂志感。

```html
<div class="ghost" style="right:-6vw;top:-8vh">BUT</div>
<div class="ghost" style="left:-8vw;bottom:-18vh;font-style:italic">Harness</div>
```

- 字号 34vw，opacity 0.06
- 常用定位：`right:-6vw;top:-8vh`（右上超出）/ `left:-8vw;bottom:-18vh`（左下超出）
- 内容：英文单词或数字（章节序号 01/02/03、关键词 BUT/NOW/HERE）

**注意**：使用 ghost 的页面里，其他内容要加 `position:relative;z-index:2` 避免被压到下面。

---

## Highlight 荧光标记

行内短语的"荧光笔"效果：

```html
<span class="hi">不是</span>
<span class="hi">一次性爆发</span>
```

在文字底部生成一条半透明高亮条。高亮色跟随当前主题的 `--accent`（CSS 已处理）。

**适合场景**：只对关键 1-3 个词使用，不要大面积用。

---

## Motion 动效系统

整套 deck 默认开启翻页入场动画,由 Motion One(vanilla 版 Framer Motion,约 4KB)驱动。

### 加载方式

`assets/template.html` 底部的 module script 会先尝试**本地** `assets/motion.min.js`,失败则回落到 **jsdelivr CDN**,两者都失败则强制把所有带 `data-anim` 的元素设为 `opacity:1`—— 内容永远可读,演示不依赖网络。

```js
// template 里的核心加载器(不用改)
let motion;
try { motion = await import('./assets/motion.min.js'); }
catch(e1) {
  try { motion = await import('https://cdn.jsdelivr.net/npm/motion@11.11.17/+esm'); }
  catch(e2) {
    document.querySelectorAll('[data-anim]').forEach(el=>{el.style.opacity='1';el.style.transform='none'});
  }
}
```

### 数据属性驱动

你只需要在 HTML 里加两种属性:

```html
<!-- 1. 在 section 上选 recipe(可选,默认 cascade / hero 自动) -->
<section class="slide light" data-animate="quote">

<!-- 2. 在需要入场的元素上加 data-anim(可选值:left/right/line/step/divider) -->
<h1 class="h-xl" data-anim>大标题</h1>
<div class="stat-card" data-anim>...</div>
<div data-anim="left">左列内容</div>
<span data-anim="line" style="display:block">引用第一行</span>
```

### 5 种 recipe 一览

| recipe | 触发方式 | 行为 | 代表布局 |
|---|---|---|---|
| `cascade`(默认) | 不加 `data-animate` 即为此值 | 所有 `data-anim` 逐个 stagger 淡入,75ms/step | Layout 3 / 4 / 5 / 10 |
| `hero` | `.hero` slide 自动用此值 | 慢节奏 stagger,仪式感更强,160ms/step | Layout 1 / 2 / 7 |
| `quote` | `data-animate="quote"` | 其他元素先出,`data-anim="line"` 的行 550ms 间隔逐句揭示 | Layout 8 |
| `directional` | `data-animate="directional"` | `data-anim="left"` 从左滑入 → divider → `data-anim="right"` 从右滑入 | Layout 9 |
| `pipeline` | `data-animate="pipeline"` | 翻到此页 step 保持 15% 透明;按 →/空格/滚轮逐个点亮,最后一步才放行翻页 | Layout 6 |

### 给 slide 选 recipe 的决策树

1. **它是 `.hero` slide 吗?** → 不用加 `data-animate`,自动用 `hero`
2. **它是大引用金句页?** → `data-animate="quote"`,每句用 `<span data-anim="line" style="display:block">`
3. **它是左右对比 Before/After?** → `data-animate="directional"`,左列 `data-anim="left"`、右列 `data-anim="right"`
4. **它是流水线分步讲解?** → `data-animate="pipeline"`,每步 `data-anim="step"`
5. **其他所有正文页** → 什么也不加,自动用 `cascade`

### 什么元素该加 `data-anim`?

- ✅ 每一层有独立语义的块:kicker / h1 / h-xl / lead / callout / stat-card / figure / tag / rowline
- ✅ 多列结构里每一列,让它们逐列淡入而不是一起
- ❌ 不要在容器(`.grid-6` / `.frame`)上加,只加给叶子元素
- ❌ 不要在每个 `<li>` 上加,一般在 `<ul>` 层加就够
- ❌ 如果某页不想要任何动画(比如过渡页),整页不加 `data-anim` 即可 — Motion One 只对带标记的元素生效

### 常见问题

- **图片闪一下再出现?** 这是预期行为,翻页中段(450ms 时)触发动画
- **Pipeline 页卡住翻不下页?** 正确的,按 → 一步一步点亮 step,全部点亮后再按 → 才翻页
- **内容静态时也不显示?** 检查 motion.min.js 是否在 `assets/` 下;或者浏览器控制台看错误信息
