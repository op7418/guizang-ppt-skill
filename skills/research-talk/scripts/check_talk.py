#!/usr/bin/env python3
"""Check a research talk's source, notes, flow bounds, and authorized edits.

Uses only the Python standard library. This checks artifact consistency, not
scientific correctness or browser rendering. JSON is always written to stdout;
--report optionally writes the same report to a file. Errors exit 1, otherwise 0.
"""

import argparse
from collections import Counter
from html.parser import HTMLParser
import json
import math
from pathlib import Path
import re
import sys


NOTE_FIELDS = ("id", "title", "purpose", "talk", "transition", "minutes")
OPERATIONS = re.compile(
    r"点击(?:后|以后|之后)|再点击|按(?:下)?(?:空格键|方向键|左右键|P\s*键)"
    r"|切换到(?:下|上)一页|(?:动画|方块|条形)(?:会|逐渐)(?:出现|消失|移动|填满|变色|长出)"
    r"|\b(?:click|press)\s+(?:the\s+)?(?:next|previous|spacebar|arrow key|p key)\b"
    r"|\banimation\s+(?:will\s+)?(?:appear|grow|move)\b",
    re.IGNORECASE,
)


def reject_constant(value):
    raise ValueError(f"non-JSON numeric constant: {value}")


DECODER = json.JSONDecoder(parse_constant=reject_constant)


def read_text(path):
    return Path(path).read_text(encoding="utf-8-sig")


def positive_number(value):
    try:
        return (isinstance(value, (int, float)) and not isinstance(value, bool)
                and math.isfinite(value) and value > 0)
    except OverflowError:
        return False


def text_list(value):
    return (isinstance(value, list) and bool(value)
            and all(isinstance(x, str) and x.strip() for x in value))


def validate_slides(value, label, errors):
    if not isinstance(value, list) or not value:
        errors.append(f"{label}: expected a non-empty JSON array of slide objects")
        return []
    ids = []
    for i, slide in enumerate(value):
        at = f"{label}[{i}]"
        if not isinstance(slide, dict):
            errors.append(f"{at}: expected a slide object")
            continue
        for key in ("id", "title", "purpose", "transition"):
            if not isinstance(slide.get(key), str) or not slide[key].strip():
                errors.append(f"{at}.{key}: expected a non-empty string")
        if isinstance(slide.get("id"), str) and slide["id"].strip():
            ids.append(slide["id"])
        if not text_list(slide.get("talk")):
            errors.append(f"{at}.talk: expected a non-empty list of non-empty strings")
        if not positive_number(slide.get("minutes")):
            errors.append(f"{at}.minutes: expected a positive finite number, not a boolean")
        if "flow_labels" in slide and not text_list(slide["flow_labels"]):
            errors.append(f"{at}.flow_labels: expected a non-empty list of non-empty strings")
    for slide_id, count in Counter(ids).items():
        if count > 1:
            errors.append(f"{label}: duplicate slide id {slide_id!r} ({count} occurrences)")
    return value


class TalkHTML(HTMLParser):
    """Associate flow markers with their nearest enclosing slide section."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sections = []
        self.section_stack = []
        self.orphans = []
        self.scripts = []
        self.script = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "script":
            self.script = []
        if tag == "section":
            owner = self.section_stack[-1] if self.section_stack else None
            if "data-slide-id" in attrs:
                owner = {"id": attrs["data-slide-id"], "total": attrs.get("data-flow-steps"), "steps": []}
                self.sections.append(owner)
            self.section_stack.append(owner)
        if "data-flow-step" in attrs:
            owner = self.section_stack[-1] if self.section_stack else None
            target = owner["steps"] if owner is not None else self.orphans
            target.append((attrs["data-flow-step"], self.getpos()[0]))

    def handle_endtag(self, tag):
        if tag == "section" and self.section_stack:
            self.section_stack.pop()
        if tag == "script" and self.script is not None:
            self.scripts.append("".join(self.script))
            self.script = None

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_data(self, data):
        if self.script is not None:
            self.script.append(data)


def html_checks(source, slides, report):
    errors = report["errors"]
    parser = TalkHTML()
    parser.feed(source)
    parser.close()
    report["counts"]["html_slides"] = len(parser.sections)
    ids = [s.get("id") if isinstance(s, dict) else None for s in slides]
    html_ids = [s["id"] for s in parser.sections]
    if html_ids != ids:
        errors.append("HTML: section data-slide-id values/order differ from slides.json")
    for slide_id, count in Counter(html_ids).items():
        if count > 1:
            errors.append(f"HTML: duplicate section data-slide-id {slide_id!r}")
    by_id = {s["id"]: s for s in slides if isinstance(s, dict) and isinstance(s.get("id"), str)}
    for section in parser.sections:
        at = f"HTML slide {section['id']!r}"
        try:
            total = 1 if section["total"] is None else int(section["total"])
            if total < 1:
                raise ValueError()
        except (TypeError, ValueError):
            errors.append(f"{at}: data-flow-steps must be a positive integer")
            continue
        labels = by_id.get(section["id"], {}).get("flow_labels")
        if text_list(labels) and len(labels) != total:
            errors.append(f"{at}: {total} steps but {len(labels)} flow_labels")
        for raw, line in section["steps"]:
            try:
                step = int(raw)
                if not 1 <= step <= total:
                    raise ValueError()
            except (TypeError, ValueError):
                errors.append(f"{at}, line {line}: data-flow-step {raw!r} is outside 1..{total}")
    for _, line in parser.orphans:
        errors.append(f"HTML line {line}: data-flow-step is outside a slide section")

    assignments = [(script, m.end()) for script in parser.scripts
                   for m in re.finditer(r"\bconst\s+SPEAKER_NOTES\s*=\s*", script)]
    if len(assignments) != 1:
        errors.append(f"HTML: expected one const SPEAKER_NOTES assignment, found {len(assignments)}")
        return
    script, start = assignments[0]
    try:
        notes, _ = DECODER.raw_decode(script, start)
    except (ValueError, RecursionError) as exc:
        errors.append(f"HTML SPEAKER_NOTES: invalid JSON: {exc}")
        return
    notes = validate_slides(notes, "HTML SPEAKER_NOTES", errors)
    if len(notes) != len(slides):
        errors.append(f"HTML SPEAKER_NOTES: {len(notes)} entries; expected {len(slides)}")
    for i, (slide, note) in enumerate(zip(slides, notes)):
        if isinstance(slide, dict) and isinstance(note, dict):
            for key in NOTE_FIELDS:
                if key not in note or note[key] != slide.get(key):
                    errors.append(f"HTML SPEAKER_NOTES[{i}].{key} differs from slides.json")


def baseline_checks(slides, baseline, allowed, errors):
    old = {s["id"]: s for s in baseline if isinstance(s, dict) and isinstance(s.get("id"), str)}
    new = {s["id"]: s for s in slides if isinstance(s, dict) and isinstance(s.get("id"), str)}
    for slide_id in sorted(allowed - (old.keys() | new.keys())):
        errors.append(f"baseline: --allow-slide {slide_id!r} is not present in either deck")
    for slide_id in dict.fromkeys([*old, *new]):
        if slide_id in allowed:
            continue
        if slide_id not in new:
            errors.append(f"baseline: unauthorized deletion of {slide_id!r}")
        elif slide_id not in old:
            errors.append(f"baseline: unauthorized addition of {slide_id!r}")
        elif json.dumps(old[slide_id], sort_keys=True) != json.dumps(new[slide_id], sort_keys=True):
            errors.append(f"baseline: unauthorized object change in {slide_id!r}")
    old_order = [s for s in old if s in new and s not in allowed]
    new_order = [s for s in new if s in old and s not in allowed]
    if old_order != new_order:
        errors.append("baseline: unauthorized slides changed relative order")


def check(args, report):
    errors, warnings = report["errors"], report["warnings"]
    slides = validate_slides(DECODER.decode(read_text(args.slides)), "slides.json", errors)
    report["counts"]["slides"] = len(slides)
    report["counts"]["flow_slides"] = sum(isinstance(s, dict) and text_list(s.get("flow_labels"))
                                         and len(s["flow_labels"]) > 1 for s in slides)
    try:
        total = math.fsum(s["minutes"] for s in slides if isinstance(s, dict) and positive_number(s.get("minutes")))
    except OverflowError:
        errors.append("planned duration overflows a finite number")
        total = None
    report["counts"]["planned_minutes"] = total
    if args.minutes is not None and total is not None:
        # Ignore only floating-point addition noise at the boundary.
        over = lambda limit: total > limit and not math.isclose(total, limit, rel_tol=1e-12)
        if over(args.minutes):
            errors.append(f"planned {total:g} minutes exceeds the {args.minutes:g}-minute limit")
        elif over(args.minutes * (1 - args.reserve_fraction)):
            warnings.append(f"planned {total:g}/{args.minutes:g} minutes leaves less than {args.reserve_fraction:.0%} reserve")
    for i, slide in enumerate(slides):
        if not isinstance(slide, dict):
            continue
        spoken = slide.get("talk", [])
        spoken = spoken if text_list(spoken) else []
        if isinstance(slide.get("transition"), str):
            spoken = [*spoken, slide["transition"]]
        found = sorted(set(m.group() for part in spoken for m in OPERATIONS.finditer(part)))
        if found:
            warnings.append(f"slide {slide.get('id', i)!r}: possible presentation-operation narration: {', '.join(found)}")
    if args.allow_slide and not args.baseline:
        errors.append("--allow-slide requires --baseline")
    for kind, path in (("HTML", args.html), ("transcript", args.transcript), ("baseline", args.baseline)):
        if path is None:
            continue
        try:
            source = read_text(path)
            if kind == "HTML":
                html_checks(source, slides, report)
            elif kind == "baseline":
                baseline = validate_slides(DECODER.decode(source), "baseline", errors)
                baseline_checks(slides, baseline, set(args.allow_slide), errors)
            else:
                source = " ".join(source.split())
                for i, slide in enumerate(slides):
                    if not isinstance(slide, dict):
                        continue
                    parts = slide.get("talk", []) if text_list(slide.get("talk")) else []
                    parts = [*parts, slide.get("transition")]
                    for j, part in enumerate(parts):
                        if isinstance(part, str) and " ".join(part.split()) not in source:
                            field = f"talk[{j}]" if j < len(parts) - 1 else "transition"
                            errors.append(f"transcript: missing slides[{i}].{field} ({slide.get('id')!r})")
        except (OSError, UnicodeError, ValueError, RecursionError) as exc:
            errors.append(f"{kind} {path}: {exc}")


class Parser(argparse.ArgumentParser):
    def error(self, message):
        raise ValueError(message)


def main(argv=None):
    report = {"counts": {}, "errors": [], "warnings": []}
    parser = Parser(description=__doc__)
    parser.add_argument("slides", help="canonical slides.json array")
    for flag in ("html", "transcript", "baseline", "report"):
        parser.add_argument(f"--{flag}", type=Path)
    parser.add_argument("--minutes", type=float, help="maximum total duration")
    parser.add_argument("--reserve-fraction", type=float, default=0.1)
    parser.add_argument("--allow-slide", action="append", default=[], metavar="ID")
    args = None
    try:
        args = parser.parse_args(argv)
        if args.minutes is not None and not positive_number(args.minutes):
            raise ValueError("--minutes must be a positive finite number")
        if not math.isfinite(args.reserve_fraction) or not 0 <= args.reserve_fraction < 1:
            raise ValueError("--reserve-fraction must be finite and in [0, 1)")
        if any(not x.strip() for x in args.allow_slide):
            raise ValueError("--allow-slide IDs must be non-empty")
        check(args, report)
    except (OSError, UnicodeError, ValueError, RecursionError) as exc:
        report["errors"].append(str(exc))
    if args is not None and args.report is not None:
        inputs = [args.slides, args.html, args.transcript, args.baseline]
        if any(args.report.resolve() == Path(p).resolve() for p in inputs if p is not None):
            report["errors"].append("--report must not overwrite an input file")
        else:
            try:
                args.report.parent.mkdir(parents=True, exist_ok=True)
                args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")
            except OSError as exc:
                report["errors"].append(f"report {args.report}: {exc}")
    print(json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False))
    return int(bool(report["errors"]))


if __name__ == "__main__":
    sys.exit(main())
