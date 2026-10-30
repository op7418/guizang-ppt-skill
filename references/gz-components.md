# 组件参考

由 `scripts/docs.mjs` 从 `components/render.mjs` 生成，不要手改。

用法：页面根节点写 `<html data-family="magazine|swiss" data-medium="slide|card|page" data-theme="…">`，
引入 `gz-<family>.css`、`gz-<family>-<medium>.css`、`gz-components.css`。组件只管布局和颜色，
字号来自 `gz-t-<角色>` 类，所以同一段 HTML 在 PPT、卡片、网页里会自动换成各自的字号和排法。
反色块加 `data-surface="ink|accent|paper-2"`，块内文字颜色自动切换；整张强调色或墨色的卡片 / 页面，把它加在 `<section class="poster">` 或 `<section class="slide">` 上。
强调色当文字色时不要直接写 `var(--accent)`：小字用 `.gz-c-accent`（`--accent-ink`），大字和大数字用 `.gz-c-accent-display`（`--accent-display`）。
条目清单的编号用 `gz-t-label`，大数字组件把数字角色类（如 `gz-t-num-l`）加在 `.gz-stat__value` 上，单位按它的 0.4 倍显示。

## 页眉页脚 · `chrome`

| 字段 | 说明 |
|---|---|
| `left` | 左侧文字（数组） |
| `right` | 右侧文字（数组） |
| `pos` | top \| bottom |
| `accentFirst` | 左侧第一项用强调色 |

```html
<div class="gz-chrome gz-t-meta" data-pos="top">
  <div class="gz-chrome__group">
    <span class="gz-chrome__accent">Issue 07</span>
    <span>Numbers</span>
  </div>
  <div class="gz-chrome__group">
    <span>02 / 08</span>
  </div>
</div>
```

## 封面 · `cover`

| 字段 | 说明 |
|---|---|
| `kicker` | 眉题 |
| `title` | 标题，可用 `<br>` 断行 |
| `sub` | 副标题 |
| `meta` | 底部信息（数组） |
| `surface` | ink \| accent（可选） |

文案上限：
- `title`：card 每行 ≤ 8 字，≤ 2 行；slide 每行 ≤ 12 字，≤ 2 行；page ≤ 30 字

```html
<header class="gz-cover">
  <div class="gz-cover__kicker gz-t-label">Issue 07 · AI Weekly</div>
  <div class="gz-cover__body">
    <h1 class="gz-cover__title gz-t-display-zh" style="--chars:7.10">模型越来越便宜<br>Agent 才刚开始</h1>
    <div class="gz-cover__rule">
    </div>
    <p class="gz-cover__sub gz-t-lead">推理成本一年降了一个数量级，真正改变工作方式的是能连续工作的系统。</p>
  </div>
  <div class="gz-cover__meta gz-chrome gz-t-meta">
    <div class="gz-chrome__group">
      <span>歸藏</span>
      <span>2026.10.30</span>
      <span>内容生产 · 第 7 期</span>
    </div>
  </div>
</header>
```

## 大数字 · `stats`

| 字段 | 说明 |
|---|---|
| `items` | [{ label, value, unit, note, accent }]，1–4 个 |

文案上限：
- `value`：数字 ≤ 4 位，单位单独写在 unit 里

```html
<div class="gz-stats" data-count="3">
  <div class="gz-stat">
    <div class="gz-stat__label gz-t-label">推理成本</div>
    <div class="gz-stat__value gz-t-num-l">
      <span class="gz-stat__num">−92</span>
      <span class="gz-stat__unit">%</span>
    </div>
    <p class="gz-stat__note gz-t-small">同等能力的模型，每百万 token 价格</p>
  </div>
  <div class="gz-stat is-accent">
    <div class="gz-stat__label gz-t-label">Agent 起草</div>
    <div class="gz-stat__value gz-t-num-l">
      <span class="gz-stat__num">87</span>
      <span class="gz-stat__unit">%</span>
    </div>
    <p class="gz-stat__note gz-t-small">本栏目选题由 Agent 起草初稿</p>
  </div>
  <div class="gz-stat">
    <div class="gz-stat__label gz-t-label">单次任务</div>
    <div class="gz-stat__value gz-t-num-l">
      <span class="gz-stat__num">3.5</span>
      <span class="gz-stat__unit">h</span>
    </div>
    <p class="gz-stat__note gz-t-small">Agent 不间断工作的中位时长</p>
  </div>
</div>
```

## 引言 · `quote`

| 字段 | 说明 |
|---|---|
| `text` | 引文，可用 `<br>` 断行 |
| `source` | 出处 |

文案上限：
- `text`：card ≤ 3 行；slide ≤ 3 行；page ≤ 80 字

```html
<figure class="gz-quote">
  <blockquote class="gz-quote__text gz-t-quote">
    <p>好的工具不替你做决定，<br>而是让你更快看清<br>该做什么决定。</p>
  </blockquote>
  <figcaption class="gz-quote__source gz-t-meta">歸藏 · Next Token 第 31 期</figcaption>
</figure>
```

## 流程 · `process`

| 字段 | 说明 |
|---|---|
| `steps` | [{ title, desc }]，3–5 步 |

```html
<ol class="gz-process" style="--n:4">
  <li class="gz-process__step">
    <span class="gz-process__nb gz-t-label">01</span>
    <h3 class="gz-process__title gz-t-heading">去 AI 味</h3>
    <p class="gz-process__desc gz-t-small">先过一遍 Humanizer，统一语气。</p>
  </li>
  <li class="gz-process__step">
    <span class="gz-process__nb gz-t-label">02</span>
    <h3 class="gz-process__title gz-t-heading">锁定主题</h3>
    <p class="gz-process__desc gz-t-small">读取工作区 theme.json，所有产出同一套色板。</p>
  </li>
  <li class="gz-process__step">
    <span class="gz-process__nb gz-t-label">03</span>
    <h3 class="gz-process__title gz-t-heading">并行生成</h3>
    <p class="gz-process__desc gz-t-small">长文网页、小红书图文、公众号封面同时出。</p>
  </li>
  <li class="gz-process__step">
    <span class="gz-process__nb gz-t-label">04</span>
    <h3 class="gz-process__title gz-t-heading">入库归档</h3>
    <p class="gz-process__desc gz-t-small">素材按栏目进展示库，可以一键做同款。</p>
  </li>
</ol>
```

## 对比 · `compare`

| 字段 | 说明 |
|---|---|
| `before` | { tag, title, desc, list } |
| `after` | 同 before |
| `afterSurface` | 瑞士风可给 after 加 ink / accent 底 |

```html
<div class="gz-compare">
  <section class="gz-compare__side" data-side="before">
    <div class="gz-compare__tag gz-t-label">Before</div>
    <h3 class="gz-compare__title gz-t-heading">三个 skill 各管各的</h3>
    <ul class="gz-compare__list gz-t-small">
      <li>每次重新选风格</li>
      <li>配色对不上</li>
      <li>字号文档和模板不一致</li>
    </ul>
  </section>
  <div class="gz-compare__rule">
  </div>
  <section class="gz-compare__side" data-side="after">
    <div class="gz-compare__tag gz-t-label">After</div>
    <h3 class="gz-compare__title gz-t-heading">一套 token 驱动三种产出</h3>
    <ul class="gz-compare__list gz-t-small">
      <li>主题一次锁定</li>
      <li>对比度构建时校验</li>
      <li>字体按需内置</li>
    </ul>
  </section>
</div>
```

## 图框 · `figure`

| 字段 | 说明 |
|---|---|
| `src` | 图片地址 |
| `alt` | 替代文字 |
| `kind` | photo \| screenshot |
| `ratio` | 16x9 \| 16x10 \| 4x3 \| 3x2 \| 1x1 \| 3x4 \| 21x9 |
| `idx` | 编号，如 Fig.1 |
| `caption` | 说明 |

```html
<figure class="gz-figure" data-kind="screenshot" data-ratio="16x10">
  <div class="gz-figure__well">
    <img src="assets/screenshot.png" alt="">
  </div>
  <figcaption class="gz-figure__cap gz-t-caption">
    <span class="gz-figure__idx">Fig.1</span>
    <span>瑞士风 4 个主题的小红书卡片样张</span>
  </figcaption>
</figure>
```

## 图片网格 · `gallery`

| 字段 | 说明 |
|---|---|
| `items` | [figure 的数据]，2–6 张 |
| `cols` | 列数（幻灯片 / 网页） |

```html
<div class="gz-gallery" data-count="3">
  <figure class="gz-figure" data-kind="photo" data-ratio="4x3">
    <div class="gz-figure__well">
      <img src="assets/forest-ink.webp" alt="">
    </div>
    <figcaption class="gz-figure__cap gz-t-caption">
      <span class="gz-figure__idx">01</span>
      <span>森林墨</span>
    </figcaption>
  </figure>
  <figure class="gz-figure" data-kind="photo" data-ratio="4x3">
    <div class="gz-figure__well">
      <img src="assets/kraft-paper.webp" alt="">
    </div>
    <figcaption class="gz-figure__cap gz-t-caption">
      <span class="gz-figure__idx">02</span>
      <span>牛皮纸</span>
    </figcaption>
  </figure>
  <figure class="gz-figure" data-kind="photo" data-ratio="4x3">
    <div class="gz-figure__well">
      <img src="assets/indigo-porcelain.webp" alt="">
    </div>
    <figcaption class="gz-figure__cap gz-t-caption">
      <span class="gz-figure__idx">03</span>
      <span>靛蓝瓷</span>
    </figcaption>
  </figure>
</div>
```

## 条目清单 · `ledger`

| 字段 | 说明 |
|---|---|
| `rows` | [{ title, note, value }]，3–6 行 |

```html
<ol class="gz-ledger">
  <li class="gz-ledger__row">
    <span class="gz-ledger__nb gz-t-label">01</span>
    <div>
      <div class="gz-ledger__title gz-t-heading">共享组件库</div>
      <p class="gz-ledger__note gz-t-small">九个组件覆盖三个 skill 的重叠部分</p>
    </div>
    <span class="gz-ledger__value gz-t-meta">进行中</span>
  </li>
  <li class="gz-ledger__row">
    <span class="gz-ledger__nb gz-t-label">02</span>
    <div>
      <div class="gz-ledger__title gz-t-heading">特效库</div>
      <p class="gz-ledger__note gz-t-small">WebGL 背景、ASCII 呼吸场、点阵</p>
    </div>
    <span class="gz-ledger__value gz-t-meta">11 月</span>
  </li>
  <li class="gz-ledger__row">
    <span class="gz-ledger__nb gz-t-label">03</span>
    <div>
      <div class="gz-ledger__title gz-t-heading">迁移 PPT</div>
      <p class="gz-ledger__note gz-t-small">逐页截图对比，视觉不回退</p>
    </div>
    <span class="gz-ledger__value gz-t-meta">11 月</span>
  </li>
  <li class="gz-ledger__row">
    <span class="gz-ledger__nb gz-t-label">04</span>
    <div>
      <div class="gz-ledger__title gz-t-heading">插件与展示库</div>
      <p class="gz-ledger__note gz-t-small">DeepSeek Harness</p>
    </div>
    <span class="gz-ledger__value gz-t-meta">12 月</span>
  </li>
</ol>
```
