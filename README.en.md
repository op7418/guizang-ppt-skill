# Guizang PPT Skill · Web Decks / Images / Covers

![GitHub stars](https://img.shields.io/github/stars/op7418/guizang-ppt-skill?style=flat-square)
![License](https://img.shields.io/github/license/op7418/guizang-ppt-skill?style=flat-square)
![Skill](https://img.shields.io/badge/Skill-Agent-111111?style=flat-square)
![HTML Deck](https://img.shields.io/badge/HTML-Deck-0A7CFF?style=flat-square)
![Claude Code](https://img.shields.io/badge/Claude%20Code-Supported-6B5B95?style=flat-square)
![Codex](https://img.shields.io/badge/Codex-Supported-222222?style=flat-square)
[![Supported by ZhenFund Token Grant](https://img.shields.io/static/v1?label=ZhenFund%20Token%20Grant&message=Supported&color=FF4D00&style=flat-square)](https://zhenfund.feishu.cn/share/base/form/shrcn1lAANF659o7EpWnxlR1VOh?sessionid=)
![360 Security Lobster Gold Sponsor](https://img.shields.io/static/v1?label=360%20Security%20Lobster&message=Gold%20Sponsor&color=1677FF&style=flat-square)
![Kimi work Gold Sponsor](https://img.shields.io/static/v1?label=Kimi%20work&message=Gold%20Sponsor&color=111111&style=flat-square)
![Cola Skill Gold Sponsor](https://img.shields.io/static/v1?label=Cola%20Skill&message=Gold%20Sponsor&color=E4353F&style=flat-square)

An agent skill for Claude Code, Codex, and similar coding-agent environments. It generates **single-file HTML horizontal-swipe decks**, deck visuals, and social cover pages, with a complete rehearsal and presenter mode built in.

It ships with two visual systems:

- **Style A: editorial magazine × electronic ink**. Picture *Monocle* with code stitched in. Best for narrative talks, opinions, salons, and personal voice.
- **Style B: Swiss International Typographic Style**. Grid-first, one high-saturation anchor color, sharp rectangles, hairline rules, and extreme type contrast. Best for facts, products, analysis, and frameworks.

> Distilled by [Guizang](https://x.com/op7418) from offline talks like "One-Person Company: Organizations Folded by AI" and "A New Way of Working." Every pitfall hit during those decks is logged in `checklist.md`.
> Sponsor and supporter details are listed in [SPONSORS.md](./SPONSORS.md).

**Old Theme · Style A Editorial Magazine**

![Style A Editorial Magazine preview](https://github.com/user-attachments/assets/5dc316a2-401c-4e37-9123-ea081b6ae470)

**New Theme · Style B Swiss International**

![Style B Swiss International preview](https://github.com/user-attachments/assets/8960e78c-69bb-4b7e-aa95-6fad64b70314)

## 30-second start

```bash
npx skills add https://github.com/op7418/guizang-ppt-skill --skill guizang-ppt-skill
```

Or paste this to an AI agent with shell access:

```text
Install guizang-ppt-skill for me. Clone https://github.com/op7418/guizang-ppt-skill into ~/.claude/skills/guizang-ppt-skill, then verify that SKILL.md, assets/, and references/ exist.
```

If you already installed it, update with:

```text
Update guizang-ppt-skill for me. Go to ~/.claude/skills/guizang-ppt-skill, run git pull, then tell me the latest commit.
```

Then ask your agent:

```text
Create a Swiss-style deck from this article, around 7 slides, with 2-3 generated visuals.
```

Other useful prompts:

```text
Turn this Markdown file into an editorial magazine-style presentation.
Create a 21:9 social cover from the core idea of this deck.
Redesign this product screenshot as a 16:10 slide visual.
Add speaker notes and planned timing to this deck, then help me rehearse it in presenter mode.
```

## Sponsors and Supporters

<a href="./SPONSORS.md">
  <img src="https://github.com/user-attachments/assets/81138fad-31b9-49ab-8e38-23b2bc48edc4" alt="360 Security Lobster / Kimi work / Cola Skill Gold Sponsors" width="100%">
</a>

Guizang PPT Skill is supported by **360 Security Lobster**, **Kimi work**, and **Cola Skill** as Gold Sponsors and by [ZhenFund Token Grant](https://zhenfund.feishu.cn/share/base/form/shrcn1lAANF659o7EpWnxlR1VOh?sessionid=). See [SPONSORS.md](./SPONSORS.md) for details.

### Use Guizang PPT Skill elsewhere

Beyond Claude Code / Codex, you can also use Guizang PPT Skill on these platforms:

| Channel | Link |
|---------|------|
| 360 Security Lobster | [claw.360.cn](https://claw.360.cn/claw?vm_id=p19c1be5d7bed40bcb857ec4a9c785b69&target_url=https%3A%2F%2Fp19c1be5d7bed40bcb857ec4a9c785b69.claw.360.cn%2Fagents) |
| Cola Skill | [colaskill.com/guizang-ppt-skill](https://colaskill.com/guizang-ppt-skill/) |
| Kimi work | [kimi.com](https://www.kimi.com/zh-cn/products/kimi-work) (after installing, search "guizang ppt skill" in the Skill store) |

## What you get

- 🖋 **Two visual systems**: editorial storytelling for Style A, factual Swiss structure for Style B
- 📐 **Horizontal swipe navigation**: ← → arrows / scroll wheel / touch swipe / bottom dots / ESC for index
- 🧩 **Style A 10 layouts**: cover, divider, big numbers, image/text, image grid, pipeline, comparison, and more
- 🧱 **Style B 22 locked layouts**: Cover, Statement, KPI Tower, Loop Diagram, Duo Compare, Image Hero, Closing Manifesto, and more
- 🎨 **Curated theme presets**: 5 electronic-ink themes for Style A, 4 Swiss anchor-color themes for Style B
- 🖼 **Optional Codex image flow**: generate documentary photos, infographics, flow diagrams, system maps, and UI scenes with GPT-Image 2.0 / GPT-M 2.0, then insert them at template-safe ratios
- 📰 **Social covers**: generate 21:9 WeChat cover images, 1:1 share cards, 3:4 Xiaohongshu covers, video thumbnails, and related variants
- 🎤 **Presenter mode**: dual-window audience output, 16:9 current/next previews, speaker notes, timing and rehearsal, auto advance, laser pointer, circles, and live recovery controls
- 📴 **Low-power static mode**: press `B` to turn WebGL / canvas animation into static visuals
- 📄 **Single HTML file** — no build, no server, open directly in the browser

## Fits / Doesn't fit

**✅ Fits**: offline talks, industry keynotes, private salons, AI product launches, demo day, presentations with strong personal voice

**❌ Doesn't fit**: data-heavy tables, training decks (density too low), multi-user collaborative editing (static HTML)

## Common use cases

| Task | Recommended flow |
|------|------------------|
| Long article to talk deck | Extract the core argument, then build a 6-10 slide rhythm |
| Framework / product analysis | Use Style B Swiss with locked layouts and 21:9 hero visuals |
| Personal talk / opinion piece | Use Style A editorial magazine for stronger narrative rhythm |
| Deck visuals | In Codex, generate photos, infographics, flow diagrams, system maps, or UI scenes |
| Social covers | Generate 21:9 main covers, 1:1 share cards, 3:4 vertical covers, and video thumbnails from the same idea |
| Screenshot normalization | Redesign raw screenshots into template-safe ratios before inserting them into slides |
| Live talk / rehearsal | Ask the agent to generate notes and timing, then press the bottom-right `P` to enter presenter mode |

## Why HTML decks

- **Agent-native editing**: HTML / CSS is plain text, so agents can read, edit, and validate it directly.
- **Higher visual density than Markdown**: precise layout, positioning, motion, interactivity, and cover formats.
- **Lightweight delivery**: one HTML file can be opened, presented, sent, screenshotted, or recorded, with presenter tools included.
- **Better quality gates**: the Swiss validator can catch layout drift, unsafe image placement, centered body titles, and SVG text traps.
- **One visual system across outputs**: decks, generated visuals, covers, and screenshot redesigns can share the same style rules.

## Platform support

| Platform | Status | Notes |
|----------|--------|-------|
| Claude Code | Supported | Native Skill workflow for creating and iterating HTML decks |
| Codex | Supported | Good for deck generation, image generation, and browser-based visual QA |
| Cursor / other local agents | Works | Requires filesystem access and shell execution |
| WorkBuddy | In adaptation | Marketplace-ready version is being prepared separately |
| Plain chatbot | Not recommended | Without filesystem and browser preview, full deck generation is hard to stabilize |

## Install

### Option 1: One-line install (recommended)

```bash
npx skills add https://github.com/op7418/guizang-ppt-skill --skill guizang-ppt-skill
```

### Option 2: Paste this to an AI

> Install the `guizang-ppt-skill` Claude Code skill for me. Steps:
>
> 1. Make sure `~/.claude/skills/` exists (create if not)
> 2. Run `git clone https://github.com/op7418/guizang-ppt-skill.git ~/.claude/skills/guizang-ppt-skill`
> 3. Verify: `ls ~/.claude/skills/guizang-ppt-skill/` should show `SKILL.md`, `assets/`, `references/`
> 4. Tell me when done. Later, saying things like "make me a magazine-style deck" will trigger this skill.

Paste the block above into Claude Code / Cursor / any AI agent with shell access and it handles the install.

### Option 3: Manual CLI

```bash
git clone https://github.com/op7418/guizang-ppt-skill.git ~/.claude/skills/guizang-ppt-skill
```

### How to trigger it

Once installed, Claude Code auto-detects the skill. Trigger phrases:

- "Make me a magazine-style deck"
- "Make me a Swiss-style deck"
- "Generate a horizontal swipe deck"
- "Editorial magazine style presentation"
- "Electronic ink slides for my talk"
- "Create a 21:9 WeChat cover from this article"
- "Create a 1:1 share card from this deck"
- "Add speaker notes to this deck and help me rehearse it in presenter mode"

## Workflow

The skill is a structured workflow; the agent walks you through each step:

1. **Choose style** — Style A editorial magazine, or Style B Swiss International
2. **Clarify intent** — 7-question checklist: style, audience, duration, source material, images/screenshots, theme, hard constraints
3. **Copy template** — Style A uses `assets/template.html`; Style B uses `assets/template-swiss.html`
4. **Fill content** — create a rhythm plan, then choose and adapt the matching layout skeletons
5. **Optional image generation** — in Codex, ask whether to use GPT-Image 2.0 / GPT-M 2.0 images, then insert them at page-appropriate ratios
6. **Generate speaker notes** — derive each slide's purpose, talking points, transition, and planned duration from the outline; do not invent missing live details
7. **Self-check** — match against `references/checklist.md`; P0 issues must all pass; run the Swiss and presenter validators when applicable
8. **Preview** — open the HTML in a browser
9. **Rehearse / present** — press the bottom-right `P`, verify audience sync, and record actual timing
10. **Iterate** — adjust content, font size, height, and spacing from rehearsal results

Full spec in [`SKILL.md`](./SKILL.md).

## Presenter mode

Both templates ship with the same presenter runtime. Open a deck and press the bottom-right `P` to enter presenter view; the browser opens a clean audience window at the same time. Core features run entirely inside the local HTML and browser—no live-caption service, cloud relay, phone remote, or AI coaching service is required.

**Presenter view example**

![Presenter view with current and next slides, speaker notes, timing controls, and audience status](https://github.com/user-attachments/assets/95db62b5-65bb-40af-ac0b-1d415682af88)

### What the speaker sees

- **Current and next slides**: stacked vertically and always kept at `16:9`; small windows scale the whole slide without cropping or reflowing its text
- **Grid navigation**: replace the preview area with an inline overview, choose a slide, then return immediately to the two previews while the audience follows
- **Structured notes**: title, purpose, talking points, and transition are required; interaction, delivery, advance cue, fallback, and pronunciation appear only when supplied by the outline
- **Progress and health**: current / total slide count, completion percentage, plus audience states for connecting, synced, unsynced, frozen, disconnected, or popup blocked

### Timing, rehearsal, and auto advance

- The footer separates elapsed, current-slide, and remaining / overtime values, with explicit “Start timer / Resume timer / Reset timer” controls
- Rehearsal mode records actual time per slide and a local session summary; it does not grade the speaker with AI
- Auto advance is off by default and only runs when the outline provides per-slide seconds or the user enables a global interval
- Auto advance pauses while the grid, settings, or annotation tool is open, when the page is hidden, or when the audience is paused or out of sync

### Live tools and recovery

- Laser pointer, circle annotation, and clear actions sync to the audience window
- Black screen, white screen, or freeze the audience; unfreezing catches it up to the presenter's current slide
- Closing the audience window or losing its heartbeat produces a visible “Disconnected” state; “Reopen audience” is always available
- Exiting presenter mode closes the audience window when allowed, or leaves a clear “Presentation ended” fallback
- Preflight checks cover popups, fullscreen, fonts, images / video, and `16:9` previews, while reminding the speaker to verify HDMI adapters and projectors manually

Common shortcuts: `← / →` navigate, `Home / End` jump to first or last, `G` opens the grid, `L` laser, `C` circle, `B / W` black or white screen, `F` freezes the audience, and `?` opens the full shortcut list.

Ask an agent to prepare presenter mode with:

```text
Use this outline to add a purpose, talking points, transition, and planned duration to every slide. Do not invent interaction or live details that were not provided, then run the presenter-mode validator.
```

See [`references/presenter-mode.md`](./references/presenter-mode.md) for the full notes contract and runtime behavior. Validate with:

```bash
node scripts/validate-presenter-mode.mjs path/to/index.html
node scripts/validate-presenter-mode.mjs path/to/index.html --target-minutes 30
```

## Style B Swiss

The Swiss theme is a strict layout system, not just a CSS skin.

- **22 named layouts**: body slides must use `S01` to `S22`; do not invent new structures
- **4 anchor colors**: International Klein Blue, lemon yellow, lemon green, safety orange
- **Grid lock**: 16-column grid, sharp rectangles, 1px hairlines, no shadows, no gradients, no rounded cards
- **Chinese title scaling**: all-Chinese headlines should be one step smaller to preserve space for content and images
- **Image/text bottom alignment**: text and image blocks should align at the bottom in left/right image layouts, while staying clear of pagination controls
- **Image slots**: images must sit in template-defined `data-image-slot` regions, often generated at 21:9 or 16:10
- **Hard validation**: the validator catches centered body titles, experimental layouts, visible SVG text, and images placed outside slots

Swiss validation:

```bash
node scripts/validate-swiss-deck.mjs path/to/index.html
node scripts/validate-swiss-deck.mjs path/to/index.html --static-only
```

The default command adds rendered measurements when Playwright is available. Use `--static-only` for deterministic contract checks in CI. P23/P24 require an explicit user request for experimental layouts and the additional `--allow-experimental` flag.

## Codex Image Flow

In Codex, after the first deck draft is ready, the agent can ask whether the user wants generated visuals. Once confirmed, choose an image type or style. Common types include:

- Documentary photos: Fuji / Leica-like real-world scenes that add human texture
- Infographics / flow diagrams / comparison charts / system maps: for concepts that cannot be explained well with photos
- Screenshot framing / screenshot redesigns: preserve raw screenshots with bundled background assets and a CleanShot X-style canvas first; use UI scene generation only when the screenshot needs reconstruction
- Data posters / charts: turn key numbers into insert-ready visual assets
- Multi-image compositions: useful for ultra-wide slots where three unrelated 16:9 images would break the grid

Generated images must follow four core rules:

- Treat the image as an embedded asset, not a standalone slide: no footer, page bottom, title, page number, corner mark, signature, or decorative border
- Match the deck language: Chinese decks use Chinese labels inside infographics, English decks use English labels
- Match the slot ratio before generation: 21:9 for many Swiss hero slots, 16:9 / 16:10 for common main visuals, 16:10 for UI scenes, fixed equal heights for image grids
- When a raw screenshot must stay faithful, read `references/screenshot-framing.md` first and use bundled `assets/screenshot-backgrounds/` backgrounds plus programmatic scaling, padding, and alignment instead of redrawing the screenshot by default

Image prompts live in [`references/image-prompts.md`](./references/image-prompts.md). Screenshot framing lives in [`references/screenshot-framing.md`](./references/screenshot-framing.md).

## Cover Generation

The skill can also turn an article or deck idea into platform covers:

- **WeChat main cover**: 21:9, headline-first, with one visual anchor
- **WeChat share card**: 1:1, visually paired with the 21:9 cover
- **Xiaohongshu cover / carousel**: 3:4, large title, consistent type scale across a batch
- **Video thumbnail**: 16:9, title + subtitle + one focal visual

The same rule applies: use a few strong keywords, keep the title as the visual center, and do not fill the canvas with body copy.

## Example prompts

Copy any of these prompts into your agent, then attach your article, Markdown file, or image assets:

```text
Create an 8-slide Swiss-style deck from this article, with 3 generated visuals matched to the template image slots.
```

```text
Turn this product analysis document into an editorial magazine-style deck with a strong narrative rhythm.
```

```text
From this deck's core idea, create two covers: a 21:9 main cover and a visually paired 1:1 share card.
```

```text
Redesign these product screenshots into consistent 16:10 slide visuals. Preserve key UI information; do not add slide titles or footers inside the images.
```

## Directory

```
guizang-ppt-skill/
├── SKILL.md              ← main skill file: workflow, principles, common mistakes
├── README.md             ← Chinese README
├── README.en.md          ← this file
├── assets/
│   ├── template.html         ← Style A editorial magazine template
│   ├── template-swiss.html   ← Style B Swiss template
│   └── screenshot-backgrounds/ ← bundled WebP screenshot backgrounds: 5 style-a / 4 style-b
├── scripts/
│   ├── validate-swiss-deck.mjs ← Swiss layout validator
│   ├── validate-presenter-mode.mjs ← speaker notes, timing, and runtime validator
│   └── check-presenter-runtime-sync.mjs ← cross-template presenter runtime drift check
└── references/
    ├── components.md     ← component catalog (type, color, grid, icons, callout, stat, pipeline)
    ├── layouts.md        ← 10 layout skeletons (paste-ready)
    ├── layouts-swiss.md  ← 22 locked Swiss layouts
    ├── swiss-layout-lock.md ← Swiss fidelity and layout hard rules
    ├── themes.md         ← 5 theme presets (pick, don't customize)
    ├── themes-swiss.md   ← 4 Swiss anchor-color themes
    ├── image-prompts.md  ← GPT-Image 2.0 / GPT-M 2.0 image types, ratios, and base prompts
    ├── screenshot-framing.md ← CleanShot X-style screenshot framing semantics
    ├── presenter-mode.md ← notes contract, rehearsal, audience output, and live tools
    └── checklist.md      ← quality checklist (P0 / P1 / P2 / P3 tiers)
```

## Theme presets

Pick from `references/themes.md`. **Custom hex values are not allowed** — protecting the aesthetic matters more than freedom of choice.

### Style A Editorial Themes

| Preview | Theme | Core colors and best for |
|---------|-------|--------------------------|
| <img src="https://github.com/user-attachments/assets/df21dbcb-5fe4-4852-a91a-a9cf00aceeb4" width="260" alt="Ink Classic theme preview"> | 🖋 **Ink Classic** | `#0a0a0b` / `#f1efea`. General default, commercial launches, when in doubt. |
| <img src="https://github.com/user-attachments/assets/99ce0fd2-72a6-4368-a75a-a8e21657a537" width="260" alt="Indigo Porcelain theme preview"> | 🌊 **Indigo Porcelain** | `#0a1f3d` / `#f1f3f5`. Tech, research, AI, technical keynotes. |
| <img src="https://github.com/user-attachments/assets/bcc1cc4c-5e8e-4467-ae8d-f5801ae73657" width="260" alt="Forest Ink theme preview"> | 🌿 **Forest Ink** | `#1a2e1f` / `#f5f1e8`. Nature, sustainability, culture, non-fiction. |
| <img src="https://github.com/user-attachments/assets/dfea080e-e916-417e-93cd-0a3628de84ca" width="260" alt="Kraft Paper theme preview"> | 🍂 **Kraft Paper** | `#2a1e13` / `#eedfc7`. Nostalgic, humanist, literary, indie zines. |
| <img src="https://github.com/user-attachments/assets/f3705592-9a72-4dbc-9818-df3aea61bc75" width="260" alt="Dune theme preview"> | 🌙 **Dune** | `#1f1a14` / `#f0e6d2`. Art, design, creative, fashion, gallery-like decks. |

Switching themes only requires replacing the 6 variables at the top of `template.html`'s `:root{}` block — all other CSS flows through `var(--...)`.

### Style B Swiss Themes

Pick from `references/themes-swiss.md`. **Custom hex values are not allowed** here either.

| Preview | Theme | Anchor color and best for |
|---------|-------|---------------------------|
| <img src="https://github.com/user-attachments/assets/c02d02f7-ce6f-4e16-b8a6-778c96851f94" width="260" alt="International Klein Blue Swiss theme preview"> | 🔵 **International Klein Blue** | `#002FA7`. Default, commercial launches, AI products, frameworks. |
| <img src="https://github.com/user-attachments/assets/c310a8c4-5d28-450e-b49a-6ac5b6ba4785" width="260" alt="Lemon Yellow Swiss theme preview"> | 🟡 **Lemon Yellow** | `#FFD500`. Youth, sports, retail, consumer goods, Y2K retro. |
| <img src="https://github.com/user-attachments/assets/65f7b3f9-3358-419e-b513-f7f2cc24ec76" width="260" alt="Lemon Green Swiss theme preview"> | 🟢 **Lemon Green** | `#C5E803`. Ecology, sustainability, health, Gen Z brands. |
| <img src="https://github.com/user-attachments/assets/9c3319c9-a134-4657-9a56-211c23411f7f" width="260" alt="Safety Orange Swiss theme preview"> | 🟠 **Safety Orange** | `#FF6B35`. Alerts, news, industrial topics, sports, energetic themes. |

If the user asks for a Swiss-style deck without specifying color, default to International Klein Blue.

## Core design principles

1. **Restraint over flash** — WebGL backgrounds only bleed through on hero pages
2. **Structure over decoration** — information hierarchy via type size + typeface + grid whitespace, not shadows or floating cards
3. **Images are first-class citizens** — align them with the body content area, keep ratios stable, crop only from the bottom, and preserve top/sides
4. **Generated visuals are assets** — keep only the core photo / chart / UI; do not render slide titles, footers, or corner marks inside the image
5. **Rhythm lives on hero pages** — hero / non-hero alternation keeps the eye from fatiguing
6. **Dynamic effects must be optional** — `B` toggles static mode so animation never becomes a reading burden
7. **Terms stay consistent** — Skills is Skills; no mix-and-match translations
8. **Swiss layouts stay locked** — Style B should restore and reuse the original 22-page layout system instead of inventing unrelated pages

## Visual references

- [*Monocle*](https://monocle.com) magazine layouts
- YC Garry Tan — "Thin Harness, Fat Skills"
- Massimo Vignelli / Helvetica Forever / Swiss International Typographic Style
- Guizang's offline talk deck series

## Roadmap

- Add more real-world examples and openable HTML deck demos
- Expand cover formats for more publishing platforms
- Add more Swiss layout validation rules
- Improve screenshot redesign and infographic generation workflows
- Prepare marketplace-specific variants such as WorkBuddy
- Add more curated theme packs while keeping custom colors restricted

## FAQ

**Can it export to PPTX?**
The main output is HTML. You can present it in a browser, screenshot it, or record it. PPTX conversion can be done as a separate workflow, but it is not the core path today.

**Why are custom colors not allowed?**
The skill is designed for stable visual output. Arbitrary colors often break the system, so decks must use curated presets.

**Can I add my own layout?**
Yes. Style A layouts can be extended in `references/layouts.md`. Style B is stricter: update `template-swiss.html`, `layouts-swiss.md`, `swiss-layout-lock.md`, and the validator together.

**Is Codex image generation required?**
No. Decks work without generated images. The image flow is only used when you need photos, infographics, UI scenes, or covers.

**Does presenter mode require internet access or another service?**
No. Dual-window sync, notes, timing, rehearsal, auto advance, and annotations run locally in the browser. It does not provide live captions, phone control, or AI rehearsal scoring.

**Why does closing the audience window show “Disconnected”?**
The presenter uses acknowledgements and heartbeats to verify the software link. Closing the window or losing its heartbeat produces “Disconnected”; use “Reopen audience” to recover. The browser cannot verify a physical HDMI or projector cable, so the speaker still needs a visual check.

**How do I update the skill?**
Run the install command again, or run `git pull` inside your local skill directory.

## Contributing

Bugs, layout issues, new layout requests — Issues and PRs welcome. Prioritize:

- Add new classes to `template.html` first; don't let `layouts.md` reference undefined classes
- When changing `template-swiss.html`, update `layouts-swiss.md` and `swiss-layout-lock.md` together
- When adding Swiss rules, update `scripts/validate-swiss-deck.mjs`
- Presenter runtime changes must land in both templates and pass `scripts/check-presenter-runtime-sync.mjs`; CI rejects CSS / JavaScript drift
- Presenter-note or live-behavior changes must also update `references/presenter-mode.md`, `references/checklist.md`, and `scripts/validate-presenter-mode.mjs`
- Log pitfalls into `checklist.md` at the matching P0 / P1 / P2 / P3 tier
- New theme colors go into `themes.md` with a recommended use case

## License

AGPL-3.0 © 2026 [op7418](https://github.com/op7418)
