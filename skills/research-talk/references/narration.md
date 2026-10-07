# Natural speech that explains the work

Default to English slides and Chinese spoken paragraphs unless the user chooses
otherwise. Write as a researcher explaining the project to peers. Preserve the
speaker's voice, technical meaning, and the role of each page.

## Practical editing rules

1. Give each page one primary job: motivation, definition, operation, evidence,
   or limitation. Do not make every page repeat the full motivation.
2. Prefer concrete actions: who receives which input, what is compared or
   calculated, and what happens next. Break sentences that introduce several
   new abbreviations without an example.
3. Explain a technical term at first use in ordinary language, then use the
   term consistently. Do not replace a precise term with a misleading metaphor.
4. Establish objects and a worked example before reading a formula. Keep stages
   distinct: an item score, a weighted total, a relative advantage, and its
   placement are different operations when the method treats them differently.
5. Speak about the scientific content. Keep “click,” “reveal,” “the squares fill,”
   “the bars grow,” and “the point becomes blue” out of the normal transcript.
   Optional stage cues belong in a separate field or control legend.
6. Colors that identify evidence are legitimate: “the orange road line” refers
   to the actual chart. Do not mechanically delete all color or pointing words.
7. On results pages, state the finding and select a few useful numbers. The
   audience can inspect the full chart; do not recite every row and delta.
8. Make transitions follow the argument: explain what remains to be answered.
   Avoid repetitive “this leads to the next slide” and paper-like noun stacks.
9. Read the full speech for awkward clauses and pacing after a substantial
   rewrite. Once it is natural, coherent, and accurate, stop synonym polishing.

## Examples of the change in focus

These numerical examples come from one research talk. Reuse the explanation
pattern, not its counts, thresholds, models, or results.

**Playback narration**

> Medium 的方块从一个填到五个，再回到一个。

**Method explanation**

> 同一个固定模型尝试八次，答对一到五次的题归为 medium。我们用这个结果
> 估计模型还没有稳定掌握哪些问题，再形成固定的训练集。

The first explains the animation. The second explains the statistic, category,
and purpose. The actual project's source must support all three.

**Abstract calculation**

> 两项对分子分别贡献 5 和 3，归一化后得到原始奖励。

**Spoken calculation**

> 起点这一项计 5 分，单位计 3 分，一共拿到 8 分。所有正权重加起来是 22，
> 所以这个回答的原始分数是八除以二十二。

**Chart mechanics**

> 点击以后，灰点移到蓝色菱形的位置，右边的数字也跟着变化。

**Finding**

> 三个知识推理指标都有提升。不过另一个通用指标略有下降，主要收益还是
> 来自知识推理。

## Accuracy while simplifying

Preserve the project's semantic distinctions and necessary qualifications, but
do not turn the talk into a recital of defensive disclaimers. Put detailed code
defaults and reproducibility details in an appendix when the main argument does
not need them.

- Identify constructed responses as illustrative; do not claim they are real
  rollouts. Keep the initial error in a real self-correction example.
- State the baseline and the subset behind each average. Accuracy subtraction
  is an absolute percentage-point change, not relative percentage growth.
  If the user requests `%` labels, keep the underlying arithmetic and explain
  the quantity correctly in speech/captions.
- A joint ablation does not isolate either change. An unreported uncertainty
  estimate does not support a claim of statistical significance.
- An outcome metric supports the outcome; it may only indirectly support a
  claim about internal reasoning or faithfulness.

Do not put these statements on every page. Include each where it affects the
interpretation, using concise, natural language.
