# 图片规划与验收（Image Workflow）

这个 skill 不调用生图 API,也不真正生成图片。它只负责判断每页是否需要图片、写清 prompt 与规格、在 HTML 中放好路径和缺图占位,并在用户补图后检查质量。

在构建大纲时,如果用户没有准备图片,必须先确认图片策略:

| image_mode | 含义 | 后续行为 |
|---|---|---|
| `provided` | 用户已经有图片 | 使用真实路径,检查比例/命名/风格 |
| `placeholder` | 用户没有图片,但希望后面补图 | 输出图片需求清单,HTML 显示半透明缺图占位 |
| `text_only` | 用户没有图片,也不需要补图 | 不输出图片需求,不在 HTML 中添加图片占位 |

若用户没有明确选择,先问清楚。用户说"你看着办"时,可默认 `placeholder`,但必须说明这只是补图空缺,不是生成图片。

---

## 1. 每页规划字段

每页都要有:

| 字段 | 说明 | 示例 |
|---|---|---|
| `visual_intent` | 这一页的视觉任务 | 用一张产品截图证明工具已经可用,不是概念 |
| `motion_level` | `S` / `L` / `M` / `H` | `L` |
| `images` | 本页需要的图片数组,可为空 | 见下方 |
| `elements.animation` | 每个主要元素的动效 | `title: fade-up`, `image: fade-right` |

`image_mode=text_only` 时,`images` 应为空,并用纯排版替代图文页。

页面规划示例:

```yaml
slide: 03
layout: left-text-right-image
visual_intent: 用真实界面截图建立可信度,让"已经做出来了"成为第一感受
motion_level: L
elements:
  kicker:
    animation: fade-up
  title:
    animation: fade-up
  lead:
    animation: fade-up
  main_image:
    animation: fade-right
images:
  - image_id: 03-main-product
    role: main
    prompt: 产品界面截图,浅色背景,顶部导航完整,关键数据可读,不要透视变形
    ratio: 16:10
    filename: 03-main-product.png
    path: images/03-main-product.png
    placement: 右列主图,content 层,caption 标注产品名
    required: true
```

---

## 2. 图片角色

| role | 用途 | 注意 |
|---|---|---|
| `bg` | 背景图 / 氛围图 | 必须低对比,不能影响阅读 |
| `main` | 本页主图 | 需要 caption 和 alt,承载核心证据 |
| `support` | 辅助解释图 | 面积小于主图,不要抢标题 |
| `deco` | 装饰图 / 纹理 / 局部符号 | 删除后页面仍应完整 |
| `proof` | 证据截图 / 数据截图 | 顶部和关键数字必须完整 |
| `portrait` | 人物照片 | 眼睛、面部不能被裁,风格要克制 |
| `logo` | 品牌标识 | 用 PNG/SVG,留足安全边距 |

一页可以多图,但每张都必须有独立 `image_id`、`role`、`prompt`、`ratio`、`filename`、`path`、`placement`、`animation`。

---

## 3. 比例与尺寸

只使用标准比例:

| 场景 | ratio |
|---|---|
| hero 背景 | `16:9` |
| 左文右图主图 | `16:10` / `4:3` |
| 图文混排辅助图 | `3:2` / `3:4` / `1:1` |
| 人物头像或 logo 容器 | `1:1` |
| 多截图网格 | `fixed 26vh` |

不要把原图尺寸直接写进 `aspect-ratio`,例如 `2592/1798`。

---

## 4. HTML 标记

图片未到位时也写真实路径,让模板自动显示缺图占位:

```html
<figure
  class="frame-img"
  style="aspect-ratio:16/10; max-height:56vh"
  data-image-id="03-main-product"
  data-role="main"
  data-ratio="16:10"
  data-prompt="产品界面截图,浅色背景,顶部导航完整,关键数据可读,不要透视变形"
  data-missing-label="03-main-product · images/03-main-product.png"
  data-anim="right">
  <img src="images/03-main-product.png" alt="产品界面截图">
  <figcaption class="img-cap">Product · Interface Proof</figcaption>
</figure>
```

如果是纯占位草稿,可以用:

```html
<div
  class="img-slot is-missing r-4x3"
  data-image-id="04-support-map"
  data-role="support"
  data-ratio="4:3"
  data-missing-label="MISSING · 04-support-map · images/04-support-map.png">
  <span class="plus">+</span>
  <span class="label">04-support-map</span>
</div>
```

优先使用 `<figure class="frame-img"> + <img>`。`img-slot` 只用于早期草稿或装饰层占位。

---

## 5. 最终验收输出

用户补图后,检查并返回:

```markdown
图片验收结果:
- 文件完整性:
- 比例:
- 命名:
- 风格一致性:
- 内容关联性:
- 阅读影响:
- 需要用户处理:
```

不合格图片不要硬塞进 deck。图片没有帮助时,让版式自己成立。
