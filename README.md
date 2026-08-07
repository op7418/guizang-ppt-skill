<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="Guizang PPT Skill：用于网页 PPT、配图和多平台封面的双视觉系统。">
</p>

# Guizang PPT Skill · 网页 PPT / 配图 / 封面

![GitHub stars](https://img.shields.io/github/stars/op7418/guizang-ppt-skill?style=flat-square)
![License](https://img.shields.io/github/license/op7418/guizang-ppt-skill?style=flat-square)
![Skill](https://img.shields.io/badge/Skill-Agent-111111?style=flat-square)
![HTML Deck](https://img.shields.io/badge/HTML-Deck-0A7CFF?style=flat-square)
![Claude Code](https://img.shields.io/badge/Claude%20Code-Supported-6B5B95?style=flat-square)
![Codex](https://img.shields.io/badge/Codex-Supported-222222?style=flat-square)
[![由真格 Token Grant 资助](https://img.shields.io/static/v1?label=%E7%94%B1%E7%9C%9F%E6%A0%BC%20Token%20Grant&message=%E8%B5%84%E5%8A%A9&color=FF4D00&style=flat-square)](https://zhenfund.feishu.cn/share/base/form/shrcn1lAANF659o7EpWnxlR1VOh?sessionid=)
![360 安全龙虾金牌赞助](https://img.shields.io/static/v1?label=360%E5%AE%89%E5%85%A8%E9%BE%99%E8%99%BE&message=%E9%87%91%E7%89%8C%E8%B5%9E%E5%8A%A9&color=1677FF&style=flat-square)
![Kimi work 金牌赞助](https://img.shields.io/static/v1?label=Kimi%20work&message=%E9%87%91%E7%89%8C%E8%B5%9E%E5%8A%A9&color=111111&style=flat-square)
![Cola Skill 金牌赞助](https://img.shields.io/static/v1?label=Cola%20Skill&message=%E9%87%91%E7%89%8C%E8%B5%9E%E5%8A%A9&color=E4353F&style=flat-square)

> 🌏 **English version: [README.en.md](./README.en.md)**

一个适配 Claude Code / Codex 等 Agent 环境的网页 PPT 技能,用于生成**单文件 HTML 横向翻页 PPT**、PPT 配图和多平台封面,并内置完整的排练与演讲者模式。

内置两套视觉系统:

- **Style A: 电子杂志 × 电子墨水**。像 *Monocle* 贴上了代码,适合叙事、观点、分享、个人风格表达。
- **Style B: 瑞士国际主义**。网格至上、单一高饱和锚点色、直角、发丝线、极致字号对比,适合事实、产品、分析、方法论表达。

> 由 [歸藏](https://x.com/op7418) 在"一人公司:被 AI 折叠的组织"、"一种新的工作方式"等线下分享中沉淀而成,踩过的每一个坑都写进了 `checklist.md`。
> 赞助与支持信息见 [SPONSORS.md](./SPONSORS.md)。

**旧主题 · Style A 电子杂志风**

![Style A 电子杂志风效果展示](https://github.com/user-attachments/assets/5dc316a2-401c-4e37-9123-ea081b6ae470)

**新主题 · Style B 瑞士国际主义**

![Style B 瑞士国际主义效果展示](https://github.com/user-attachments/assets/8960e78c-69bb-4b7e-aa95-6fad64b70314)

## 30 秒开始

```bash
npx skills add https://github.com/op7418/guizang-ppt-skill --skill guizang-ppt-skill
```

也可以直接把这段话发给有 shell 权限的 AI Agent:

```text
帮我安装 guizang-ppt-skill。请把 https://github.com/op7418/guizang-ppt-skill 克隆到 ~/.claude/skills/guizang-ppt-skill,安装完成后检查 SKILL.md、assets/、references/ 是否存在。
```

已经安装过的话,用这段话更新:

```text
帮我更新 guizang-ppt-skill。请进入 ~/.claude/skills/guizang-ppt-skill 执行 git pull,然后告诉我当前最新 commit。
```

安装后直接对 Agent 说:

```text
帮我基于这篇文章做一份瑞士风 PPT,控制在 7 页左右,需要 2-3 张配图。
```

也可以试这些请求:

```text
帮我把这份 Markdown 做成杂志风演讲 PPT。
基于这份 PPT 的核心观点,生成一张公众号 21:9 头图。
把这张产品截图重新设计成适合 PPT 的 16:10 配图。
给这份 PPT 补齐演讲备注和每页计划时长,然后用演讲者模式帮我排练。
```

## 赞助与支持

<a href="./SPONSORS.md">
  <img src="https://github.com/user-attachments/assets/81138fad-31b9-49ab-8e38-23b2bc48edc4" alt="360 安全龙虾 / Kimi work / Cola Skill 金牌赞助" width="100%">
</a>

Guizang PPT Skill 的持续迭代获得 **360 安全龙虾**、**Kimi work**、**Cola Skill** 金牌赞助和 [真格 Token Grant](https://zhenfund.feishu.cn/share/base/form/shrcn1lAANF659o7EpWnxlR1VOh?sessionid=) 支持。更多信息见 [SPONSORS.md](./SPONSORS.md)。

### 在其他地方使用归藏 PPT Skill

除了 Claude Code / Codex,也可以在这些平台使用归藏 PPT Skill:

| 渠道 | 链接 |
|------|------|
| 360 安全龙虾 | [claw.360.cn](https://claw.360.cn/claw?vm_id=p19c1be5d7bed40bcb857ec4a9c785b69&target_url=https%3A%2F%2Fp19c1be5d7bed40bcb857ec4a9c785b69.claw.360.cn%2Fagents) |
| Cola Skill | [colaskill.com/guizang-ppt-skill](https://colaskill.com/guizang-ppt-skill/) |
| Kimi work | [kimi.com](https://www.kimi.com/zh-cn/products/kimi-work)（安装后在 Skill 商店搜索 guizang ppt skill） |

## 效果

- 🖋 **双视觉系统**:电子杂志风负责叙事,瑞士风负责事实表达
- 📐 **横向左右翻页**:键盘 ← → / 滚轮 / 触屏滑动 / 底部圆点 / ESC 索引
- 🧩 **Style A 10 种布局**:封面、章节、数据大字报、图文、图片网格、Pipeline、对比等
- 🧱 **Style B 22 种锁定版式**:Cover、Statement、KPI Tower、Loop Diagram、Duo Compare、Image Hero、Closing Manifesto 等
- 🎨 **主题色预设**:Style A 5 套电子墨水主题,Style B 4 套瑞士高饱和锚点色
- 🖼 **Codex 可选配图流程**:可用 GPT-Image 2.0 / GPT-M 2.0 生成纪实照片、信息图、流程图、系统关系图、UI 情景图,并按模板比例插入
- 📰 **多平台封面**:可用同一套视觉规则生成公众号 21:9、公众号分享卡 1:1、小红书 3:4、视频号横版等封面
- 🎤 **演讲者模式**:双窗口观众屏、当前页/下一页 16:9 预览、演讲备注、计时排练、自动翻页、激光笔、圈选和现场故障恢复
- 📴 **低性能静态模式**:按 `B` 可关闭 WebGL / canvas 动画,让动态内容退回静态背景
- 📄 **单文件 HTML**:不需要构建、不需要服务器,浏览器直接打开

## 适合 / 不适合

**✅ 合适**:线下分享 / 行业内部讲话 / 私享会 / AI 产品发布 / demo day / 带强烈个人风格的演讲

**❌ 不合适**:大段表格数据 / 培训课件(信息密度不够)/ 需要多人协作编辑(静态 HTML)

## 常见使用场景

| 任务 | 推荐方式 |
|------|---------|
| 长文章变演讲 PPT | 先抽核心观点,再按 6-10 页节奏生成 deck |
| 方法论 / 产品分析 | 用 Style B 瑞士风,优先使用锁定版式和 21:9 主图 |
| 个人分享 / 观点表达 | 用 Style A 电子杂志风,保留更强叙事感 |
| PPT 配图 | 在 Codex 中用 GPT-Image 2.0 / GPT-M 2.0 生成照片、信息图、流程图、UI 情景图 |
| 多平台封面 | 从同一份内容生成公众号 21:9、1:1 分享卡、小红书 3:4、视频号横版封面 |
| 截图统一风格 | 把原始截图重新生成到模板需要的比例,再插入 PPT |
| 现场演讲 / 排练 | 让 Agent 从大纲生成备注和时长,按右下角 `P` 进入演讲者模式 |

## 为什么是 HTML PPT

- **更适合 Agent 生成和修改**:HTML / CSS 是文本,Agent 能直接读、改、验证。
- **表现力比 Markdown 更高**:可以做精细排版、空间定位、动画、交互和响应式封面。
- **交付更轻**:单文件 HTML 可以直接打开、演示、发送、截图,演讲者工具也随文件一起交付。
- **更容易做质量控制**:瑞士风可以用脚本校验版式、图片槽位、标题对齐、危险 SVG,并在可用时用 Playwright 后验测量超出、底部空白、nav 安全线和标题间距。
- **更适合视觉内容链路**:同一套主题能覆盖 PPT、配图、封面和截图再设计。

## 平台支持

| 平台 | 状态 | 说明 |
|------|------|------|
| Claude Code | 支持 | 原生 Skill 工作流,适合生成和迭代 HTML deck |
| Codex | 支持 | 适合生成 PPT、调用图片生成能力、做浏览器视觉检查 |
| Cursor / 其他本地 Agent | 可用 | 需要能读写文件并执行 shell 命令 |
| WorkBuddy | 适配中 | 单独整理上架版本,去掉平台不需要的渠道差异 |
| 普通 Chatbot | 不推荐 | 没有文件系统和浏览器预览时,很难稳定生成完整 deck |

## 安装

### 方式一:一行命令安装(推荐)

```bash
npx skills add https://github.com/op7418/guizang-ppt-skill --skill guizang-ppt-skill
```

### 方式二:把下面这段话直接发给 AI

> 帮我安装 `guizang-ppt-skill` 这个 Claude Code skill。请按下面步骤做:
>
> 1. 确保 `~/.claude/skills/` 目录存在(不存在就创建)
> 2. 执行 `git clone https://github.com/op7418/guizang-ppt-skill.git ~/.claude/skills/guizang-ppt-skill`
> 3. 验证:`ls ~/.claude/skills/guizang-ppt-skill/` 应该看到 `SKILL.md`、`assets/`、`references/` 三项
> 4. 告诉我安装好了,之后我说"做一份杂志风 PPT"之类的话就会触发这个 skill

把这段话复制粘贴给 Claude Code / Cursor / 任何有 shell 权限的 AI Agent,它会自动完成安装。

### 方式三:手动命令行

```bash
git clone https://github.com/op7418/guizang-ppt-skill.git ~/.claude/skills/guizang-ppt-skill
```

### 触发方式

装好后,Claude Code 会在对话里自动发现并调用这个 skill。触发关键词:

- "帮我做一份杂志风 PPT"
- "帮我做一份瑞士风 PPT"
- "生成一个 horizontal swipe deck"
- "editorial magazine style presentation"
- "electronic ink 风格演讲 slides"
- "基于这篇文章做一张公众号 21:9 封面"
- "基于这份 PPT 生成一张 1:1 分享卡"
- "给这份 PPT 补齐演讲备注,并用演讲者模式帮我排练"

## 使用流程

Skill 本身是结构化工作流,Agent 会逐步引导:

1. **选择风格** — Style A 电子杂志风,或 Style B 瑞士国际主义
2. **需求澄清** — 7 问清单:风格、受众、时长、素材、图片/截图需求、主题色、硬约束
3. **拷贝模板** — Style A 用 `assets/template.html`,Style B 用 `assets/template-swiss.html`
4. **填充内容** — 先做主题节奏表,再从对应 layout 骨架里挑、粘、改文案
5. **可选配图** — 在 Codex 中询问是否用 GPT-Image 2.0 / GPT-M 2.0 生成配图,再按页面比例插入
6. **生成演讲备注** — 从大纲提取每页目的、讲述要点、转场和计划时长；用户没提供的信息不猜测
7. **自检** — 对照 `references/checklist.md`,P0 级问题必须全过；瑞士风和演讲模式分别运行对应校验器
8. **预览** — 浏览器直接打开
9. **排练 / 演讲** — 按右下角 `P` 进入演讲者模式,检查观众屏同步并记录实际时长
10. **迭代** — 根据排练结果调整内容、字号、高度和间距

详细说明见 [`SKILL.md`](./SKILL.md)。

## 演讲者模式

两套模板都内置同一套演讲者运行时。打开 deck 后,点击右下角 `P` 即可进入演讲者视图；浏览器会同时打开一个干净的观众屏。所有核心能力都在本地 HTML 和浏览器里完成,不依赖实时字幕、云端中继、手机遥控或 AI 教练服务。

**演讲者视图示例**

![演讲者视图示例：当前页、下一页、演讲备注、计时控制与观众屏状态](https://github.com/user-attachments/assets/95db62b5-65bb-40af-ac0b-1d415682af88)

### 演讲时能看到什么

- **当前页与下一页**:上下排列并始终保持 `16:9`,小屏时整页等比缩放,不裁切、不挤压文字
- **宫格选页**:在预览区原位切换总览,点选页面后立即回到双预览,观众屏同步跟随
- **结构化备注**:标题、本页目的、讲述要点和转场必填；互动、语气、翻页时机、备用方案和读音等信息只在大纲提供时显示
- **进度与状态**:显示当前页 / 总页数、完成百分比,以及观众屏的连接中、已同步、未同步、已冻结、未连接或弹窗被拦截状态

### 时间、排练与自动翻页

- 底栏分别显示已进行、本页和剩余 / 超时时间,按钮明确区分“开始计时 / 继续计时 / 重置计时”
- 排练模式记录每页实际时长和整场汇总,数据保存在本地浏览器,不会做 AI 评分
- 自动翻页默认关闭；只有大纲明确给出页面停留秒数,或用户在设置中开启全局间隔时才启用
- 打开宫格、设置、圈选工具,页面隐藏,或观众屏暂停 / 失去同步时,自动翻页会暂停

### 现场工具与故障恢复

- 激光笔、圈选和清除会同步到观众屏
- 一键黑屏、白屏,或冻结观众屏；恢复后自动追平演讲者当前页
- 观众窗口关闭或心跳超时后明确显示“未连接”,可随时点击“重新打开观众屏”
- 退出演讲时自动关闭观众窗口；浏览器不允许自关时,观众端显示“演示已结束”
- 演前检查覆盖弹窗、全屏、字体、图片 / 视频和 `16:9` 预览,并提醒人工确认 HDMI、转接器和投影仪

常用快捷键：`← / →` 翻页,`Home / End` 跳首页或尾页,`G` 宫格,`L` 激光笔,`C` 圈选,`B / W` 黑屏或白屏,`F` 冻结观众屏,`?` 查看完整快捷键。

让 Agent 生成或补齐演讲模式时,可以直接说：

```text
根据这份大纲给每一页补齐演讲目的、讲述要点、转场和计划时长。没有提供的互动或现场信息不要猜,然后运行演讲模式校验器。
```

演讲备注契约和完整行为说明见 [`references/presenter-mode.md`](./references/presenter-mode.md)。校验命令：

```bash
node scripts/validate-presenter-mode.mjs path/to/index.html
node scripts/validate-presenter-mode.mjs path/to/index.html --target-minutes 30
```

## Style B 瑞士风

瑞士风是这次新增的结构化主题。它不是"换一套 CSS",而是一套更严格的版式系统。

- **22 个具名版式**:正文页只能从 `S01` 到 `S22` 中选择,不能临时发明页面结构
- **4 套锚点色**:克莱因蓝 IKB、柠檬黄、柠檬绿、安全橙
- **网格锁定**:16 列 grid、直角色块、1px 发丝线、无阴影、无渐变、无圆角
- **中文字号收敛**:全中文大标题需要降一档,避免占掉正文和图片空间
- **图文底对齐**:左文右图 / 左图右文场景优先让正文块与图片底部对齐,同时避开页脚翻页组件
- **图片槽位绑定**:图片必须进入模板预留的 `data-image-slot`,常见主图按 21:9 或 16:10 生成
- **强校验**:用脚本拦住居中标题、实验版式、SVG 内写字、图片脱离槽位等问题;可用 Playwright 时还会量化真实渲染后的 overflow、bottom whitespace、title gap

瑞士风校验命令:

```bash
node scripts/validate-swiss-deck.mjs path/to/index.html
```

## Codex 配图能力

在 Codex 环境中,完成 deck 初稿后可以主动询问用户是否需要生成配图。用户确认后,再询问图片类型或风格,常用类型包括:

- 人文纪实照片:富士 / 徕卡感的真实场景,增加人文表现力
- 信息图 / 流程图 / 对比图 / 系统关系图:用于解释无法用实拍照片说明的概念
- 截图美化 / 截图再设计:原始截图优先用内置背景资产做 CleanShot X 式背景画布适配;需要重构时再生成 UI 情景图
- 数据大字报 / 数据图表:把关键数字做成可直接插入 PPT 的视觉素材
- 多图拼贴:用于极宽图片槽位,避免把三张 16:9 图片硬塞进三列

生成图片时要遵守四个关键规则:

- 图片是 PPT 中的嵌入素材,不要自带页脚、页底、标题、角标、页码或装饰边框
- 图片语言跟随 deck 语言:中文 deck 的信息图用中文标签,英文 deck 用英文标签
- 图片比例必须先匹配落位:瑞士风主图常用 21:9,通用主图常用 16:9 / 16:10,截图再设计常用 16:10,多图网格统一高度
- 用户截图需要保真时,先读 `references/screenshot-framing.md`,用 `assets/screenshot-backgrounds/` 内置背景 + 程序化缩放/留边/对齐处理,不要默认重画截图内容

配图提示词见 [`references/image-prompts.md`](./references/image-prompts.md),截图适配见 [`references/screenshot-framing.md`](./references/screenshot-framing.md)。

## 封面生成

这个 Skill 也可以基于文章或 PPT 核心观点生成平台封面。典型规格:

- **公众号头图**:21:9,主标题优先,右侧或边缘保留视觉锚点
- **公众号分享卡**:1:1,与头图共用主题色、关键词和视觉元素
- **小红书封面 / 轮播**:3:4,大标题优先,多张时统一字号和视觉节奏
- **视频号 / 横版封面**:16:9,适合标题 + 副标题 + 单一视觉焦点

封面原则和 PPT 一样:只用少量关键词,视觉重心落在大标题上,不要把正文堆满。

## 示例请求

复制下面任意一条给 Agent,再附上你的文章、Markdown 或素材文件:

```text
帮我基于这篇文章生成一份 8 页左右的瑞士风 PPT,需要 3 张配图,图片比例跟模板槽位匹配。
```

```text
帮我把这个产品分析文档做成电子杂志风 PPT,重点突出观点和叙事节奏。
```

```text
基于这份 PPT 的主题,做两张封面:公众号 21:9 头图和 1:1 分享卡,视觉保持一致。
```

```text
把这些产品截图重新设计成统一的 16:10 PPT 配图,保留关键信息,不要画页脚和标题。
```

## 目录结构

```
guizang-ppt-skill/
├── SKILL.md              ← Skill 主文件:工作流、原则、常见错误
├── README.md             ← 本文件
├── assets/
│   ├── template.html         ← Style A 电子杂志风模板
│   ├── template-swiss.html   ← Style B 瑞士国际主义模板
│   └── screenshot-backgrounds/ ← 截图美化内置背景(WebP):style-a 5 套 / style-b 4 套
├── scripts/
│   ├── validate-swiss-deck.mjs ← 瑞士风版式校验器
│   ├── validate-presenter-mode.mjs ← 演讲备注、时长和运行时校验器
│   └── check-presenter-runtime-sync.mjs ← 两套模板演讲者运行时防漂移检查
└── references/
    ├── components.md     ← 组件手册(字体、色、网格、图标、callout、stat、pipeline)
    ├── layouts.md        ← 10 种页面布局骨架(可直接粘贴)
    ├── layouts-swiss.md  ← 22 种瑞士风锁定版式
    ├── swiss-layout-lock.md ← 瑞士风还原度和版式硬约束
    ├── themes.md         ← 5 套主题色预设(只能选不能自定义)
    ├── themes-swiss.md   ← 4 套瑞士风锚点色
    ├── image-prompts.md  ← GPT-Image 2.0 / GPT-M 2.0 配图类型、比例和基础提示词
    ├── screenshot-framing.md ← CleanShot X 式截图适配语义
    ├── presenter-mode.md ← 演讲备注契约、排练、观众屏与现场工具说明
    └── checklist.md      ← 质量检查清单(P0 / P1 / P2 / P3 分级)
```

## 主题色预设

从 `references/themes.md` 里选一套——**不允许自定义 hex 值**,保护美学比给自由更重要。

### Style A 电子杂志主题

| 预览 | 主题 | 核心色与适合场景 |
|------|------|------------------|
| <img src="https://github.com/user-attachments/assets/df21dbcb-5fe4-4852-a91a-a9cf00aceeb4" width="260" alt="墨水经典主题预览"> | 🖋 **墨水经典** | `#0a0a0b` / `#f1efea`。通用默认、商业发布、不知道选啥时最稳。 |
| <img src="https://github.com/user-attachments/assets/99ce0fd2-72a6-4368-a75a-a8e21657a537" width="260" alt="靛蓝瓷主题预览"> | 🌊 **靛蓝瓷** | `#0a1f3d` / `#f1f3f5`。科技、研究、AI、技术发布会。 |
| <img src="https://github.com/user-attachments/assets/bcc1cc4c-5e8e-4467-ae8d-f5801ae73657" width="260" alt="森林墨主题预览"> | 🌿 **森林墨** | `#1a2e1f` / `#f5f1e8`。自然、可持续、文化、非虚构内容。 |
| <img src="https://github.com/user-attachments/assets/dfea080e-e916-417e-93cd-0a3628de84ca" width="260" alt="牛皮纸主题预览"> | 🍂 **牛皮纸** | `#2a1e13` / `#eedfc7`。怀旧、人文、阅读、历史、文学分享。 |
| <img src="https://github.com/user-attachments/assets/f3705592-9a72-4dbc-9818-df3aea61bc75" width="260" alt="沙丘主题预览"> | 🌙 **沙丘** | `#1f1a14` / `#f0e6d2`。艺术、设计、创意、时尚和画廊感内容。 |

切换主题只需替换 `template.html` 开头 `:root{}` 里的 6 行变量,其他 CSS 全走 `var(--...)`。

### Style B 瑞士主题

瑞士风从 `references/themes-swiss.md` 里选一套,同样**不允许自定义 hex 值**。

| 预览 | 主题 | 锚点色与适合场景 |
|------|------|------------------|
| <img src="https://github.com/user-attachments/assets/c02d02f7-ce6f-4e16-b8a6-778c96851f94" width="260" alt="克莱因蓝瑞士主题预览"> | 🔵 **克莱因蓝 IKB** | `#002FA7`。通用默认、商业发布、AI 产品、方法论。 |
| <img src="https://github.com/user-attachments/assets/c310a8c4-5d28-450e-b49a-6ac5b6ba4785" width="260" alt="柠檬黄瑞士主题预览"> | 🟡 **柠檬黄** | `#FFD500`。年轻、运动、零售、消费品、Y2K 复古。 |
| <img src="https://github.com/user-attachments/assets/65f7b3f9-3358-419e-b513-f7f2cc24ec76" width="260" alt="柠檬绿瑞士主题预览"> | 🟢 **柠檬绿** | `#C5E803`。生态、可持续、健康、Z 世代品牌。 |
| <img src="https://github.com/user-attachments/assets/9c3319c9-a134-4657-9a56-211c23411f7f" width="260" alt="安全橙瑞士主题预览"> | 🟠 **安全橙** | `#FF6B35`。警示、新闻、工业、运动、活力主题。 |

如果用户说"瑞士风 PPT"但没有指定颜色,默认推荐克莱因蓝 IKB。

## 核心设计原则

1. **克制优于炫技** — WebGL 背景只在 hero 页透出
2. **结构优于装饰** — 信息靠字号 + 字体对比 + 网格留白,不用阴影和浮动卡片
3. **图片是第一公民** — 图片要对齐正文内容区,比例稳定,只裁底部,顶部和左右完整
4. **配图只做素材** — 生成图只保留核心照片 / 图表 / UI,不要把 PPT 页脚、标题和角标画进图片里
5. **节奏靠 hero 页** — hero / non-hero 交替,才不累眼睛
6. **低性能可退场** — 按 `B` 能切换到静态模式,动态效果不能成为阅读负担
7. **术语统一** — Skills 就是 Skills,不中英混译
8. **瑞士风必须守版式** — Style B 优先还原原始 22P 版式,不要为了"多样"发明不存在的页面

## 视觉参考

- [*Monocle*](https://monocle.com) 杂志的版式
- YC Garry Tan "Thin Harness, Fat Skills"
- Massimo Vignelli / Helvetica Forever / 瑞士国际主义网格系统
- 歸藏线下分享 PPT 系列

## Roadmap

- 补充更多真实案例和可打开的 HTML deck 示例
- 扩展封面规格,覆盖更多内容平台
- 增加更多瑞士风版式校验规则
- 优化截图再设计和信息图生成工作流
- 整理 WorkBuddy 等平台上架版本
- 增加更多主题包,但继续限制自定义颜色

## FAQ

**可以导出 PPTX 吗?**
当前核心交付是 HTML。你可以用浏览器演示、截图或录屏。如果需要 PPTX,建议把 HTML 页面作为视觉稿再转换,但这不是当前主流程。

**为什么不允许自定义颜色?**
这个 Skill 的重点是稳定产出。自由选色很容易破坏整体风格,所以只允许从预设主题里选。

**我能加自己的版式吗?**
可以。Style A 可以在 `references/layouts.md` 里扩展；Style B 更严格,需要同步更新 `template-swiss.html`、`layouts-swiss.md`、`swiss-layout-lock.md` 和校验器。

**Codex 配图是必须的吗?**
不是。没有配图也能生成 PPT。配图流程只在需要照片、信息图、UI 情景图或封面时使用。

**演讲者模式需要联网或额外服务吗?**
不需要。双窗口同步、备注、计时、排练、自动翻页和标注都在本地浏览器完成。它不会提供实时字幕、手机遥控或 AI 排练评分。

**为什么关掉观众窗口后显示“未连接”?**
演讲者端会通过观众屏确认和心跳判断软件链路。窗口关闭或心跳超时会显示“未连接”,点击“重新打开观众屏”即可恢复。浏览器无法判断 HDMI 或投影仪线缆是否真的接通,现场仍需目视确认。

**怎么更新到最新版?**
重新运行安装命令,或在本地 skill 目录执行 `git pull`。

## 贡献

Bug、排版问题、新布局需求——欢迎开 Issue 或 PR。改动请优先:

- 在 `template.html` 里补类,不要让 layouts.md 使用未定义的类
- 在 `template-swiss.html` 里补类时,同步更新 `layouts-swiss.md` 和 `swiss-layout-lock.md`
- 瑞士风新增规则后,同步更新 `scripts/validate-swiss-deck.mjs`
- 演讲者运行时必须同时更新两套模板,并运行 `scripts/check-presenter-runtime-sync.mjs`；CI 会拦截两份模板的 CSS / JavaScript 漂移
- 演讲备注或现场行为变化时,同步更新 `references/presenter-mode.md`、`references/checklist.md` 和 `scripts/validate-presenter-mode.mjs`
- 把踩过的坑写到 `checklist.md` 对应的 P0 / P1 / P2 / P3 级别
- 新主题色进 `themes.md` 并给出适合的场景

## License

AGPL-3.0 © 2026 [op7418](https://github.com/op7418)
