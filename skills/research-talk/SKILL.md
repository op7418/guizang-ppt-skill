---
name: research-talk
description: "Build or refine research and technical talks from papers, code, data, and a supplied slide template. Develop the spoken argument, method visualizations, purposeful information-flow animation, and natural speaker notes; verify scientific claims and synchronized exports. Use for paper talks, community talks, conference presentations, lab seminars, or focused edits to an existing talk. Not a general website, social-cover, or marketing-deck workflow."
---

# Research Talk

Turn a research project into a talk that a live audience can follow. Work on the
argument, slides, and spoken explanation together. This is a **talk-specific
companion** to a presentation engine, not another visual theme.

## Scope and defaults

- The current request controls scope, format, language, template, and publication.
  Reuse earlier decisions; ask only about missing information that changes the work.
- Defaults for a new talk: English slides, natural Chinese transcript, 16:9,
  manual progression, and about 90% of the slot for planned speaking. These are
  preferences, not fixed requirements. Do not force 29 pages or a 30-minute slot.
- Use the supplied template and preserve explicitly requested native slides.
  NTU and Ropedia are possible templates, not mandatory identities.
- Reuse the existing source, runtime, build process, and stable slide IDs when
  refining. “Only page 1” means only that page's audience content changes.
  Keep speech, other pages, and shared behavior unchanged unless requested.
- Keep paper-specific facts, authors, portraits, acceptance claims, and data in
  the current project. Never inherit them from a previous talk.

## Choose the working mode

| Request | Do |
|---|---|
| New talk | Establish the audience question and evidence, derive a template, then develop a complete spoken arc. |
| Refine slides | Read the current source and render the affected pages; implement the requested changes and check neighboring transitions. |
| Refine transcript | Read the whole deck and relevant evidence; revise the spoken argument, then synchronize every notes artifact. |
| Review | Check claims, narrative, readability, and relevant behavior. An explicit review-only request produces findings without edits. |

Use [workflow.md](references/workflow.md) for a new talk or a substantive rewrite.
For a local edit, read only the relevant sections and maintain its scope.

## Translate instructions into observable outcomes

Before editing, record a short working brief in the project: audience, slot,
languages, source versions, chosen template, authoritative source file, editable
scope, and deliverables. Use an existing project record if one already exists.

For each requested change, identify **what the audience should understand** and
**what observable state will show completion**. Examples:

| User says | Intended outcome | Check |
|---|---|---|
| “Add animation to the information flow” | Show which input reaches which operation and output. | Inspect the actual intermediate states and the final state. |
| “The transcript should focus on our method” | Explain the design, calculation, and motivation. | Spoken paragraphs contain the method; controls remain outside the speech. |
| “Make it more beautiful” | Improve hierarchy, alignment, evidence visibility, and spacing within the selected identity. | Compare rendered pages; do not just change colors or add decoration. |
| “Reuse this Brief Bio page” | Retain that page's content and appearance. | Compare against its native render; do not reconstruct it unnecessarily. |
| “Only change the cover” | Update the named cover elements. | Compare other slide objects and, when appropriate, rendered pixels. |

Do not turn this brief into a new approval gate. Proceed with the authorized work.

## Author content and speech together

Each page needs a stable ID, a title, one audience question or purpose, its main
visual evidence, planned speaking time, spoken paragraphs, and a transition.
Keep facts and sources alongside the content, without forcing source paragraphs
onto audience slides. Use one authoritative content source to generate notes and
exports; avoid editing several independent copies of the transcript.

Read [narration.md](references/narration.md) when writing or revising speech.
It covers natural Chinese, explaining technical operations, and separating
spoken content from stage directions. A visualization supports the explanation;
describing its playback is not a substitute for explaining the work.

## Choose visual and motion techniques for the explanation

Read [visuals-and-motion.md](references/visuals-and-motion.md) when adding or
changing a visualization, animation, chart, or presenter behavior. It includes
data/parameter-flow design, chart transitions, presenter synchronization, and
complete static export states.

For HTML, use the existing deck engine first. For a new guizang deck, read the
installed `guizang-ppt-skill` and its presenter contract; in this repository the
base skill is [../../SKILL.md](../../SKILL.md). If installed independently, locate
that companion in the skill catalog instead of assuming this relative path exists.
Apply the user's selected theme in place of guizang's generic visual presets.
Do not replace a working presenter engine just to add a slide animation.

This skill does **not** bundle or automatically patch a runtime. The motion
reference describes required behavior and checks; inspect the actual engine
before deciding whether any fix is needed. A non-HTML talk can use the same
narrative and visual workflow with its native presentation tools.

## Verify at the scale of the change

Separate scientific accuracy, spoken narrative, visual readability, and runtime
behavior. For a large deck, independent passes can improve coverage; for a title
edit, focused visual and scope checks are enough. Fix confirmed problems and stop
once the relevant checks pass.

The standard-library helper [check_talk.py](scripts/check_talk.py) supports the
optional schema described in [checks.md](references/checks.md). For that schema:

```bash
python3 <skill-directory>/scripts/check_talk.py slides.json \
  --html index.html --transcript transcript-zh.md --minutes 30
```

For a scoped edit, save the pre-edit content, then add:

```bash
--baseline slides-before.json --allow-slide cover
```

The helper checks structure, notes consistency, time budgets, flow indices, and
authorized content changes. It cannot prove scientific correctness, natural
speech, legible layout, or working animation; inspect those separately. Adapt to
an existing schema rather than migrating a working deck for the checker.

## Deliver and preserve

Update the requested outputs from the same source. For HTML talks, normally keep
the portable HTML, Chinese transcript, authoring source, and source records.
Refresh PDF/PPTX/package files when they are part of the existing delivery; label
raster-slide PowerPoint backups as such. Do not claim native editability or carry
animations into a static export by implication.

Verify that the actual presenter shows the new notes after refresh. Existing
manual notes may override generated defaults: preserve them before replacing
anything. Give the user the latest preview and concise change/validation notes.
Publishing, repository pushes, and messaging require their own task scope; this
skill never grants blanket authorization for future external actions.

Copy-ready prompts for **new talks, scoped refinement, transcript refinement,
and review** are in [prompts.md](references/prompts.md), including a standalone
prompt for environments where this skill is not installed.
