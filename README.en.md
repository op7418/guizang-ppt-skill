# Magazine Web PPT · Editorial-Style Web Slide Deck Skill

A [Claude Code / Claude Agent Skills](https://agentskills.io/) skill that generates **single-file HTML horizontal-swipe decks** with an "**editorial magazine × electronic ink**" aesthetic — picture *Monocle* with code stitched in.

> Distilled by [Guizang](https://x.com/op7418) from offline talks like "One-Person Company: Organizations Folded by AI" and "A New Way of Working." Every pitfall hit during those decks is logged in `checklist.md`.

![Magazine Web PPT preview](https://github.com/user-attachments/assets/5dc316a2-401c-4e37-9123-ea081b6ae470)

## What you get

- 🖋 **Three-tier type system**: serif for headlines, sans-serif for body, mono for metadata
- 🌊 **WebGL fluid / dispersion backgrounds** — visible on hero pages, restrained on body pages
- 📐 **Horizontal swipe navigation**: ← → arrows / scroll wheel / touch swipe / bottom dots / ESC for index
- 🎨 **5 curated theme presets**: Ink Classic / Indigo Porcelain / Forest Ink / Kraft Paper / Dune
- 🧩 **10 page layouts**: cover, act divider, big numbers, lead image + text, image grid, pipeline, hero question, big quote, before/after, image + text mix
- 🖼 **Image planning, not generation**: decide per-slide image needs, return prompts / roles / ratios / filenames / paths / animations, then verify user-supplied assets
- ◫ **Missing-image placeholders**: missing `images/...` files render as translucent placeholders in HTML
- 📄 **Single HTML file** — no build, no server, open directly in the browser

## Fits / Doesn't fit

**✅ Fits**: offline talks, industry keynotes, private salons, AI product launches, demo day, presentations with strong personal voice

**❌ Doesn't fit**: data-heavy tables, training decks (density too low), multi-user collaborative editing (static HTML)

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
- "Generate a horizontal swipe deck"
- "Editorial magazine style presentation"
- "Electronic ink slides for my talk"

## Workflow

The skill is a structured 6-step flow; Claude walks you through each:

1. **Clarify intent** — 6-question checklist: audience, duration, source material, images, theme, hard constraints; if the user has no images, ask whether to reserve missing-image slots or build a text-only deck
2. **Plan images and motion** — write `visual_intent` / `motion_level` per slide; only output an image requirement table when image slots are requested, and do not call image-generation APIs
3. **Copy template** — `assets/template.html` → project folder, update `<title>`, swap theme vars
4. **Fill content** — pick from 10 layout skeletons, edit copy / image paths, and keep placeholders only when image slots were requested
5. **Self-check and image QA** — use `references/checklist.md`; check missing files, ratios, naming, style consistency, relevance, and readability
6. **Preview / iterate** — open the HTML in a browser, then tune font size, height, spacing with inline styles

Full spec in [`SKILL.md`](./SKILL.md).

## Directory

```
guizang-ppt-skill/
├── SKILL.md              ← main skill file: workflow, principles, common mistakes
├── README.md             ← Chinese README
├── README.en.md          ← this file
├── assets/
│   └── template.html     ← runnable seed HTML (CSS + WebGL + swipe JS pre-wired)
└── references/
    ├── components.md     ← component catalog (type, color, grid, icons, callout, stat, pipeline)
    ├── image-workflow.md ← image planning and QA (prompts, roles, ratios, placeholders)
    ├── layouts.md        ← 10 layout skeletons (paste-ready)
    ├── themes.md         ← 5 theme presets (pick, don't customize)
    └── checklist.md      ← quality checklist (P0 / P1 / P2 / P3 tiers)
```

## Theme presets

Pick from `references/themes.md`. **Custom hex values are not allowed** — protecting the aesthetic matters more than freedom of choice.

| Theme | Best for |
|------|---------|
| 🖋 Ink Classic | general default, commercial launches, when in doubt |
| 🌊 Indigo Porcelain | tech / research / AI / technical keynotes |
| 🌿 Forest Ink | nature / sustainability / culture / non-fiction |
| 🍂 Kraft Paper | nostalgic / humanist / literary / indie zines |
| 🌙 Dune | art / design / creative / gallery |

Switching themes only requires replacing the 6 variables at the top of `template.html`'s `:root{}` block — all other CSS flows through `var(--...)`.

## Core design principles

1. **Restraint over flash** — WebGL backgrounds only bleed through on hero pages
2. **Structure over decoration** — information hierarchy via type size + typeface + grid whitespace, not shadows or floating cards
3. **Images are first-class citizens** — crop only from the bottom; top and sides stay intact
4. **Rhythm lives on hero pages** — hero / non-hero alternation keeps the eye from fatiguing
5. **Terms stay consistent** — Skills is Skills; no mix-and-match translations

## Visual references

- [*Monocle*](https://monocle.com) magazine layouts
- YC Garry Tan — "Thin Harness, Fat Skills"
- Guizang's offline talk deck series

## Contributing

Bugs, layout issues, new layout requests — Issues and PRs welcome. Prioritize:

- Add new classes to `template.html` first; don't let `layouts.md` reference undefined classes
- Log pitfalls into `checklist.md` at the matching P0 / P1 / P2 / P3 tier
- New theme colors go into `themes.md` with a recommended use case

## License

MIT © 2026 [op7418](https://github.com/op7418)
