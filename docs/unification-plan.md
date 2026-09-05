# 多主题统一管理整合方案

> 基于对 template.html / template-swiss.html 两份模板与全部 references 的逐行对比分析(2026-07)。
> 本文档是**方案建议**,尚未整体实施;按阶段推进,每个阶段独立可交付、可回滚。2026-08-07 已先为演讲者 CSS / JS 加入边界标记、字节级同步脚本和 GitHub Actions,但尚未提取共享源文件。

## 现状诊断

两个主题是"复制粘贴后各自演化"的关系,同一份基础设施存在多份副本,并已实际漂移:

### 运行时 JS 漂移(约 250 行 × 每主题一份)

| 模块 | A 杂志风 | B 瑞士风 |
|---|---|---|
| 低功耗事件名 | `ppt-low-power-change` | `swiss-low-power-change` |
| localStorage key | `guizang-ppt-low-power`(共用!) | 同左 |
| ESC 索引缩略图可见性修复 | ✅(本次补齐) | ✅ |
| `?slide=N` 直达参数 | ✅(本次补齐) | ✅ |
| Windows 字重补偿 `is-win` | 缺失 | ✅ |
| prefers-reduced-motion 自动降级 | ✅(本次补齐) | ✅ |
| 翻页/滚轮/触屏/键盘核心 | 两份逐字符几乎相同 | 同左 |

### Token 体系成熟度不一

- **B 最成熟**:主题色 + Carbon 文字角色 token + `--sp-3~13` 8px 间距阶梯 + motion token + `--nav-safe-bottom`
- **A 最简陋**:只有 6 个颜色变量,层级靠 opacity 表达,存在 10-11px 小字(投屏不可读),`.lead/.chrome/.foot` 在模板内部重复定义(v1 与 v2 API 叠加)

### 已知具体坏味道(可立即修的小项)

1. B 模板 `#hint` 引用了未定义变量 `--ink-tint`(靠 fallback 兜底)
2. B 模板 pipeline 死代码:`__pipeAdvance` 恒返 false,但 43 行 pipeline CSS 和动效 CSS 还在
3. B 的 motion token 双维护:CSS 定义了 `--ease-prod`,JS 里又硬编码 `EASE_PROD=[.2,0,.38,.9]`
4. A 是唯一没有校验器的主题,但 validate-swiss-deck.mjs 的标题选择器已经包含 A 的类名(`.display/.h1-zh` 等),说明测量层本来就通用

## 整合原则

**不建议**把两个模板合并成一个"大一统模板"——两种风格的美学规则互斥(直角 vs 圆角、衬线 vs 无衬线),强行合并会让类名前缀和条件分支爆炸,也违背"每份 deck 单文件交付"的定位。

**建议**的整合层次:**共享的是"基建"和"契约",不共享"皮肤"**。

## 分阶段方案

### Phase 1 · 共享运行时(收益最大)

把各主题漂移的 JS 收敛为一份 `assets/runtime.js`(构建时内联进各模板,保持单文件交付):

- 翻页核心 go() / 键盘 / 滚轮 / 触屏 / nav 圆点 / ESC 索引(含缩略图可见性修复)
- 低功耗 IIFE:统一事件名为 `deck-low-power-change`,统一 localStorage key,保留各主题旧事件名一个版本作为 alias
- `?slide=N`、prefers-reduced-motion、Motion One 加载器
- 主题差异通过配置对象注入:`initDeck({ darkClass:'dark', onSlideChange(){...} })`

实施方式二选一:
- **a. 构建脚本**(推荐):`scripts/build-templates.mjs` 把 `src/runtime.js` + 各主题 `src/style-*.css` + 皮肤 HTML 组装成各 template*.html。模板仍是完整单文件,但源头唯一。
- **b. 文档约定**:不引入构建,把 runtime 段落用 `<!-- SHARED-RUNTIME v3 -->` 注释标记,改动时用脚本校验各份一致。成本低但漂移风险仍在。

当前演讲者模式已先落地 Phase 1b 的防漂移护栏:`scripts/check-presenter-runtime-sync.mjs` 与 `.github/workflows/presenter-runtime-sync.yml`。工作流保留原有 required-check 名称,但已扩展为运行 `npm run check`,同时覆盖 Swiss layout 契约和两套模板 smoke test。它不替代长期的共享源提取,但可以防止修改只落到其中一份模板。

如果未来合并 Bento 分支,以 `main` 上的演讲者运行时为上游,采用 `main → bento` 的合并方向;不要用旧 Bento 模板反向覆盖 `main`。

### Phase 2 · 公共 Token 契约

在各模板间统一**命名和语义**(值可以不同):

- 间距:全部采用 B 的 `--sp-*` 8px 阶梯(A 补齐)
- 文字角色:`--text-primary/secondary/helper/on-color` + `--border-subtle/strong` 各主题同名(A 需要从 opacity 方案迁移)
- 安全区:`--nav-safe-bottom` + `.nav-safe-bottom(-tight)` 各主题同名(已完成:B 有,A 待补)
- Motion:`--ease-*/--dur-*` 统一命名,JS 从 CSS var 读取,消除双维护
- 最小字号地板:A 对齐 B 的"正文 ≥16px、caption ≥14px"投屏标准(A 现存 10-11px 小字需要清理)

### Phase 3 · 校验器公共核

抽 `scripts/lib/validate-core.mjs`:

- slide 解析、Playwright 加载(双根解析 + try/finally + swiftshader)、isMeaningful 过滤器、M1 溢出/底部空白/nav 安全线、M2 标题间距、overflowFix 分级建议
- 各主题瘦身为 config + 专属静态规则:`validate-swiss-deck.mjs`(版式锁定)、**新增 `validate-magazine-deck.mjs`**(A 目前裸奔,公共核直接就能给它 M1/M2 测量)

### Phase 4 · References 去重

- `themes*.md` 各份结构完全同构 → 统一"主题卡片 schema",每主题只留数据
- 图片规则目前散在 4+ 处且 A/B 规则有分叉(A:信息图必须 fit-contain;B:重生成图禁止 fit-contain)→ 合并为单一来源 `references/images.md`,分叉处显式按主题参数化
- 动效说明多处重复 → 收敛到各 layouts 文件,组件文档只放链接
- 清理 golden source 绝对路径:改为相对于 `<SKILL_ROOT>` 的路径或删除

### 顺手修复清单(可与任一阶段同批)

- [ ] A:`.lead/.chrome/.foot` 双定义合并
- [ ] A:补齐 `--nav-safe-bottom` 安全区 token
- [ ] B:删 pipeline 死 CSS 或恢复 `__pipeAdvance`
- [ ] B:`--ink-tint` 未定义引用
- [ ] B:JS 缓动改读 CSS var
- [ ] 文档:去除 `/Users/guohao/...` 绝对路径(已完成)
- [ ] 各模板共有:`file://` 直开时 module 动态 import 本地 `./assets/motion.min.js` 被 Chrome CORS 拦截,实际总是走 jsDelivr CDN;离线 + 直开的组合只能拿到静态降级。共享 runtime 时考虑把 motion 关键函数直接内联进模板,或文档明确"离线演示请起本地 server"

## 建议排序

1. **Phase 1a(构建脚本 + 共享 runtime)** —— 一次性消灭最大的漂移面
2. **顺手修复清单** —— 全部是小改动,跟 Phase 1 同一个 PR
3. **Phase 3(校验器公共核 + A 校验器)** —— A 从此也有质量护栏
4. Phase 2、4 可以慢慢来,不阻塞新主题

完成 Phase 1+3 后,再增加"新主题"的边际成本会从"复制 2000 行再改"降到"写一份皮肤 CSS + 一份 layouts 文档 + 一个 validator config"。
