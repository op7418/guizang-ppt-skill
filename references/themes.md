# 主题色预设（Themes）

6 套精心调配的主题色板,保证"电子杂志 × 电子墨水"的美学不垮。**不允许用户自定义颜色——色彩搭配错了画面瞬间变丑**,只从以下预设中挑选。

---

## 使用方法

1. 问用户选哪套(或基于内容推荐一套)
2. 打开 `assets/template.html` 的 `<style>` 块
3. 找到开头的 `:root{` 块
4. **整体替换**标有"主题色"注释的那几行 `--ink` / `--ink-rgb` / `--paper` / `--paper-rgb` / `--paper-tint` / `--ink-tint` / `--accent` / `--accent-rgb`
5. 其他 CSS 都走 `var(--...)`,无需任何其他改动

如果主题块里包含 `--serif-display-zh`,也一并复制。它只影响大标题、金句、lead 等展示文字,正文仍用 `--sans-zh` 保持阅读效率。

---

## 🖋 墨水经典 (Monocle 默认)

**适合**:通用分享、商业发布、科技产品、任何场景都安全的默认选择。
**调性**:纯墨黑 + 暖米白,杂志感最强,Monocle / Apricot / A Book Apart 风。

```css
--ink:#0a0a0b;
--ink-rgb:10,10,11;
--paper:#f1efea;
--paper-rgb:241,239,234;
--paper-tint:#e8e5de;
--ink-tint:#18181a;
--accent:#8a6f3d;
--accent-rgb:138,111,61;
```

---

## 🌊 靛蓝瓷 (Indigo Porcelain)

**适合**:科技/研究/数据分享、工程师文化、深度内容、技术发布会。
**调性**:深靛蓝 + 瓷白,冷静、理性、有深度,像学术期刊或蓝印花瓷器。

```css
--ink:#0a1f3d;
--ink-rgb:10,31,61;
--paper:#f1f3f5;
--paper-rgb:241,243,245;
--paper-tint:#e4e8ec;
--ink-tint:#152a4a;
--accent:#5879a6;
--accent-rgb:88,121,166;
```

---

## 🌿 森林墨 (Forest Ink)

**适合**:自然/可持续/文化/非虚构内容、户外品牌、环保主题。
**调性**:深森林绿 + 象牙,沉稳、有呼吸感,像旧版《国家地理》。

```css
--ink:#1a2e1f;
--ink-rgb:26,46,31;
--paper:#f5f1e8;
--paper-rgb:245,241,232;
--paper-tint:#ece7da;
--ink-tint:#253d2c;
--accent:#758a5b;
--accent-rgb:117,138,91;
```

---

## 🍂 牛皮纸 (Kraft Paper)

**适合**:怀旧/人文/阅读/历史/文学分享、独立杂志、手作品牌。
**调性**:深棕 + 暖米,像牛皮信封或老笔记本,温暖、有年代感。

```css
--ink:#2a1e13;
--ink-rgb:42,30,19;
--paper:#eedfc7;
--paper-rgb:238,223,199;
--paper-tint:#e0d0b6;
--ink-tint:#3a2a1d;
--accent:#9b6b3f;
--accent-rgb:155,107,63;
```

---

## 🌙 沙丘 (Dune)

**适合**:艺术/设计/创意/时尚分享、画廊手册、审美优先的私享会。
**调性**:炭灰 + 沙色,克制、高级、中性,像沙漠黄昏或建筑设计图册。

```css
--ink:#1f1a14;
--ink-rgb:31,26,20;
--paper:#f0e6d2;
--paper-rgb:240,230,210;
--paper-tint:#e3d7bf;
--ink-tint:#2d2620;
--accent:#a18a64;
--accent-rgb:161,138,100;
```

---

## ⚜️ 钛金开物 (Titanium Gilt)

**适合**:高端视觉提案、设计系统发布、AI 视觉工作流、东方工业美学、需要"钛金 + 楷意"质感的私享会。
**调性**:深钛灰 + 香槟纸 + 缎面金,冷硬金属与东方楷意并置,像精密仪器说明书和书法题签的混血。

```css
--ink:#0c0d10;
--ink-rgb:12,13,16;
--paper:#f4efe5;
--paper-rgb:244,239,229;
--paper-tint:#e7ddc9;
--ink-tint:#18191d;
--accent:#b89556;
--accent-rgb:184,149,86;
--serif-display-zh:"TsangerJinKai03-W03","TsangerJinKai03 W03","TsangerJinKai01-W03","TsangerJinKai01 W03","仓耳今楷03 W03","仓耳今楷01 W03",var(--serif-zh);
```

**使用要点**:
- 仓耳今楷 / Tsanger Jinkai 只作为**本地已授权字体优先项**。本仓库不分发字体文件,也不通过 CDN 引入商业字体。
- 如果系统没有安装仓耳今楷,浏览器会自动回落到 `Noto Serif SC`,deck 仍可正常渲染。
- 适合用短标题、题签式 kicker 和少量 `.accent` / `.tag.accent` 做金色锚点;不要把正文大面积染金。

---

## 推荐选择参考

| 如果是... | 推荐主题 |
|---|---|
| 不知道选啥 / 第一次用 | 🖋 墨水经典 |
| AI / 技术 / 产品发布 | 🌊 靛蓝瓷 |
| 内容 / 行业观察 / 文化 | 🌿 森林墨 |
| 书评 / 生活方式 / 人文 | 🍂 牛皮纸 |
| 设计 / 艺术 / 品牌 | 🌙 沙丘 |
| 高端视觉提案 / 东方工业美学 / AI 视觉工作流 | ⚜️ 钛金开物 |

---

## 切换原则

- **一份 deck 只用一套主题**,不要中途换色
- WebGL shader 的默认主色(钛金色散 / 银色流动)适配所有 6 套(经测试可接受)
- `currentColor` 驱动的 border / icon 会跟随 section 的 text color 自动适配,无需额外调整
- `.accent` / `.tag.accent` / `.rule.accent` 使用 `--accent`,仅作局部锚点,不要铺满全页
- 选定主题后,`<title>` 文字和 `chrome` 文案可以强化该主题的语义(例如牛皮纸配"Vol.03 · 秋"这种)

## ❌ 不要做的事

- ❌ **不允许混搭**(例如 ink 取墨水经典的,paper 取沙丘的)——会彻底违和
- ❌ **不允许用户随便给一个 hex 值**——需委婉拒绝并展示 6 套预设让选
- ❌ **不要直接修改 template.html 其他地方的颜色**——所有散落 rgba 都走 var,改 :root 一处即可

选定主题后在 skill 对话中告诉用户:"用 🖋 墨水经典 / 🌊 靛蓝瓷 / ⚜️ 钛金开物 ..."并在 deck 项目记录里备注,方便后续迭代时保持一致。
