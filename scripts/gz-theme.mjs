#!/usr/bin/env node
// 歸藏设计系统 · 品牌主题生成（guizang-design v0.1.0 生成，不要手改）
//
//   node scripts/gz-theme.mjs brand "#4D6BFE" [--family magazine|swiss] [--id brand]
//
// 用户给品牌色或 logo 主色时用：颜色被收进现有精调色板的明度 / 彩度区间，并通过 WCAG + APCA 对比度检查。
// 输出一段 [data-theme="<id>"]{…} CSS，贴进 deck 的 <style> 末尾，再把 <html> 的 data-theme 改成 <id>。
// 不达标时不输出主题，只给出原因。
// 色彩基础：sRGB ↔ OKLab / OKLCH、sRGB 色域映射、WCAG 2 对比度、APCA 对比度。
// 设计系统里所有「科学配色」都建立在这几个函数上：
// 用 OKLCH 描述颜色（明度 L、彩度 C、色相 H 互相独立，调一个不会把另外两个带偏），
// 用 WCAG + APCA 两套对比度卡住可读性。纯函数、无依赖。

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x))

// ---------- hex ----------

function parseHex(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim())
  if (!m) throw new TypeError(`不是合法的 hex 颜色：${hex}`)
  let h = m[1]
  if (h.length === 3) h = h.replace(/./g, (c) => c + c)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
}

function toHex(rgb) {
  return '#' + rgb.map((c) => Math.round(clamp(c, 0, 1) * 255).toString(16).padStart(2, '0')).join('')
}

// ---------- sRGB 传递函数 ----------

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const fromLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

// ---------- OKLab（Björn Ottosson, 2020） ----------

function rgbToOklab([r, g, b]) {
  const R = toLinear(r), G = toLinear(g), B = toLinear(b)
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ]
}

// 返回未裁剪的 sRGB，可能超出 [0,1]，由调用方判断是否在色域内
function oklabToRgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
  return [
    fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ]
}

// ---------- OKLCH ----------

function oklabToOklch([L, a, b]) {
  const C = Math.hypot(a, b)
  let H = (Math.atan2(b, a) * 180) / Math.PI
  if (H < 0) H += 360
  return { l: L, c: C, h: C < 1e-4 ? 0 : H }
}

function oklchToOklab({ l, c, h }) {
  const r = (h * Math.PI) / 180
  return [l, c * Math.cos(r), c * Math.sin(r)]
}

const hexToOklch = (hex) => oklabToOklch(rgbToOklab(parseHex(hex)))

const inGamut = (rgb, eps = 1e-6) => rgb.every((c) => c >= -eps && c <= 1 + eps)

// 保持明度和色相，二分降低彩度直到落进 sRGB。和 CSS Color 4 的思路一致，足够用于生成色板
function oklchToHex({ l, c, h }) {
  l = clamp(l, 0, 1)
  let rgb = oklabToRgb(oklchToOklab({ l, c, h }))
  if (!inGamut(rgb)) {
    let lo = 0, hi = c
    while (hi - lo > 1e-5) {
      const mid = (lo + hi) / 2
      if (inGamut(oklabToRgb(oklchToOklab({ l, c: mid, h })))) lo = mid
      else hi = mid
    }
    rgb = oklabToRgb(oklchToOklab({ l, c: lo, h }))
  }
  return toHex(rgb)
}

function maxChroma(l, h) {
  let lo = 0, hi = 0.5
  while (hi - lo > 1e-5) {
    const mid = (lo + hi) / 2
    if (inGamut(oklabToRgb(oklchToOklab({ l, c: mid, h })))) lo = mid
    else hi = mid
  }
  return lo
}

// ---------- 对比度 ----------

function luminance(hex) {
  const [r, g, b] = parseHex(hex).map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// WCAG 2.x：1–21。正文 ≥ 4.5，大字 ≥ 3
function wcag(fg, bg) {
  const a = luminance(fg), b = luminance(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

// APCA (SAPC 0.0.98G-4g)：返回 Lc，深字浅底为正、浅字深底为负。
// 参考阈值：正文 |Lc| ≥ 75，大号正文 ≥ 60，标题 ≥ 45，不承担阅读的装饰 ≥ 30。
// WCAG 2 对深色背景和中等亮度颜色偏差很大，APCA 更接近人眼，两者都看。
function apca(fg, bg) {
  const y = (hex) => {
    const [r, g, b] = parseHex(hex).map((c) => c ** 2.4)
    let Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b
    if (Y < 0.022) Y += (0.022 - Y) ** 1.414
    return Y
  }
  const Yt = y(fg), Yb = y(bg)
  if (Math.abs(Yb - Yt) < 0.0005) return 0
  if (Yb > Yt) {
    const s = (Yb ** 0.56 - Yt ** 0.57) * 1.14
    return s < 0.1 ? 0 : (s - 0.027) * 100
  }
  const s = (Yb ** 0.65 - Yt ** 0.62) * 1.14
  return s > -0.1 ? 0 : (s + 0.027) * 100
}

// 两个颜色在 OKLab 里的距离（ΔEok，×100 便于阅读，≈2 以下肉眼难分）
function deltaE(a, b) {
  const [L1, a1, b1] = rgbToOklab(parseHex(a))
  const [L2, a2, b2] = rgbToOklab(parseHex(b))
  return Math.hypot(L1 - L2, a1 - a2, b1 - b2) * 100
}

const formatOklch = ({ l, c, h }) => `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(4)} ${h.toFixed(1)})`

// 从色板派生完整主题：文字角色、线条、accent-on、accent-ink、-rgb 三元组。
// 派生规则对所有主题一样，自定义品牌主题也走这里，所以「每套主题都可读」是由规则保证的，不靠逐个手调。
//
// 文字角色沿用现有模板的层级比例（PPT / 卡片里正文 .82、次要 .72 这类透明度），
// 但输出实色而不是透明度：导出 PDF 和截图时透明叠加会出问题，实色也能直接算对比度。
// 比例混出来的颜色对比度不够时，沿 OKLab 继续往墨色方向推，直到达到该角色的下限。


// APCA |Lc| 下限。参考 APCA 的使用建议：正文 75、大号正文 / 次要文字 60、标题 45、非阅读元素 15–30
const ROLE_FLOORS = {
  textBody: { apca: 75, wcag: 7 },
  textSecondary: { apca: 60, wcag: 4.5 },
  textHelper: { apca: 60, wcag: 4.5 },
  accentInk: { apca: 60, wcag: 4.5 },
  // 色块上的正文级文字（≥ 16px）：WCAG 4.5 + APCA 45。饱和中等明度的底色（安全橙）上 APCA 会低估深色字，
  // WCAG 会高估白字，两个都要过
  onText: { apca: 45, wcag: 4.5 },
  // 大字（标题、KPI 大数字）只看 APCA 标题线 45：WCAG 对明亮饱和色（安全橙）严重低估可读性
  accentDisplay: { apca: 45, wcag: 0 },
}

// 大字用的强调色：原色够大字标准就用原色（保持设计），不够就退到 accent-ink（柠檬黄这类浅色强调色）
const accentDisplay = (accent, accentInk, paper) => (passes(accent, paper, ROLE_FLOORS.accentDisplay) ? accent : accentInk)

// 在 OKLab 里线性混合：t=0 得到 a，t=1 得到 b
function mix(a, b, t) {
  const A = rgbToOklab(parseHex(a))
  const B = rgbToOklab(parseHex(b))
  return toHex(oklabToRgb(A.map((v, i) => v + (B[i] - v) * t)))
}

const rgbTriplet = (hex) => parseHex(hex).map((c) => Math.round(c * 255)).join(',')

const passes = (fg, bg, floor) => Math.abs(apca(fg, bg)) >= floor.apca && wcag(fg, bg) >= floor.wcag

// 从 paper 往 ink 混，比例 t 起步；不达标就加大 t
function inkRole(ink, paper, t, floor) {
  for (let k = t; k <= 1.0001; k += 0.01) {
    const c = mix(paper, ink, Math.min(k, 1))
    if (!floor || passes(c, paper, floor)) return { hex: c, ratio: +Math.min(k, 1).toFixed(2), adjusted: k > t + 1e-9 }
  }
  return { hex: ink, ratio: 1, adjusted: true }
}

// 保持色相，调整明度直到能当文字用：浅底往暗调，深底往亮调
function textSafeAccent(accent, paper, floor = ROLE_FLOORS.accentInk) {
  if (passes(accent, paper, floor)) return { hex: accent, adjusted: false }
  const { l, c, h } = hexToOklch(accent)
  const dark = hexToOklch(paper).l < 0.5
  for (let step = 1; step <= 200; step++) {
    const L = dark ? l + step * 0.005 : l - step * 0.005
    if (L <= 0 || L >= 1) break
    const hex = oklchToHex({ l: L, c, h })
    if (passes(hex, paper, floor)) return { hex, adjusted: true }
  }
  return { hex: dark ? '#ffffff' : '#000000', adjusted: true }
}

// 在 ink 和 paper 里选对比更强的那个当 accent 上的文字色
function onColor(bg, candidates) {
  return candidates.reduce((best, c) => (Math.abs(apca(c, bg)) > Math.abs(apca(best, bg)) ? c : best))
}

// 色块上的正文级文字（高亮块正文、标签）：设计指定的 accent-on 达到 ROLE_FLOORS.onText 就用它；
// 不达标（安全橙、中等明度的品牌绿上的白字）换成达标的候选；都不达标取 WCAG 最高的
function onText(bg, preferred, candidates) {
  const floor = ROLE_FLOORS.onText
  if (passes(preferred, bg, floor)) return preferred
  return candidates.find((c) => passes(c, bg, floor)) || candidates.reduce((best, c) => (wcag(c, bg) > wcag(best, bg) ? c : best))
}

// 强调色小字既出现在纸色上，也出现在 paper-2 / 灰底卡片上：按两者里对比更低的那个底色来调
const harderBg = (fg, bgs) => bgs.reduce((a, b) => (Math.abs(apca(fg, b)) < Math.abs(apca(fg, a)) ? b : a))

function deriveMagazine(t) {
  const roles = {
    textBody: inkRole(t.ink, t.paper, 0.82, ROLE_FLOORS.textBody),
    textSecondary: inkRole(t.ink, t.paper, 0.72, ROLE_FLOORS.textSecondary),
    // 手调的 muted 达标就用它，否则从 paper→ink 派生一个达标的
    textHelper: passes(t.muted, t.paper, ROLE_FLOORS.textHelper)
      ? { hex: t.muted, adjusted: false }
      : inkRole(t.ink, t.paper, 0.55, ROLE_FLOORS.textHelper),
    lineStrong: inkRole(t.ink, t.paper, 0.45),
    line: inkRole(t.ink, t.paper, 0.22),
    lineSubtle: inkRole(t.ink, t.paper, 0.12),
    accentInk: textSafeAccent(t.accent, harderBg(t.accent, [t.paper, t.paper2])),
  }
  return {
    vars: {
      '--paper': t.paper, '--paper-2': t.paper2, '--ink': t.ink, '--muted': t.muted,
      '--accent': t.accent, '--accent-soft': t.accentSoft,
      '--accent-on': onColor(t.accent, [t.ink, t.paper]),
      '--accent-ink': roles.accentInk.hex,
      '--accent-display': accentDisplay(t.accent, roles.accentInk.hex, t.paper),
      // 反色块（以墨色为底）上的强调色文字：同色相提亮到可读，墨水经典的 #111 会变成浅灰
      '--accent-ink-inverse': textSafeAccent(t.accent, t.ink).hex,
      '--text-primary': t.ink,
      '--text-body': roles.textBody.hex,
      '--text-secondary': roles.textSecondary.hex,
      '--text-helper': roles.textHelper.hex,
      '--line-strong': roles.lineStrong.hex,
      '--line': roles.line.hex,
      '--line-subtle': roles.lineSubtle.hex,
      '--ink-rgb': rgbTriplet(t.ink), '--paper-rgb': rgbTriplet(t.paper), '--accent-rgb': rgbTriplet(t.accent),
      '--accent-on-rgb': rgbTriplet(onColor(t.accent, [t.ink, t.paper])),
      '--accent-on-text': onText(t.accent, onColor(t.accent, [t.ink, t.paper]), [t.ink, t.paper, '#ffffff']),
      '--accent-on-text-rgb': rgbTriplet(onText(t.accent, onColor(t.accent, [t.ink, t.paper]), [t.ink, t.paper, '#ffffff'])),
    },
    roles,
  }
}

function deriveSwiss(n, t) {
  const textBody = inkRole(n.ink, n.paper, 0.86, ROLE_FLOORS.textBody)
  return {
    vars: {
      '--paper': n.paper, '--paper-2': n.grey1, '--ink': n.ink, '--muted': n.grey3,
      '--grey-1': n.grey1, '--grey-2': n.grey2, '--grey-3': n.grey3,
      '--accent': t.accent, '--accent-on': t.accentOn, '--accent-ink': t.accentInk,
      '--accent-bright': t.accentBright, '--accent-deep': t.accentDeep,
      '--accent-display': accentDisplay(t.accent, t.accentInk, n.paper),
      // 墨色块上的强调色文字：优先用手调的 accent-bright（IKB 的亮蓝），不够再按规则提亮
      '--accent-ink-inverse': textSafeAccent(t.accentBright, n.ink).hex,
      '--accent-soft': mix(n.paper, t.accent, 0.14),
      '--text-primary': n.ink,
      '--text-body': textBody.hex,
      '--text-secondary': n.textSecondary,
      '--text-helper': n.grey3,
      '--text-placeholder': n.textPlaceholder,
      '--text-on-color': t.accentOn,
      '--line-strong': n.textPlaceholder,
      '--line': n.grey2,
      '--line-subtle': n.borderSubtle,
      '--ink-rgb': rgbTriplet(n.ink), '--paper-rgb': rgbTriplet(n.paper), '--accent-rgb': rgbTriplet(t.accent),
      '--accent-on-rgb': rgbTriplet(t.accentOn),
      '--accent-on-text': onText(t.accent, t.accentOn, [n.ink, '#ffffff']),
      '--accent-on-text-rgb': rgbTriplet(onText(t.accent, t.accentOn, [n.ink, '#ffffff'])),
    },
    roles: { textBody },
  }
}

// 对一套已派生的主题做可读性体检，返回不达标项（不抛错，由调用方决定是失败还是警告）
function auditTheme(vars) {
  const bg = vars['--paper']
  const checks = [
    ['--text-body', ROLE_FLOORS.textBody],
    ['--text-secondary', ROLE_FLOORS.textSecondary],
    ['--text-helper', ROLE_FLOORS.textHelper],
    ['--accent-ink', ROLE_FLOORS.accentInk],
  ]
  const out = []
  for (const [k, floor] of checks) {
    const fg = vars[k]
    const r = { token: k, fg, bg, wcag: +wcag(fg, bg).toFixed(2), apca: +apca(fg, bg).toFixed(1) }
    if (!passes(fg, bg, floor)) out.push({ ...r, floor })
  }
  // 强调色小字也会放在 paper-2 / 灰底卡片上
  const bg2 = vars['--paper-2']
  if (bg2 && !passes(vars['--accent-ink'], bg2, ROLE_FLOORS.accentInk)) {
    out.push({ token: '--accent-ink', fg: vars['--accent-ink'], bg: bg2, wcag: +wcag(vars['--accent-ink'], bg2).toFixed(2), apca: +apca(vars['--accent-ink'], bg2).toFixed(1), floor: ROLE_FLOORS.accentInk })
  }
  // 色块上的正文级文字
  const onT = vars['--accent-on-text']
  if (onT && !passes(onT, vars['--accent'], ROLE_FLOORS.onText)) {
    out.push({ token: '--accent-on-text', fg: onT, bg: vars['--accent'], apca: +apca(onT, vars['--accent']).toFixed(1), wcag: +wcag(onT, vars['--accent']).toFixed(2), note: '色块上只放大号粗体' })
  }
  // accent 上的文字：大号粗体允许到 Lc 45（APCA 标题线），小字要 60
  const onLc = Math.abs(apca(vars['--accent-on'], vars['--accent']))
  if (onLc < 60) out.push({ token: '--accent-on', fg: vars['--accent-on'], bg: vars['--accent'], apca: +onLc.toFixed(1), wcag: +wcag(vars['--accent-on'], vars['--accent']).toFixed(2), note: onLc >= 45 ? '只能用于大号粗体' : '不可用于文字' })
  return out
}

// 受约束的品牌主题：用户给任意品牌色，生成一套符合家族审美的主题。
//
// 不直接用原色。每个颜色槽位都有一个明度 / 彩度区间，区间来自现有精调色板的 OKLCH 实测
// （见 docs/decisions.md D9），品牌色只贡献色相和「有多鲜艳」的倾向，最终落在区间里。
// 生成后走和内置主题同一套派生与体检（lib/theme.mjs），不达标就不返回主题。


const r3 = (x) => Math.round(x * 1000) / 1000

// 由 tokens/palettes.json 的浅色杂志主题实测（node 脚本见 docs/decisions.md D9）
const MAGAZINE_BANDS = {
  paper: { l: [0.909, 0.963], c: [0.003, 0.036] },
  paper2: { l: [0.864, 0.929], c: [0.007, 0.039] },
  ink: { l: [0.145, 0.279], c: [0.002, 0.063] },
  muted: { l: [0.499, 0.527], c: [0.015, 0.044] },
  accent: { l: [0.4, 0.58], c: [0.04, 0.12] },
  accentSoft: { l: [0.792, 0.905], c: [0.018, 0.063] },
}

// 瑞士风四个强调色实测彩度 0.181–0.207，下限放宽到 0.15；明度不限，但要留出能派生 bright / deep 的空间
const SWISS_BANDS = { accent: { l: [0.35, 0.9], c: [0.15, 0.32] } }

function place(slot, l, c, h, band, notes) {
  const L = clamp(l, ...band.l)
  const C = Math.min(clamp(c, ...band.c), maxChroma(L, h))
  if (Math.abs(L - l) > 0.02) notes.push(`${slot} 明度 ${r3(l)} → ${r3(L)}`)
  if (Math.abs(C - c) > 0.01) notes.push(`${slot} 彩度 ${r3(c)} → ${r3(C)}`)
  return oklchToHex({ l: L, c: C, h })
}

// 纸张是「有一点颜色的米白」：现有 5 套里 4 套是暖米色（色相 80–90°），靛蓝瓷是几乎无彩的冷白。
// 所以暖色系品牌把纸张色相往 85° 拉，其余色相只留极低彩度，避免红色品牌生成粉色纸
function paperTone(b, neutral) {
  if (neutral) return { h: 85, c: 0.007 }
  const warm = b.h >= 20 && b.h <= 115
  return warm ? { h: 85 + (b.h - 85) * 0.3, c: clamp(b.c * 0.05, 0.006, 0.014) } : { h: b.h, c: clamp(b.c * 0.02, 0.003, 0.006) }
}

function magazineFromBrand(brandHex, { name = '品牌主题' } = {}) {
  const b = hexToOklch(brandHex)
  const notes = []
  const B = MAGAZINE_BANDS
  // 品牌色很灰（c<0.02）时按墨水经典处理：色相没有意义，强调色就用墨色
  const neutral = b.c < 0.02
  const h = neutral ? 85 : b.h
  const paper = paperTone(b, neutral)
  const ink = place('ink', 0.22, neutral ? 0.004 : clamp(b.c * 0.35, 0.01, 0.06), h, B.ink, [])
  if (neutral) notes.push('品牌色接近中性灰，强调色改用墨色（同墨水经典）')
  const accent = neutral ? ink : place('accent', b.l, b.c, b.h, B.accent, notes)
  const t = {
    name, scheme: 'light',
    paper: place('paper', 0.95, paper.c, paper.h, B.paper, []),
    paper2: place('paper2', 0.91, paper.c + 0.006, paper.h, B.paper2, []),
    ink,
    muted: place('muted', 0.51, neutral ? 0.015 : clamp(b.c * 0.3, 0.015, 0.044), h, B.muted, []),
    accent,
  }
  t.accentSoft = neutral ? place('accentSoft', 0.86, 0.018, paper.h, B.accentSoft, []) : place('accentSoft', 0.85, clamp(hexToOklch(accent).c * 0.35, 0.018, 0.063), b.h, B.accentSoft, [])
  return finish('magazine', t, deriveMagazine(t), notes)
}

function swissFromBrand(brandHex, neutrals, { name = '品牌主题' } = {}) {
  const b = hexToOklch(brandHex)
  const notes = []
  if (b.c < 0.04) {
    return { ok: false, reason: `品牌色 ${brandHex} 几乎没有彩度，瑞士风需要一个高饱和强调色。可以改用杂志风，或从 logo 里另选一个颜色。` }
  }
  const accent = place('accent', b.l, b.c, b.h, SWISS_BANDS.accent, notes)
  const a = hexToOklch(accent)
  const t = {
    name, accent,
    accentBright: oklchToHex({ l: Math.min(a.l + 0.18, 0.92), c: a.c, h: a.h }),
    accentDeep: oklchToHex({ l: Math.max(a.l - 0.15, 0.2), c: a.c, h: a.h }),
  }
  // accent-on / accent-ink 交给派生规则算，和内置主题一致
  const probe = deriveSwiss(neutrals, { ...t, accentOn: neutrals.ink, accentInk: accent })
  t.accentOn = pickOn(accent, neutrals)
  // 强调色小字也放在灰底卡片（grey-1）上，按更暗的灰底来调
  t.accentInk = textSafe(accent, neutrals.grey1)
  return finish('swiss', t, deriveSwiss(neutrals, t), notes)
}

const pickOn = (accent, n) => (Math.abs(apca('#ffffff', accent)) > Math.abs(apca(n.ink, accent)) ? '#ffffff' : n.ink)
const textSafe = (accent, paper) => textSafeAccent(accent, paper).hex

function finish(family, theme, derived, notes) {
  const problems = auditTheme(derived.vars)
  const hard = problems.filter((p) => !p.note)
  if (hard.length) return { ok: false, family, theme, reason: hard.map((p) => `${p.token} 对比度不足（APCA ${p.apca}）`).join('；') }
  return { ok: true, family, theme, vars: derived.vars, notes, limits: problems.filter((p) => p.note).map((p) => `${p.token}：${p.note}`) }
}

// 预览用：把品牌色和生成结果并排给出
const describe = (r) => (r.ok ? `${r.family} ✓ accent ${r.theme.accent} paper ${r.theme.paper || ''} ink ${r.theme.ink || ''}${r.notes.length ? '｜调整：' + r.notes.join('，') : ''}` : `✗ ${r.reason}`)

const SWISS_NEUTRALS = {"paper":"#fafaf8","ink":"#0a0a0a","grey1":"#f0f0ee","grey2":"#d4d4d2","grey3":"#737373","textSecondary":"#525252","textPlaceholder":"#a3a3a3","borderSubtle":"#e0e0e0"}
const args = process.argv.slice(2)
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d)
if (args[0] !== 'brand' || !args[1]) {
  console.error('用法：node scripts/gz-theme.mjs brand "#4D6BFE" [--family magazine|swiss] [--id brand]')
  process.exit(1)
}
const family = opt('--family', 'magazine'), id = opt('--id', 'brand')
const r = family === 'swiss' ? swissFromBrand(args[1], SWISS_NEUTRALS) : magazineFromBrand(args[1])
if (!r.ok) { console.error('✗ ' + r.reason); process.exit(1) }
const v = r.vars
// 一行说清楚：强调色调了什么、小字和色块上的文字各用什么颜色、有什么限制
const parts = [
  r.notes.length ? r.notes.join('；') : `强调色保持 ${v['--accent']}`,
  `小字强调色 ${v['--accent-ink']}`,
  `色块上的文字 ${v['--accent-on-text']}${v['--accent-on-text'] !== v['--accent-on'] ? `（${v['--accent-on']} 只够大号粗体）` : ''}`,
  ...r.limits.filter((l) => !l.startsWith('--accent-on：')),
]
console.log(`/* 品牌主题 ${args[1]} · ${family}：${parts.join('；')} */`)
console.log(`[data-theme="${id}"]{${Object.entries(r.vars).map(([k, v]) => `${k}:${v}`).join(';')};color-scheme:light}`)
