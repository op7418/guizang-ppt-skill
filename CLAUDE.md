# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is a **Claude Code Skill** — a structured workflow that AI agents follow to generate single-file HTML slide decks. It is not a traditional application with a build step, server, or test suite. The primary "user" of this repo is an AI agent reading `SKILL.md` and `references/` to produce `index.html` decks.

## Architecture: two visual systems

The skill provides two mutually exclusive visual styles. They share no CSS classes and cannot be mixed in one deck.

| | Style A · Magazine | Style B · Swiss |
|---|---|---|
| Template seed | `assets/template.html` | `assets/template-swiss.html` |
| Layouts | `references/layouts.md` (10 flexible layouts) | `references/layouts-swiss.md` (22 locked layouts S01–S22) |
| Themes | `references/themes.md` (5 presets) | `references/themes-swiss.md` (4 accent-color presets) |
| Lock file | none | `references/swiss-layout-lock.md` (hard constraints) |
| Validator | none | `scripts/validate-swiss-deck.mjs` |
| Typography | Serif titles (Noto Serif SC) + sans body | All sans-serif (Inter/Helvetica/Noto Sans SC), extreme weight contrast (200 for large, 400–600 for small) |
| Aesthetic | Monocle-magazine, warm ink/paper, WebGL fluid backgrounds | Grid-based, single accent color, hairline rules, no gradients/shadows/rounded corners |
| Icons | Lucide (CDN) | Lucide (CDN) |
| Animation | Motion One (CDN + local fallback `assets/motion.min.js`) | Motion One (same fallback) + low-power mode (key `B`) |
| Edit mode | WYSIWYG panel injected via `scripts/inject-edit-panel.mjs` after generation (key `E`): click-to-select, CSS property sliders, theme switch, download | Same (shared JS auto-detects style, CSS is per-style) |
| Image backgrounds | `assets/screenshot-backgrounds/style-a/` (5 WebP) | `assets/screenshot-backgrounds/style-b/` (4 WebP) |

## Key files

```
SKILL.md                    ← The skill definition. Contains the full 6-step workflow, design principles,
                               component class lists, and common mistakes. This is the entry point for agents.
assets/
  template.html             ← Style A seed. Complete runnable HTML with CSS, WebGL shaders, nav JS.
  template-swiss.html       ← Style B seed. Same structure but Swiss CSS grid system, ASCII canvas, etc.
  motion.min.js             ← Motion One local copy (~64 KB) for offline animation fallback.
  screenshot-backgrounds/   ← Pre-baked WebP backgrounds for screenshot framing (5 style-a + 4 style-b).
scripts/
  validate-swiss-deck.mjs   ← Node script that checks a Swiss deck HTML for: registered data-layout,
                               missing image slots, SVG text, centered titles, experimental layouts.
references/
  checklist.md              ← Quality checklist (P0/P1/P2/P3), built from real iteration mistakes.
  components.md             ← Component reference for Style A (typography, chrome, callout, stat, pipeline,
                               figure, icons, motion recipes). Style B components are in layouts-swiss.md appendix.
  layouts.md                ← 10 Style A page skeletons (copy-paste ready) + theme rhythm planning rules.
  layouts-swiss.md          ← 22 Style B page skeletons (S01–S22) + experimental extensions.
  swiss-layout-lock.md      ← Swiss hard constraints: registered layouts, golden source path, image slot rules.
  swiss-map-component.md    ← S08 MapLibre extension: data contract, pin/line/card structure, interaction rules.
  themes.md                 ← 5 Style A color presets (ink/paper variable blocks to paste into :root).
  themes-swiss.md           ← 4 Style B color presets (accent/paper/ink/grey variable blocks).
  image-prompts.md          ← GPT-M 2.0 image generation prompts, ratio selection, style rules per deck type.
  screenshot-framing.md     ← CleanShot X-style screenshot adaptation: 7 semantic parameters, background mapping.
```

## Development workflow

There is no build, no package manager, no test runner. Changes follow this pattern:

1. **Template changes**: Edit `assets/template.html` or `assets/template-swiss.html` directly. These are standalone HTML files — open in a browser to verify. For Swiss template changes, keep the registered base CSS/JS intact; the golden source is the original reference PPT (path in `swiss-layout-lock.md`). When modifying template code, verify the WYSIWYG edit panel still works: press `E`, click elements, adjust properties, download.

2. **Layout changes**: When adding a Style B layout, you must update four files in lockstep: `template-swiss.html` (CSS classes), `layouts-swiss.md` (skeleton docs), `swiss-layout-lock.md` (registration), and `validate-swiss-deck.mjs` (validation rules).

3. **Document extraction**: Before generating a PPT from a user-provided document, extract structured content:
   ```bash
   node scripts/extract-doc.mjs path/to/document.docx --output path/to/content.md
   ```
   Supports `.docx` (via JSZip, auto-detects headings), `.md` (passthrough), and `.txt` (paragraph preservation). Outputs Markdown with YAML metadata header.

4. **Swiss validation**: The only automated check in the repo:
   ```bash
   node scripts/validate-swiss-deck.mjs path/to/index.html
   ```
   Add `--allow-experimental` to suppress P23/P24 detection. This script parses HTML with regex (not a DOM parser) — it matches `<section class="slide">` blocks and checks `data-layout`, image slots, SVG text, and title alignment.

4. **Theme changes**: Add new color presets only to `references/themes.md` or `references/themes-swiss.md`. Each preset is a `:root` variable block. Custom hex values from users must be rejected — only the curated presets are allowed.

5. **New checklist items**: When you discover a bug pattern during deck generation, add it to `references/checklist.md` under the appropriate priority level (P0 = must-fix, P1 = rhythm, P2 = visual polish, P3 = operational).

## Contribution constraints (from CONTRIBUTING.md)

- Swiss template: do not invent new default body layouts without explicit discussion. Keep the registered layout system intact. Run the validator.
- Template changes: verify at least one dense text slide, one image slide, navigation, ESC overview, and low-power mode (`B` key).
- This skill is opinionated by design — constrained layout systems over unlimited customization, because constraints make AI-generated decks more reliable.
- When in doubt, preserve existing visual rules and improve the workflow around them.

## Agent workflow (how the skill is used at runtime)

When invoked, the agent follows the 6-step pipeline in `SKILL.md`:

1. **Clarify** — 7 questions: style (A/B), audience, duration, source material, images/screenshots, theme color, constraints
2. **Copy template** — `cp assets/template*.html → project/index.html`, create `images/` dir, replace `[必填]` placeholders, apply theme variables
3. **Fill content** — plan theme rhythm table, pick layouts from references, paste skeletons, replace text/images. Critical: must Read the template `<style>` block first to verify all CSS classes exist.
4. **Self-check** — run Swiss validator (Style B only), then go through `checklist.md` P0 items
5. **Preview** — open `index.html` in browser
6. **Iterate** — adjust inline styles (90% of changes are `font-size`, `height`, `gap` tweaks). Remind the user they can press `E` in the browser to open the built-in WYSIWYG edit panel for quick self-service adjustments.

Images go in `images/` next to `index.html`, named `{page}-{semantic}.{ext}`. In Style B, every local `<img>` must have `data-image-slot` attribute.

## Naming and conventions

- `<SKILL_ROOT>` in documentation refers to the root of this repository (e.g., `~/.claude/skills/guizang-ppt-skill`)
- The term "Skill" (capital S) is used consistently — never mix Chinese/English translations
- Style B layout IDs: `S01`–`S22` for body pages, `SWISS-COVER-ASCII` / `SWISS-CLOSING-ASCII` for cover/closing
- Style B slides must have `data-layout="Sxx"` on the `<section>` element
- Style A slides use `class="slide light"`, `class="slide dark"`, `class="slide hero light"`, or `class="slide hero dark"` — never just `hero` without a theme
