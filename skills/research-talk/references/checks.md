# Content contract and practical checks

Use this contract for a new content source if helpful. If a builder already owns
the content, retain it and export a validation snapshot in this shape. Do not
migrate a working deck solely to use this helper.

```json
[
  {
    "id": "method-overview",
    "title": "From observations to feedback",
    "purpose": "Explain the input, transformation, and learning signal.",
    "minutes": 1.2,
    "talk": ["我们先看输入是什么，再看它怎样变成训练反馈。"],
    "transition": "接下来用一个样本把这个过程展开。",
    "body": "<div>English audience content or an editable diagram</div>",
    "source": "Paper revision, section/table, code commit, or dataset record",
    "flow_labels": ["Input", "Transformation", "Feedback"]
  }
]
```

`id`, `title`, `purpose`, `minutes`, `talk`, and `transition` form the required
notes contract. Other fields may be retained. `flow_labels` is optional. Keep
IDs stable across edits; page numbers are presentation order, not identity.

For the optional HTML check, use `const SPEAKER_NOTES = [...]` containing JSON
objects with the same six fields. Each actual slide is a `<section>` with
`data-slide-id`; staged slides declare `data-flow-steps`, and descendants use
`data-flow-step`. This is the companion checker's expected format, not a promise
that every presentation engine already implements it.

From the current project directory:

```bash
python3 <skill-directory>/scripts/check_talk.py slides.json \
  --html index.html --transcript transcript-zh.md --minutes 30 \
  --report qa/content-consistency.json
```

The script uses Python's standard library. It reports errors and warnings as
JSON, writes the report when requested, and returns a nonzero exit code for
errors. It does not mutate the slides or execute JavaScript.

For a scoped revision, save a baseline before editing:

```bash
cp slides.json slides-before.json
python3 <skill-directory>/scripts/check_talk.py slides.json \
  --baseline slides-before.json --allow-slide cover
```

Repeat `--allow-slide` for each authorized ID. An unauthorized object change,
addition, deletion, or relative-order change is an error. This does not detect
changes in shared CSS, an external image, or runtime behavior: use a rendered
comparison to verify those when scope preservation matters.

The default `--reserve-fraction 0.1` only produces a timing warning when planned
speech uses more than 90% of `--minutes`; exceeding the entire slot is an error.
The slot and fraction are configurable. The output is not a timed rehearsal.

Operation-narration warnings are suggestions for human review, not a Chinese
language classifier. Do not delete genuine chart evidence or a requested
software demonstration merely to silence a warning.

The remaining checks need source review or rendering:

| Dimension | Evidence of completion |
|---|---|
| Research accuracy | Values, baselines, units, averaging scope, model roles, and ablation claims match cited versions. |
| Spoken explanation | Method and motivation are understandable when read aloud; speech is natural and transitions connect. |
| Visual readability | Actual renders show readable text, intact evidence, clear directions, and no overlap/cropping. |
| Runtime | Affected transitions run in ordinary view, current presenter preview, and audience, preserving preferences. |
| Delivery | Latest notes, pages, figures, PDF/PPTX, and any ZIP agree; static backups are identified honestly. |

Check at the scale of the change. A local cover edit does not require revalidating
every scientific claim; a rewrite of the method explanation does.

If claiming a portable or offline HTML delivery, verify local-file loading with
network access disabled. Images, fonts or acceptable fallbacks, chart data, and
required scripts must remain available; a working localhost preview alone does
not establish offline portability.
