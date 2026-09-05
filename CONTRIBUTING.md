# Contributing

Thanks for helping improve `guizang-ppt-skill`.

This project is a Skill for AI agents that generate polished HTML slide decks. The most useful contributions are specific, reproducible, and tied to real deck output.

## Before Opening an Issue

Please check whether the problem belongs to one of these buckets:

- Layout fidelity: a page drifts away from the registered template.
- Content overflow: text, images, charts, or footers overlap.
- Image workflow: generated images do not match the target slot ratio or deck style.
- Runtime behavior: navigation, ESC overview, low-power mode, map interaction, or animations fail.
- Documentation: installation, prompt usage, layout selection, or examples are unclear.

Screenshots are much more useful than descriptions alone. If possible, include:

- The prompt or source content used to generate the deck.
- The generated `index.html`.
- A screenshot of the broken slide.
- Browser and OS information.

## Pull Request Guidelines

Keep PRs focused. A small fix with a screenshot is easier to review than a large rewrite.

Run the complete repository gate before opening a PR:

```bash
npm run check
```

It covers the Swiss layout contract, both bundled templates, speaker-note validation, and presenter-runtime synchronization without requiring third-party packages.

For Swiss theme changes:

- Do not invent new default body layouts unless the change is explicitly discussed.
- Keep the registered layout system intact.
- Run the Swiss validator:

```bash
node scripts/validate-swiss-deck.mjs path/to/index.html
```

Use `--static-only` for deterministic CI checks. Use `--allow-experimental` only when the deck owner explicitly requested P23/P24; it does not permit arbitrary layout IDs.

For template changes:

- Verify at least one dense text slide.
- Verify at least one image slide.
- Verify navigation, ESC overview, and low-power mode.

## Good PRs Usually Include

- A short summary of the problem.
- The exact files changed.
- Before / after screenshots when visual behavior changes.
- Validation or manual QA notes.

## Style Notes

This Skill is opinionated by design. It prefers constrained layout systems over unlimited customization, because constraints make AI-generated decks more reliable.

When in doubt, preserve the existing visual rules and improve the workflow around them.
