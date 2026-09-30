#!/usr/bin/env python3
"""Render the P7 examples with real Swiss CSS in normal and low-power modes.

This tests static layout and paint; it does not exercise the animation runtime.
"""

import argparse
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
EXPECTED = [("示例 A", 0.84), ("示例 B", 0.648)]
APIS = {
    "h-bar-chart": ("row-lbl", "row-track", "row-fill", "row-val"),
    "bar-chart": ("bar-label", "bar-track", "bar-fill", "bar-value"),
}

MEASURE = """(classes) => {
  function describe(element) {
    const r = element.getBoundingClientRect(), s = getComputedStyle(element);
    let opacity = 1, shown = true;
    for (let e = element; e; e = e.parentElement) {
      const style = getComputedStyle(e);
      opacity *= Number(style.opacity);
      shown &&= style.display !== 'none' && style.visibility === 'visible';
    }
    return {x:r.x, y:r.y, width:r.width, height:r.height,
      right:r.right, bottom:r.bottom, centerY:r.y+r.height/2,
      opacity, shown, color:s.color, background:s.backgroundColor,
      text:element.textContent.trim()};
  }
  return Object.fromEntries(classes.map(name => [name,
    [...document.querySelectorAll('.' + name)].map(describe)]));
}"""


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def color_alpha(color):
    # Chromium resolves the template's hex/rgba colors to rgb()/rgba().
    values = re.findall(r"[\d.]+", color)
    return float(values[3]) if len(values) == 4 else 1.0


def verify(metrics, classes, viewport):
    label_class, track_class, fill_class, value_class = classes
    for name in classes:
        require(len(metrics[name]) == len(EXPECTED),
                f".{name}: expected 2 elements, found {len(metrics[name])}; "
                "check that the two chart APIs were not mixed")
        for item in metrics[name]:
            require(item["width"] > 0 and item["height"] > 0,
                    f".{name}: zero-size element {item}")
            require(item["shown"] and item["opacity"] > 0,
                    f".{name}: hidden/transparent element")
            require(item["x"] >= 0 and item["y"] >= 0
                    and item["right"] <= viewport[0] + 1
                    and item["bottom"] <= viewport[1] + 1,
                    f".{name}: outside viewport")
            color = item["background"] if name in (track_class, fill_class) else item["color"]
            require(color_alpha(color) * item["opacity"] > 0,
                    f".{name}: transparent paint")

    ratios = []
    for index, (expected_label, expected_ratio) in enumerate(EXPECTED):
        label, track, fill, value = [metrics[name][index] for name in classes]
        require(label["text"] == expected_label, f"row {index + 1}: unexpected label")
        require(value["text"] == f"{expected_ratio * 100:g}%",
                f"row {index + 1}: unexpected value")
        ratio = fill["width"] / track["width"]
        require(abs(ratio - expected_ratio) < 0.002,
                f"row {index + 1}: fill/track ratio {ratio:.4f}, expected {expected_ratio}")
        require(abs(fill["x"] - track["x"]) <= 1
                and abs(fill["y"] - track["y"]) <= 1
                and abs(fill["height"] - track["height"]) <= 1
                and fill["right"] <= track["right"] + 1,
                f"row {index + 1}: fill does not fit its track")
        require(label["right"] <= track["x"] and track["right"] <= value["x"],
                f"row {index + 1}: overlapping label, track, or value")
        require(abs(label["centerY"] - track["centerY"]) <= 1
                and abs(value["centerY"] - track["centerY"]) <= 1,
                f"row {index + 1}: label/value not centered on track")
        require(fill["background"] != track["background"],
                f"row {index + 1}: fill indistinguishable from track")
        ratios.append(round(ratio, 4))

    for name in (label_class, track_class, value_class):
        first, second = metrics[name]
        require(abs(first["x"] - second["x"]) <= 1
                and abs(first["right"] - second["right"]) <= 1,
                f".{name}: columns are not aligned across rows")
        require(first["bottom"] < second["y"], f".{name}: rows overlap")
    return ratios


def main():
    parser = argparse.ArgumentParser(
        description=__doc__,
        epilog="Install: python3 -m pip install playwright; "
               "python3 -m playwright install chromium. "
               "No server, fonts, network, or presentation runtime is required.")
    parser.add_argument("--guide", type=Path, default=ROOT / "references/layouts-swiss.md",
                        help="guide to test (can point at a pre-fix copy)")
    parser.add_argument("--output-dir", type=Path,
                        help="optionally save each rendered HTML fixture and screenshot")
    args = parser.parse_args()
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        parser.error("Playwright is missing. See --help for installation commands.")

    guide = args.guide.read_text(encoding="utf-8")
    section = re.search(r"^### P7\b[^\n]*\n(.*?)(?=^### |\Z)", guide, re.M | re.S)
    require(section is not None, "P7 section missing from guide")
    examples = re.findall(r"```html\s*\n(.*?)```", section.group(1), re.S)
    template = (ROOT / "assets/template-swiss.html").read_text(encoding="utf-8")
    styles = re.findall(r"<style\b[^>]*>[\s\S]*?</style>", template, re.I)
    require(styles, "Swiss template has no style blocks")
    if args.output_dir:
        args.output_dir.mkdir(parents=True, exist_ok=True)

    failures, passed = [], 0
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            for api, classes in APIS.items():
                snippets = [example for example in examples
                            if re.search(r'class=["\'][^"\']*(?<![\w-])' + api
                                         + r'(?![\w-])[^"\']*["\']', example)]
                if len(snippets) != 1:
                    failures.append(f"{api}: expected one P7 HTML example, found {len(snippets)}")
                    continue
                for viewport in ((1600, 900), (1280, 720)):
                    for low_power in (False, True):
                        mode = "low-power" if low_power else "normal"
                        case = f"{api}-{viewport[0]}x{viewport[1]}-{mode}"
                        html = ("<!doctype html><html lang='zh-CN'><head><meta charset='utf-8'>"
                                + "".join(styles) + f"<title>{case}</title></head>"
                                + f"<body class='canvas-mode {'low-power' if low_power else ''}'>"
                                + "<main id='deck'><section class='slide' data-layout='S07' "
                                + "data-slide-id='bar-chart-example'><div class='canvas-card'>"
                                + f"<h1 class='h-md'>{api}</h1>{snippets[0]}"
                                + "</div></section></main></body></html>")
                        page = browser.new_page(viewport={"width": viewport[0], "height": viewport[1]})
                        # Make accidental future external CSS dependencies fail closed.
                        page.route("**/*", lambda route: route.abort())
                        try:
                            page.set_content(html, wait_until="load")
                            page.evaluate("document.fonts.ready")
                            if args.output_dir:
                                (args.output_dir / f"{case}.html").write_text(html, encoding="utf-8")
                                page.screenshot(path=str(args.output_dir / f"{case}.png"))
                            # Measure any fill first so the historical mixed API fails
                            # on its actual zero-size rendering, before shape assertions.
                            fills = page.evaluate(MEASURE, ["row-fill", "bar-fill"])
                            for name, items in fills.items():
                                for item in items:
                                    require(item["width"] > 0 and item["height"] > 0,
                                            f".{name}: rendered fill is {item['width']} × "
                                            f"{item['height']} px; expected a visible bar")
                            ratios = verify(page.evaluate(MEASURE, classes), classes, viewport)
                            print(f"PASS {case}: fill/track ratios {ratios}")
                            passed += 1
                        except AssertionError as error:
                            failures.append(f"{case}: {error}")
                        finally:
                            page.close()
        finally:
            browser.close()
    for failure in failures:
        print(f"FAIL {failure}")
    print(f"{passed} rendered cases passed; {len(failures)} failures")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
