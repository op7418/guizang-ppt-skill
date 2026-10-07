# From research material to a live talk

## 1. Read the current state and establish evidence

For an existing talk, locate the authoritative builder/content file, template,
theme, generated HTML, notes, exports, and existing checks. Read the relevant
instructions and inspect current renders before changing the design. A browser
tab may show an older file; compare it with the saved source.

For a new talk, inspect the paper version, project page, code/release, dataset
card and representative records, plus the user's template and biography material.
Use the source appropriate to the claim: the current paper for reported results,
the specific release for implementation behavior, and actual dataset records for
examples. Do not blend an old submission configuration with a newer release.
When sources disagree, record the distinction instead of silently picking a value.

Keep a compact evidence ledger, using an existing project record where possible:

| Claim or asset | Source/version | What is supported | Qualification |
|---|---|---|---|
| Main result | Table/section and revision | Value, metric, baseline | Averaging scope; uncertainty |
| Training operation | Code path and commit | Implemented behavior | Default versus actual run setting |
| Example | Dataset and record ID | Real input/annotation | Responses may be constructed for teaching |
| Logo/bio/headshot | Supplied file or verified public source | Identity and provenance | Preserve original asset |

Record technical distinctions that simplification must preserve: data item versus
batch, raw score versus transformed signal, offline versus online, shared
initialization versus shared parameters, approximate alignment versus exact
supervision, failed verification versus confirmed failure. Select those that
actually apply to the project; these are not a mandatory slide checklist.

## 2. Build the spoken argument

Start with what the audience should understand after the talk. A useful research
arc is a concrete problem, failure of an existing approach, core idea, data,
method, evidence, limitations, and takeaway. Adapt it to the work instead of
forcing a preset slide count or identical chapter sequence.

- Introduce a real running example early and revisit it only when it advances
  the explanation. Separate dataset facts from constructed teaching outputs.
- In method pages, follow concept dependencies: inputs and outputs, operation,
  why it helps, then notation. Use formulas after the audience knows the objects.
- If introducing the speaker, summarize the supplied bio. A research storyline
  can group several relevant works under each research question and connect
  them to a broader objective. Use verified papers; do not inflate contributions
  or read every paper title aloud.
- Results pages should have different jobs: main gains, breadth and tradeoffs,
  ablation, behavior example, or limitations. Preserve negative findings.
- Reserve time for pauses and discussion. The default 90% speaking budget is a
  planning allowance, not a measurement of actual delivery speed.

A small per-slide plan is enough:

```text
ID | audience question | claim | evidence/visual | spoken explanation |
transition | planned minutes | reveal states if needed
```

## 3. Derive the template from the reference

Inspect the actual source deck at a consistent scale. Extract the canvas ratio,
palette, type hierarchy, margins, logo variants, recurring chrome, and a small
set of useful layouts. Start with a cover, chapter transition, evidence pair,
method flow, result chart, and closing page only if the talk needs them.

When asked to reuse a native slide exactly, prefer its native render or faithful
native copy. A rendered page preserves appearance but is not an editable native
layout; disclose that distinction in the delivery notes. Do not reconstruct an
approved biography page merely to make the implementation uniform.

Make a few representative pages first to verify the visual system, then extend
it through the talk. This is a production step, not an automatic request for
user approval. Reuse the supplied identity rather than replacing it with a
generic card grid or unrelated theme.

## 4. Keep content, theme, and runtime separate

One content source should drive the audience slide, presenter notes, independent
transcript, and export notes. The builder is authoritative if the JSON is generated;
do not edit only generated HTML or JSON and lose the change on the next build.

- Content: title, purpose, body/visual data, speech, transition, timing, sources.
- Theme: fonts, palette, logo treatment, spacing, reusable layouts.
- Runtime: navigation, reveal state, presenter/current preview/audience sync.

Stable slide IDs connect the three. Save the pre-edit source for scoped changes.
Resolve numeric references such as “page 20” to its current ID before editing.
Keep control labels or optional stage cues separate from spoken paragraphs.

For new code, use the available project tools and discover dependency paths in
the current environment. Do not hard-code a previous user's home directory or
temporary runtime installation into reusable scripts.

## 5. Review and export

Review the whole argument after a substantive rewrite. Check affected pages and
neighboring transitions for a local edit; do not reopen approved text without a
reason. Examine real rendered pages, not only DOM presence or a contact sheet.

For a new or changed animation, inspect meaningful intermediate states in normal
view, the presenter's **current** preview, and the actual audience window. For
text-only edits, preserve the working runtime and avoid repeating unrelated
runtime investigations.

Export complete final information states. Verify matching page counts and notes,
missing assets, readable labels, and scope preservation. If an export uses raster
slides, say so. Refresh any existing delivery ZIP so it does not contain stale
notes or an earlier HTML version.

The final response should say what changed, what was checked, and where the
current deliverables are. Claim a measured speaking duration only after a timed
rehearsal; otherwise call it a plan.
