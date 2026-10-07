# Visual explanation and purposeful motion

## Design the information before choosing an effect

For each diagram, identify the objects, operations, directed connections, and
the quantity carried by each connection. A training flow may distinguish data,
model outputs, verification, reward/advantage computation, and parameter updates.
Only show the roles actually present in the source. Clearly label offline/online
and trainable/frozen/shared-initialization distinctions when relevant.

For each animated page, write a small state plan:

```text
Initial state | action/trigger | revealed relationship | final state | export state
```

When a request loosely asks for “page animation,” distinguish a transition
between slides from an explanation inside a slide. Use restrained page
transitions and staged information flow where it helps comprehension; follow an
explicit choice instead of silently substituting a different effect.

| Explanation | Useful visual or motion | Integrity check |
|---|---|---|
| Data construction | Real record → transformations → annotation → dataset | Each arrow names what is passed; examples have provenance. |
| Training | Sampling → evaluation → signal construction → update → sampling | Update reaches the trainable model; fixed references stay distinct. |
| Local credit | Criterion → evidence endpoint → eligible positions → sum | Item/type granularity and mathematical range remain correct. |
| Baseline to method | Move marks on a common axis; retain the baseline | Shared scale and exact endpoints; include declines. |
| Gains then tradeoffs | Reveal gain bars, then decline bars with matching text | Numbers, metric names, and sidebar all match the same phase. |
| Category range | Cycle illustrative valid states while labels remain fixed | Do not imply training progress or a measured time series. |

Do not add a loop merely to keep the page moving. A flow, causal dependency,
comparison, or range must become easier to understand because of the motion.
An arrow's direction conveys a technical relation, not just a layout connector.

## Make the slide readable and visually coherent

- Preserve the selected template's canvas, typography, margins, and identity.
  Use a small set of purpose-built layouts instead of repeating generic cards.
- Create one obvious focal point. Group evidence with its interpretation; leave
  space between conceptually different parts. Simplify or split content before
  reducing important text to tiny type.
- Use consistent encodings for the same object. Explain required reading
  conventions in labels, axes, and legends rather than in animation narration.
- Keep a figure's evidence intact with `contain`; crop decorative photographs
  only when their role permits it. Never crop a graph's axis or answer evidence.
- For logos, inspect alpha and the surrounding container before “removing the
  background.” A transparent PNG may sit inside a white CSS box. Prefer an
  official light/dark variant; when the user authorizes adaptation, preserve the
  geometry, aspect ratio, and original, and record the derived treatment.
- Use the paper's verified full title when requested. Include acceptance/venue
  labels only with source or user confirmation; never carry them into a new talk.
- Add a bio/storyline or circular author portraits when requested or relevant.
  Resolve identity from supplied material or reliable public sources; ask only
  about genuinely missing assets while continuing the independent layout work.

Keep bulky provenance in supporting records or notes, unless visible attribution
is required for the material or requested by the user. Removing a source footer
from the slide does not mean deleting the provenance.

## State contract for HTML information flow

Use the actual engine's API; names below describe behavior, not a required library.

- Give slides stable IDs. Route keyboard, buttons, presenter, and audience
  navigation through one slide-and-step state model.
- Repeating the same slide/step must be idempotent: no removal/reinsertion of
  animation classes and no restarting the animation clock. Still run initial
  state setup; do not make the first page invisible with an early-return guard.
- Ordinary view, the presenter's **current-slide iframe**, and the real audience
  window must show the same slide and step. Do not confuse next-slide preview
  correctness with current-slide correctness.
- Do not reload an entire preview iframe for each step. Initialize it once and
  send state updates through the existing synchronization mechanism.
- Entering presenter mode must preserve the current motion preference. Do not
  force low power on, and do not force animation on against manual static or
  `prefers-reduced-motion`. Propagate the current effective preference even if
  it has not been persisted. Reapply a setter only when its value changes.
- Freeze holds the audience's current state; unfreeze/reopen catches it up.
  Preserve remaining auto-play time if the existing engine supports pausing.
  A per-slide speaking budget does not enable auto-advance by itself.
- Scale the stage uniformly. Pointer/annotation coordinates must use the actual
  slide rectangle, not a window that includes letterboxing.

In the V-Rubrics-derived implementation, the vocabulary is `data-flow-step`,
`data-flow-steps`, `flow_labels`, `.flow-pending/reached/current/enter`, and
`window.__flow`. These are useful implementation examples, not APIs guaranteed
to exist in a fresh upstream guizang template. Inspect before calling them.

## Charts and export states

Keep axes and mathematical scales fixed during comparison. Positive bars grow
rightward with their left edge at zero; negative bars grow leftward with their
right edge at zero. Animate the bar geometry, not the labels or bar height.
Check the final numerical endpoint, not just that something moves.

Distinguish two kinds of slide progression:

- **Cumulative reveal:** completed content stays. Static export reveals every
  required element.
- **Exclusive phases:** sidebars or comparisons replace one another. Static
  export uses a coherent complete final representation; it must not stack two
  mutually exclusive panels over each other.

Export mode must stay active while pages are traversed. A later `go()` must not
hide already expanded content. Print styles need to override future/ghost
opacity, visibility, transforms, clipping, animation, and chart phase variables.
Ensure path-drawing effects do not clip an arrowhead outside its container.

## Verify real behavior at the appropriate scale

For a new runtime, test navigation, preference inheritance, synchronization,
freeze/reopen, and export. For a changed animation, test that actual page; for a
title or notes edit, do not rerun unrelated animation investigations.

Inspect the first, final, and meaningful intermediate states. In permitted
browser development tooling, `document.getAnimations()` with advancing
`currentTime`, changing transforms, or measured bar widths can establish that
motion runs. A “Step 2” label alone cannot. Repeated sync messages must not stall
the transition. Test the real audience popup as well as the current preview.

Render the static export and check complete information, page count, figure
labels, alignment, missing assets, and clipping. Generic fixtures supplement,
but do not replace, representative pages from the actual talk.
