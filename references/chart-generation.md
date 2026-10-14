# 数据图表与风格插图

## 选择工具

- 饼图、环形图、柱状图、条形图、折线图：运行 `scripts/render-chart.mjs`，用真实数据确定几何形状与标签；不要调用生图模型重画。
- 概念插画、杂志风配图、瑞士风几何插图：使用当前会话实际提供的 `ImageGen` 工具；不安装生图 Skill 来替代模型能力。
- 同页需要两者：分别生成数据图与插图，再由 HTML 排版，避免让模型改动数据图。
- 用户没有数据时，询问或使用明确标注的演示数据；不要把示例数值写成真实结论。

## 本地制图

使用 Node.js 22+、ECharts、`@napi-rs/canvas` 和 fontkit。ECharts 负责图形，Canvas 在本地渲染 PNG，fontkit 校验字体覆盖；不依赖 Python、浏览器或显示器。依赖锁定在 Skill 根目录的 `package.json` 和 `package-lock.json`，不修改全局 npm 环境。

首次安装或迁移到另一台机器时，在获得安装许可后执行 `npm ci --prefix "<SKILL_ROOT>" --ignore-scripts`；安装需要网络，制图过程不联网、无 API Key。Canvas 包包含平台对应的本地二进制依赖，不是纯 JavaScript 软件渲染器；未支持的平台应明确报告安装/加载失败，不悄悄切回 Python。

将输入保存在演示项目的 `data/`，输出到 `images/`，先确认或创建目录。示例仅为演示数据：

```json
{
  "type": "bar",
  "theme": "swiss-ikb",
  "title": "季度营收对比",
  "labels": ["第一季度", "第二季度", "第三季度"],
  "series": [
    {"name": "去年", "values": [120, 150, 160]},
    {"name": "今年", "values": [140, 180, 210]}
  ],
  "y_label": "营收（万元）",
  "source": "来源：演示数据，不代表真实业务",
  "show_values": true,
  "width": 1600,
  "height": 900
}
```

```bash
node "<SKILL_ROOT>/scripts/render-chart.mjs" \
  --input "<DECK_ROOT>/data/revenue.json" \
  --output "<DECK_ROOT>/images/03-revenue.png"
```

也可读取宽表 CSV：首行是列名，第一列为类别，后续列为数值系列；UTF-8（可带 BOM）。

```csv
季度,去年,今年
第一季度,120,140
第二季度,150,180
第三季度,160,210
```

```bash
node "<SKILL_ROOT>/scripts/render-chart.mjs" \
  --input "<DECK_ROOT>/data/revenue.csv" \
  --type bar --theme swiss-ikb --title "季度营收对比" \
  --y-label "营收（万元）" --source "来源：演示数据" --show-values \
  --output "<DECK_ROOT>/images/03-revenue.png"
```

- 类型：`pie` / `donut` / `bar` / `barh` / `line`；多个系列的柱图默认分组，`--stacked` 或 JSON `stacked: true` 启用堆叠，正负值分别累加。
- CLI 的 `--type`、`--theme`、`--title`、`--x-label`、`--y-label`、`--source`、`--unit`、`--width`、`--height` 覆盖对应 JSON 字段。`--show-values` 显示数值。
- `unit` 只追加单位，不换算或乘 100；比如需要百分数，请输入已核实的百分数值。数值标签最多六位有效数字，极大/极小数使用科学计数法；饼图占比独立计算并显示一位小数，舍入后总和可能不恰好为 100%。计算使用 JavaScript 双精度 Number，不宣称大整数或十进制金额具有任意精度；源数据保持不变。
- 折线图按输入类别顺序等距放置，不自动排序，不推断真实日期间距；不规则时间轴先明确重采样规则或另写时间坐标图，不用等距图冒充连续时间。
- JSON `null` / CSV 空单元格仅在折线图中表示断点，不补零、不插值；其他图类型拒绝缺值。饼图/环形图只接受一组非负数且总和大于零，不自动归并类别。
- 支持 1–80 个类别、1–8 个系列；饼图/环形图最多 8 类。大量类别优先条形图、拆页或经用户确认后汇总，不静默截断数据。
- 输出仅 PNG，默认 1600×900；`--width` / `--height` 可设 400–4096。按图片槽位比例生成，例如 1600×1000（16:10）、2100×900（21:9）。保留原始数据以便重新生成，不把栅格图片描述为可编辑图表。
- 自动选择覆盖文本的本机字体；缺字时失败，可用 `--font "字体名称"` 或 `--font "/path/font.ttf"` 指定，不自动下载字体。
- 输出目录必须存在；已有图片不会覆盖。迭代时用新文件名并更新 HTML 引用，需覆盖时先获得用户许可。
- 成功返回含路径、类型、主题、像素尺寸、字体和 `warnings` 的 JSON；文字超出画布或轴标签重叠会给出警告，必须调整文字、比例或拆图后复查，不把有警告的图片直接交付。输入错误返回简短 JSON 与非零退出码。

### 主题对应

| PPT 主题 | `theme` |
|---|---|
| 墨水经典 / 靛蓝瓷 / 森林墨 | `magazine-ink` / `magazine-indigo` / `magazine-forest` |
| 牛皮纸 / 沙丘 | `magazine-kraft` / `magazine-dune` |
| 克莱因蓝 / 柠檬黄 | `swiss-ikb` / `swiss-lemon` |
| 柠檬绿 / 安全橙 | `swiss-green` / `swiss-orange` |

颜色对应 `themes.md` 与 `themes-swiss.md`；瑞士风保留单一强调色，其余系列用灰阶、纹理、线型和点型区分，不混用多个高亮色。图表带浅色主题底，在深色页使用明确的浅底图片槽位。

### 嵌入与校验

- 保留已有图片版式；风格 A 使用 Layout 4/5/10，风格 B 使用 S22 或 S15/S16 原始网格图片槽位。不要改模板运行时或引入额外图表 CDN。
- 数据图一律保真显示，使用 `object-fit: contain`（现有 `.fit-contain`），不得裁掉图例、轴、标签或来源；这是数值证据图，不按装饰插图 `cover`。保留相对路径、`alt` 与 HTML caption。
- 正式使用前核对数据来源、单位、顺序、柱图零基线、占比和缺失值；图片适配槽位后检查中文、标签对比度、重叠及裁切。图太密时优先拆页或放大槽位，不能只缩小文字。
- PNG 可离线显示，但整个 deck 仍可能使用上游的字体/图标 CDN；除非额外完成所有资源内嵌，不声称 HTML 完全自包含。

## 风格插图：调用 ImageGen

1. 用户已要求风格插图时直接按已确认的风格和主题生成；只是询问用法、只要求图表或没有配图需求时不调用。涉及上传内部数据、人物照片或其他敏感素材，先确认授权；普通概念插图仅发送必要的抽象描述。
2. 先读 `references/image-prompts.md` 的风格规则，确定图片类型与槽位；其中 GPT-M 2.0 是上游模型描述，不代表本环境存在同名工具。Qoder 中按实际可用工具调用 `ImageGen`，不可伪造调用或返回路径。
3. 使用 `name`、`prompt`、`size` 参数。当前工具支持 `2560x1080`（近 21:9）、`1792x1024`（近 16:9）、`1536x1024`（3:2）、`1024x1024`（1:1）等；按实际工具 schema 选择，不传任意尺寸。比例不完全匹配时，插图可留安全区后适量裁切，证据截图与数据图不裁切。
4. 提示词包含主体、风格、主题底色/强调色、构图和留白；只生成素材，不包含整页 PPT、页眉、页脚、页码、水印、主标题或未经授权的品牌标记。S22 要求 `subject centered in the safe middle area`。
5. 例如瑞士风提示词：`Editorial geometric illustration of a developer collaborating with an abstract AI assistant, Swiss International Style, #fafaf8 background, #002FA7 as the only accent with black and grey, flat shapes, restrained composition, subject centered in the safe middle area, generous negative space, no text, no numbers, no charts, no gradients, no shadows, no watermark.` 需要准确文字、数值或结构时由 HTML 或本地工具叠加，不依赖模型逐字生成。
6. 把工具实际返回的图片复制到 `<DECK_ROOT>/images/{页号}-{语义}.png`（保持真实文件格式和扩展名），再通过相对路径引用；不得只输出临时路径而不接入页面，也不要覆盖原素材。
7. 生成后读图检查风格、构图、伪文字和裁切，再在浏览器验证实际槽位；不合格时调整提示词重试，不宣称模型保证精确复现颜色或排版。
8. 当前会话没有生图工具或调用失败时明确说明阻塞，不安装来源不明的客户端、不假造图片；可继续交付本地数据图表。

## 回归测试与更新

```bash
node --test "<SKILL_ROOT>/scripts/test-render-chart.mjs"
```

`render-chart.mjs`、其测试、`package.json`、`package-lock.json` 和本文是本地扩展；更新或重装上游 Skill 前保留这些文件及 SKILL.md 中的入口，更新后重新合并、恢复 npm 依赖并运行测试，不能假定安装器会自动保留本地修改。
