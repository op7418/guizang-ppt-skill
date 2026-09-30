# Swiss Layout Lock

本文件是瑞士主题的硬约束。它的目的不是增加灵感,而是防止生成时“看起来像 Swiss,但已经脱离原始模板”。

## Golden Source

版式基准是仓库内的 `assets/template-swiss.html`(由作者原始参考 PPT 派生;原始文件不随仓库分发,本文件登记的 S01-S22 即其版式快照)。

瑞士主题生成时,除用户明确要求实验版式外,只能从下面登记的 22 个版式中选择。新增首页/尾页可以使用 Skill 里的 IKB ASCII 版本,但正文页必须来自这 22 个版式。

## 生成前硬规则

1. 每个正文页都必须先选一个登记版式,并在 `<section>` 上写 `data-layout="Sxx"`。
2. 不允许临时发明 `P23/P24` 这类未出现在原始 22P 的正文结构。需要图片时,优先使用 `S22 Image Hero`;多图时使用 `S15/S16` 的原始网格骨架做图片格改造,不要发明新的证据墙。唯一登记的交互扩展是 `S08 + Swiss Map Component`,详见 `references/swiss-map-component.md`。
3. 顶部中文标题默认左对齐并贴近左上内容轴。除原始 `S03/S09/S10` 这种 statement/split 版式外,不要把大标题放到页面水平中心。
4. SVG 只能负责几何线条、圆、箭头、路径。不要在 SVG 里写可见文字;所有文字标签用 HTML 放在网格、卡片或 caption 里。
5. 图片槽位和图片生成比例必须绑定。先确定版式和槽位,再生成图片。

## 登记版式

| ID | 原始页 | 名称 | 必须保留的骨架 | 图片规则 |
|---|---:|---|---|---|
| S01 | 01 | Index Cover | 三行 `cover-row`,左大编号,右大标题 | 无 |
| S02 | 02 | Vertical Timeline + KPI | 顶部左对齐标题,中部 `.timeline-v`,底部 `.kpi-row-4` | 无 |
| S03 | 03 | Split Statement | `.slide.split` 双半屏,左巨字,右灰底解释 | 无 |
| S04 | 04 | Six Cells | 顶部左对齐标题,下方 `.sub-grid-3-2` 六卡 | 可把卡片内部换成小图标,不放大图 |
| S05 | 05 | Three Layers | 顶部左对齐标题,下方 `.stack-row` 三大块 | 无 |
| S06 | 06 | KPI Tower | 左标题+右说明,下方不等高 KPI 塔 | 无 |
| S07 | 07 | Horizontal Bar | 左对齐标题,横向条形图 | 无 |
| S08 | 08 | Duo Compare | `.duo-compare` 两列 + 中线 | 无;地点/路线内容可使用 `S08 + Swiss Map Component` 替换右侧插槽 |
| S09 | 09 | Dot Matrix Statement | 大号 statement + 点阵装饰 | 无 |
| S10 | 10 | Split Closing | `.slide.split` 左巨字右列表 | 无 |
| S11 | 11 | Horizontal Timeline | 原始 `grid-template-columns:auto 1fr` 头部 + `.timeline-h` | 无 |
| S12 | 12 | Manifesto + Ink Banner | 大字 statement + 底部通栏 ink 条 | 无 |
| S13 | 13 | Three Forces | 左 ink hero 块 + 右 3 张卡 | 无 |
| S14 | 14 | Loop Form | 左 4 步列表 + 右几何 loop | SVG 禁止文字,标签改 HTML |
| S15 | 15 | Matrix + Hero Stat | 顶部左对齐标题,中段 6×2 矩阵,底部巨数 | 多图可改造矩阵格;生成图统一 `21:9` / `16:10`,原始截图用 `s15-grid-shot` |
| S16 | 16 | Multi-card Brief | 顶部左对齐标题,下方 3×2 微卡 | 多图可改造卡片内容;生成图统一 `21:9` / `16:10`,原始截图用 `s16-brief-shot` |
| S17 | 17 | System Diagram | 顶部左小标题+右段落,中部几何系统图,底部三列解释 | SVG 禁止文字,标签改 HTML |
| S18 | 18 | Why Now | 三列递进 + 底部巨数 | 无 |
| S19 | 19 | Four Cards | 顶部蓝线 + 四列均分 | 无 |
| S20 | 20 | Stacked KPI Ledger | 纵向账单式巨数 | 无 |
| S21 | 21 | Tech Spec Sheet | 大标题 + 三 KPI + 右下竖线矩阵 | 无 |
| S22 | 22 | Image Hero | 顶部全宽图 + 左上白块标题 + 下方三列 KPI | 主图按 `21:9` 生成,关键主体放中央安全区 |

## 登记扩展组件

### S08 + Swiss Map Component

- 使用场景:地理、历史、城市路线、门店/校区/事件点位、人物住所关系。
- 版式身份:仍是 `data-layout="S08"`,不是新正文页。
- 页面结构:顶部左对齐标题 + 左侧关系/说明卡片 + 右侧 MapLibre 地图卡片。
- 标记结构:点 + 连线 + HTML 卡片;SVG 只画 fallback 关系线,不写文字。
- 交互控制:右上角必须有 `+` / `-` / `DRAG`;默认禁用滚轮缩放和拖动,避免触发 PPT 翻页。
- 详细代码和数据契约见 `references/swiss-map-component.md`。

## 图片槽位规则

### S22 · Hero Strip

- 生成比例: `21:9`
- 图片用途:实拍场景、产品场景、UI 情景图。
- 生成提示词必须包含: `21:9 ultra-wide strip`, `subject centered in the safe middle area`, `no title, no footer, no page chrome, no logo, no border`.
- HTML 容器必须使用原始 S22 的顶部全宽图骨架;不要改成普通居中大图。
- 照片用 `object-fit:cover;object-position:center 35%`。如果是人像/会议场景,不要用 `top center`。
- 信息图/UI 截图如果放 S22,必须重新生成接近 `21:9`,并用 `object-fit:contain` 或保证核心内容在中央 70% 安全区。

### S15/S16 · Multi Image Grid

先声明图像角色,再选槽位。S15/S16 内每张 `<img>` 都必须声明本页登记的 `data-image-slot`,直接父元素必须是 `.frame-img`;本地、远程或内嵌图片使用同一规则,换槽位名字不能跳过校验。

| 角色 | S15 槽位 | S16 槽位 | 直接父容器 |
|---|---|---|---|
| 按 `21:9` 生成、铺满 | `s15-grid-21x9` | `s16-brief-21x9` | `.frame-img.r-21x9` |
| 按 `16:10` 生成、铺满 | `s15-grid-16x10` | `s16-brief-16x10` | `.frame-img.r-16x10` |
| 原始截图、保真完整显示 | `s15-grid-shot` | `s16-brief-shot` | 推荐 `.frame-img.r-16x10.fit-contain` |

- 生成图必须使用与槽位匹配的比例类,不加 `.fit-contain`,也不设 `height` 或任何 `h-*` 高度类;由比例类决定尺寸,避免 `height:18vh` 这类短槽把长图缩小。
- 原始截图使用 `*-shot` 和 `.fit-contain`,禁止 `.r-21x9`。容器必须有明确尺寸:模板已有的 `.r-16x10` / `.r-16x9` / `.r-4x3` / `.r-3x2` / `.r-3x4` / `.r-1x1`,或 `.h-16` / `.h-18` / `.h-22` / `.h-26` / `.h-28` / `.h-32`,或正值内联 `height`(`px` / `vh` / `vw` / `rem` / `em`),或正值内联 `aspect-ratio`。只有 `height:100%` 或 `min-height` 不能证明容器有尺寸。
- 原始截图的像素比例可以与容器比例不同;`.fit-contain` 保留完整内容,空余部分用主题背景承接。`*-shot` 不是给生成图放宽铺满规则的别名;决定重生成后,应改用对应的生成槽位。
- 同一组必须统一角色、容器比例、高宽和背景。图片格仍吸附原始卡片网格,不要让图片自己决定宽高。
- 如果原始截图比例不可控,先按 `references/screenshot-framing.md` 做程序化比例适配;只有长截图、极窄截图或信息需要重构时,才用 GPT-M 2.0 重生成“截图再设计”。

## 禁止清单

- 禁止 `text-align:center` 用在顶部中文大标题。
- 禁止将顶部标题写进右侧 7.8fr 栏,造成视觉居中。
- 禁止未登记正文页:例如临时 `Swiss Image Split`、`Evidence Grid`、三圆图自绘页。
- 禁止图片容器灰底包白底信息图。
- 禁止 SVG 中出现 `<text>` 作为可见标签。
- 禁止图片默认 `object-position:top center` 用于照片。
