"""
build-standalone.py — Bundle a guizang Swiss PPT HTML into a fully self-contained offline file.

Embeds:
  - Google Fonts (Inter + JetBrains Mono, Latin subset only: U+0000-024F)
  - motion.min.js (as a data: URI for ES module import)
  - Lucide icons (inline SVG for the 4 icons used in Swiss layouts)

Usage:
  python build-standalone.py                        # default: index.html -> standalone.html (same dir)
  python build-standalone.py input.html             # -> input_standalone.html
  python build-standalone.py input.html output.html # explicit output path
  python build-standalone.py --no-fonts input.html  # skip font embedding (faster, needs network)

Requirements: Python 3.8+, no external packages.
"""

import argparse
import base64
import os
import re
import ssl
import sys
import urllib.request

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

FONTS_URL = (
    'https://fonts.googleapis.com/css2?'
    'family=Inter:wght@200;300;400;500;600;700;800;900'
    '&family=JetBrains+Mono:wght@300;400;500;600&display=swap'
)

# Lucide icons used in Swiss layouts — extend this dict if new icons are needed
LUCIDE_ICONS = {
    'trending-up': (
        '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>'
        '<polyline points="16 7 22 7 22 13"></polyline>'
    ),
    'calendar': (
        '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>'
        '<line x1="16" y1="2" x2="16" y2="6"></line>'
        '<line x1="8" y1="2" x2="8" y2="6"></line>'
        '<line x1="3" y1="10" x2="21" y2="10"></line>'
    ),
    'landmark': (
        '<line x1="3" y1="22" x2="21" y2="22"></line>'
        '<line x1="6" y1="18" x2="6" y2="11"></line>'
        '<line x1="10" y1="18" x2="10" y2="11"></line>'
        '<line x1="14" y1="18" x2="14" y2="11"></line>'
        '<line x1="18" y1="18" x2="18" y2="11"></line>'
        '<polygon points="12 2 20 7 4 7"></polygon>'
    ),
    'bar-chart-2': (
        '<line x1="18" y1="20" x2="18" y2="10"></line>'
        '<line x1="12" y1="20" x2="12" y2="4"></line>'
        '<line x1="6" y1="20" x2="6" y2="14"></line>'
    ),
    'briefcase': (
        '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>'
        '<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>'
    ),
    'award': (
        '<circle cx="12" cy="8" r="6"></circle>'
        '<path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>'
    ),
    'zap': (
        '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>'
    ),
    'target': (
        '<circle cx="12" cy="12" r="10"></circle>'
        '<circle cx="12" cy="12" r="6"></circle>'
        '<circle cx="12" cy="12" r="2"></circle>'
    ),
}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        ctx = ssl.create_default_context()
        with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
            return r.read()
    except Exception:
        ctx2 = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=ctx2, timeout=30) as r:
            return r.read()


def embed_fonts() -> str:
    """Download Google Fonts CSS, keep only Latin subsets, embed woff2 as data URIs."""
    print('Fetching Google Fonts CSS...')
    raw_css = fetch(FONTS_URL).decode('utf-8')

    blocks = re.findall(r'@font-face\s*\{[^}]+\}', raw_css, re.DOTALL)
    latin_blocks = [
        b for b in blocks
        if 'U+0000-00FF' in b or 'U+0100-024F' in b or 'U+0100-02BA' in b
    ]
    print(f'  @font-face blocks: {len(latin_blocks)} / {len(blocks)} (Latin only)')

    css = '\n'.join(latin_blocks)

    woff2_urls = list(dict.fromkeys(
        re.findall(r'url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)', css)
    ))
    print(f'  Unique woff2 files: {len(woff2_urls)}')

    total_raw = 0
    for i, url in enumerate(woff2_urls):
        label = url.split('/')[-1][:40]
        print(f'  [{i+1}/{len(woff2_urls)}] {label}', end=' ... ', flush=True)
        data = fetch(url)
        total_raw += len(data)
        b64 = base64.b64encode(data).decode('ascii')
        css = css.replace(url, f'data:font/woff2;base64,{b64}')
        print(f'{len(data)//1024}KB')

    print(f'  Fonts total: {total_raw//1024}KB raw -> {len(css)//1024}KB CSS')
    return css


def embed_motion(input_dir: str) -> str:
    """Read motion.min.js from assets/ sibling of input file, return base64 data URI."""
    motion_path = os.path.join(input_dir, 'assets', 'motion.min.js')
    if not os.path.exists(motion_path):
        print(f'  WARNING: motion.min.js not found at {motion_path} — skipping motion embed')
        return ''
    with open(motion_path, 'rb') as f:
        data = f.read()
    b64 = base64.b64encode(data).decode('ascii')
    print(f'  motion.min.js: {len(data)//1024}KB')
    return f'data:text/javascript;base64,{b64}'


def build_lucide_inline() -> str:
    icons_js = ',\n    '.join(
        f"'{name}':'{svg}'" for name, svg in LUCIDE_ICONS.items()
    )
    return f"""<script>
(function(){{
  var ICONS={{
    {icons_js}
  }};
  document.addEventListener('DOMContentLoaded',function(){{
    document.querySelectorAll('i[data-lucide]').forEach(function(el){{
      var name=el.getAttribute('data-lucide');
      if(!ICONS[name])return;
      var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
      svg.setAttribute('viewBox','0 0 24 24');
      svg.setAttribute('fill','none');
      svg.setAttribute('stroke','currentColor');
      svg.setAttribute('stroke-width','2');
      svg.setAttribute('stroke-linecap','round');
      svg.setAttribute('stroke-linejoin','round');
      if(el.className)svg.className=el.className;
      svg.innerHTML=ICONS[name];
      el.parentNode.replaceChild(svg,el);
    }});
  }});
}})();
</script>"""


def assemble(input_path: str, output_path: str, embed_fonts_flag: bool = True) -> None:
    input_dir = os.path.dirname(os.path.abspath(input_path))

    print(f'Reading {input_path}...')
    with open(input_path, 'r', encoding='utf-8') as f:
        html = f.read()
    print(f'  Source: {len(html)//1024}KB')

    # ── 1. Remove Google Fonts link tags ────────────────────────────────────
    html = re.sub(r'<link rel="preconnect"[^>]+>\s*\n?', '', html)
    html = re.sub(r'<link [^>]*fonts\.googleapis\.com[^>]*>\s*\n?', '', html)

    # ── 2. Embed fonts ───────────────────────────────────────────────────────
    if embed_fonts_flag:
        fonts_css = embed_fonts()
        font_style_tag = f'<style>\n{fonts_css}\n</style>\n'
        html = html.replace('<style>', font_style_tag + '<style>', 1)
    else:
        print('  Skipping font embed (--no-fonts)')

    # ── 3. Embed motion.min.js as data: URI ─────────────────────────────────
    motion_uri = embed_motion(input_dir)
    if motion_uri:
        html = html.replace(
            "await import('./assets/motion.min.js')",
            f"await import('{motion_uri}')"
        )

    # ── 4. Replace Lucide CDN with inline icon creator ───────────────────────
    lucide_inline = build_lucide_inline()
    html = re.sub(
        r'<script src="https://unpkg\.com/lucide[^"]*"[^>]*></script>\s*\n?',
        '', html
    )
    html = re.sub(
        r'<script>if\(typeof lucide[^<]+</script>\s*\n?',
        '', html
    )
    html = html.replace('</body>', lucide_inline + '\n</body>')

    # ── 5. Write output as pure UTF-8 (binary mode avoids BOM on Windows) ───
    with open(output_path, 'wb') as f:
        f.write(html.encode('utf-8'))

    size_kb = os.path.getsize(output_path) // 1024
    print(f'\nOutput: {output_path}')
    print(f'  Size: {size_kb}KB ({size_kb/1024:.1f}MB)')
    print('Done.')


def main():
    parser = argparse.ArgumentParser(
        description='Bundle a guizang Swiss PPT HTML into a fully offline standalone file.'
    )
    parser.add_argument('input', nargs='?', default='index.html',
                        help='Input HTML file (default: index.html)')
    parser.add_argument('output', nargs='?', default=None,
                        help='Output HTML file (default: <input-stem>_standalone.html)')
    parser.add_argument('--no-fonts', action='store_true',
                        help='Skip Google Fonts embedding (deck will require network for fonts)')
    args = parser.parse_args()

    input_path = os.path.abspath(args.input)
    if not os.path.exists(input_path):
        print(f'Error: input file not found: {input_path}', file=sys.stderr)
        sys.exit(1)

    if args.output:
        output_path = os.path.abspath(args.output)
    else:
        stem, _ = os.path.splitext(input_path)
        output_path = stem + '_standalone.html'

    assemble(input_path, output_path, embed_fonts_flag=not args.no_fonts)


if __name__ == '__main__':
    main()
