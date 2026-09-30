#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { validateSwissImageSlots } from './swiss-image-slots.mjs';

const file = process.argv[2];
const allowExperimental = process.argv.includes('--allow-experimental');

if (!file) {
  console.error('Usage: node scripts/validate-swiss-deck.mjs <index.html> [--allow-experimental]');
  process.exit(2);
}

const html = readFileSync(file, 'utf8');
const htmlForSlides = html.replace(/<!--[\s\S]*?-->/g, '');
const errors = [];
const warnings = [];

function overflowFix(px) {
  const n = Math.round(px);
  if (n <= 40) return `only ${n}px over: nudge content up or tighten one gap/padding by 20-40px; do not delete content`;
  if (n <= 90) return `${n}px over: compact local gaps/padding and reduce one block height; avoid cutting copy`;
  if (n <= 160) return `${n}px over: reduce a display title slightly or compress one paragraph before deleting content`;
  return `${n}px over: switch to a higher-capacity layout or remove/merge content intentionally`;
}

async function loadPlaywright() {
  const candidates = [
    createRequire(import.meta.url),
    createRequire(pathToFileURL(path.join(process.cwd(), 'package.json')).href),
  ];
  for (const req of candidates) {
    try {
      const resolved = req.resolve('playwright');
      const mod = await import(pathToFileURL(resolved).href);
      return mod.default || mod;
    } catch {
      // Try the next resolution root.
    }
  }
  return null;
}

const allowedLayouts = new Set([
  'SWISS-COVER-ASCII',
  'SWISS-CLOSING-ASCII',
  ...Array.from({ length: 22 }, (_, i) => `S${String(i + 1).padStart(2, '0')}`),
]);

const slideRe = /<section\b[^>]*class="[^"]*\bslide\b[^"]*"[^>]*>[\s\S]*?<\/section>/g;
const slides = [...htmlForSlides.matchAll(slideRe)].map((m, idx) => ({ idx: idx + 1, html: m[0], tag: m[0].match(/<section\b[^>]*>/)?.[0] ?? '' }));

if (!slides.length) {
  errors.push('No <section class="slide"> pages found.');
}

slides.forEach((slide) => {
  const layout = slide.tag.match(/\bdata-layout="([^"]+)"/)?.[1];

  if (!layout) {
    errors.push(`Slide ${slide.idx}: missing data-layout. Swiss locked mode requires S01-S22 or SWISS-COVER-ASCII/SWISS-CLOSING-ASCII.`);
  } else if (!allowedLayouts.has(layout)) {
    errors.push(`Slide ${slide.idx}: data-layout="${layout}" is not registered in swiss-layout-lock.md.`);
  }

  if (!allowExperimental && /\bdata-layout="P2[34]\b|Swiss Image Split|Swiss Evidence Grid|swiss-img-split|swiss-img-grid/.test(slide.html)) {
    errors.push(`Slide ${slide.idx}: uses experimental P23/P24 image structure. Use S22 or S15/S16 image-grid adaptations instead.`);
  }

  const isStatement = layout === 'S03' || layout === 'S09' || layout === 'S10' || layout === 'SWISS-COVER-ASCII' || layout === 'SWISS-CLOSING-ASCII';
  const topChunk = slide.html.slice(0, 1800);

  if (!isStatement && /text-align\s*:\s*center/i.test(topChunk)) {
    errors.push(`Slide ${slide.idx}: top title area contains text-align:center. Swiss body titles should stay left aligned.`);
  }

  if (!isStatement && /align-self\s*:\s*center/i.test(topChunk) && /<h[12]\b/i.test(topChunk)) {
    errors.push(`Slide ${slide.idx}: top heading appears vertically/centrally aligned. Use the original left-top title skeleton.`);
  }

  if (!isStatement && /grid-template-columns\s*:\s*[0-9.]+fr\s+[0-9.]+fr/i.test(topChunk) && /<h[12]\b/i.test(topChunk)) {
    warnings.push(`Slide ${slide.idx}: heading inside a custom fr/fr grid. Confirm this is copied from the original Sxx skeleton, not a centered title hack.`);
  }

  if (/<svg\b[\s\S]*?<text\b/i.test(slide.html)) {
    errors.push(`Slide ${slide.idx}: SVG contains visible <text>. Put labels in HTML grid/captions, keep SVG for geometry only.`);
  }

  const localImages = layout === 'S15' || layout === 'S16' ? [] : [...slide.html.matchAll(/<img\b[^>]*src="images\//g)];
  localImages.forEach((_, imageIndex) => {
    const imgTag = slide.html.slice(_.index, slide.html.indexOf('>', _.index) + 1);
    if (!/\bdata-image-slot="/.test(imgTag)) {
      errors.push(`Slide ${slide.idx}: local image ${imageIndex + 1} missing data-image-slot. Bind every image to a layout slot such as s22-hero-21x9 or s15-grid-21x9.`);
    }
  });

  for (const error of validateSwissImageSlots(slide.html, layout)) {
    errors.push(`Slide ${slide.idx}: ${error}`);
  }

  if (layout === 'S22') {
    if (!/data-image-slot="s22-hero-21x9"/.test(slide.html)) {
      errors.push(`Slide ${slide.idx}: S22 must use data-image-slot="s22-hero-21x9".`);
    }
    if (/object-position\s*:\s*top center/i.test(slide.html)) {
      errors.push(`Slide ${slide.idx}: S22 photo uses object-position:top center, which commonly crops faces. Use center 35% or center center.`);
    }
  }
});

async function runRenderedMeasurements() {
  const playwright = await loadPlaywright();
  if (!playwright?.chromium) {
    warnings.push('Rendered measurement skipped: Playwright is not resolvable from the skill folder or current project. Static Swiss checks still ran.');
    return;
  }

  const browser = await playwright.chromium.launch({
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1600, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto(pathToFileURL(path.resolve(file)).href, { waitUntil: 'domcontentloaded' });
    await Promise.race([
      page.evaluate(() => document.fonts && document.fonts.ready),
      page.waitForTimeout(1800),
    ]);
    await page.waitForTimeout(800);

    const measures = await page.$$eval('section.slide', (els) => {
      const TRANSPARENT = /rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0?\s*\)|transparent/;
      const titleSelector = [
        '.h-hero', '.h-hero-zh', '.h-xl', '.h-xl-zh', '.h-statement',
        '.display', '.display-zh', '.h1-zh', '.h2-zh', '.h-md',
        '.step-title', 'h1', 'h2', 'h3',
      ].join(',');
      const hasDirectText = (n) => {
        for (const c of n.childNodes) {
          if (c.nodeType === 3 && c.textContent.trim().length > 0) return true;
        }
        return false;
      };
      const colorVisible = (c) => c && !TRANSPARENT.test(c);
      const labelFor = (n) => {
        const cls = n.className ? '.' + String(n.className).split(' ').filter(Boolean).join('.') : n.tagName.toLowerCase();
        const text = n.textContent.trim().replace(/\s+/g, ' ').slice(0, 40);
        return text ? `${cls} "${text}"` : cls;
      };
      const isMeaningful = (el, n) => {
        const er = el.getBoundingClientRect();
        const posterArea = er.width * er.height;
        const tag = n.tagName;
        const cs = getComputedStyle(n);
        const r = n.getBoundingClientRect();
        if (r.width < 6 || r.height < 6) return false;
        if (n === el || n.classList.contains('canvas-card')) return false;
        if (cs.position === 'fixed') return false;
        if (cs.position === 'absolute' && r.width * r.height >= posterArea * 0.82) return false;
        if (n.matches('canvas.ascii-bg, canvas.mag-bg, .grain, .dot-mat, .ring-mat, .cross-mat')) return false;

        const isText = hasDirectText(n);
        const isMedia = tag === 'IMG' || tag === 'CANVAS' || tag === 'SVG';
        const isRule = tag === 'HR' || (r.height <= 4 && (
          parseFloat(cs.borderTopWidth) >= 1 ||
          parseFloat(cs.borderBottomWidth) >= 1 ||
          colorVisible(cs.backgroundColor)
        ));
        const hasFill = colorVisible(cs.backgroundColor) && r.width * r.height >= 1600 && !['MAIN', 'SECTION'].includes(tag);
        const hasBorder = (parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) +
          parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth)) >= 1 && r.width * r.height >= 1600;
        return isText || isMedia || isRule || hasFill || hasBorder;
      };
      const titleGapChecks = (el, nodes) => {
        const titles = Array.from(el.querySelectorAll(titleSelector)).filter((n) => n.textContent.trim());
        const out = [];
        for (const title of titles) {
          const tr = title.getBoundingClientRect();
          const isLocal = title.matches('.h-md, .step-title, h3');
          const minGap = isLocal ? 14 : 32;
          let nearest = null;
          let nearestGap = Infinity;
          for (const node of nodes) {
            if (node === title || title.contains(node) || node.contains(title)) continue;
            const nr = node.getBoundingClientRect();
            const gap = nr.top - tr.bottom;
            if (gap < -2) continue;
            const overlap = Math.max(0, Math.min(tr.right, nr.right) - Math.max(tr.left, nr.left));
            const overlapRatio = overlap / Math.min(tr.width, nr.width);
            if (overlapRatio < 0.12 && gap < 96) continue;
            if (gap < nearestGap) {
              nearestGap = gap;
              nearest = node;
            }
          }
          if (nearest && nearestGap < minGap) {
            out.push({ title: labelFor(title), next: labelFor(nearest), gap: Math.round(nearestGap), minGap });
          }
        }
        return out;
      };

      return els.map((el, index) => {
        const er = el.getBoundingClientRect();
        const H = el.clientHeight;
        const W = el.clientWidth;
        const nodes = Array.from(el.querySelectorAll('*')).filter((n) => isMeaningful(el, n));
        let top = Infinity;
        let bottom = -Infinity;
        let topNode = null;
        let bottomNode = null;
        for (const n of nodes) {
          const r = n.getBoundingClientRect();
          const itemTop = r.top - er.top;
          const itemBottom = r.bottom - er.top;
          if (itemTop < top) {
            top = itemTop;
            topNode = n;
          }
          if (itemBottom > bottom) {
            bottom = itemBottom;
            bottomNode = n;
          }
        }
        if (!nodes.length) {
          top = 0;
          bottom = 0;
        }
        const safeBottom = Math.round(H * 0.93);
        return {
          idx: index + 1,
          id: el.id || '',
          layout: el.dataset.layout || '',
          width: W,
          height: H,
          scrollOverflow: Math.max(0, Math.round(el.scrollHeight - H)),
          visual: {
            top: Math.round(top),
            bottom: Math.round(bottom),
            activeRatio: H ? (bottom - top) / H : 0,
            bottomGap: Math.max(0, Math.round(H - bottom)),
            topOverflow: Math.max(0, Math.round(-top)),
            bottomOverflow: Math.max(0, Math.round(bottom - H)),
            bottomNode: bottomNode ? labelFor(bottomNode) : '',
            topNode: topNode ? labelFor(topNode) : '',
            safeBottom,
          },
          titleGaps: titleGapChecks(el, nodes),
          imageSlots: Array.from(el.querySelectorAll('img[data-image-slot]')).map((img) => {
            const frame = img.parentElement;
            const rect = frame.getBoundingClientRect();
            const imageRect = img.getBoundingClientRect();
            const style = getComputedStyle(img);
            const positionInFrame = style.objectPosition.split(/\s+/).every((part) => /^(?:\d+(?:\.\d+)?%|0px)$/.test(part) && parseFloat(part) <= 100);
            return {
              slot: img.dataset.imageSlot, width: rect.width, height: rect.height, fit: style.objectFit,
              positionInFrame,
              outsideFrame: imageRect.left < rect.left - 1 || imageRect.top < rect.top - 1 || imageRect.right > rect.right + 1 || imageRect.bottom > rect.bottom + 1,
              fillsFrame: Math.abs(imageRect.width - frame.clientWidth) <= 1 && Math.abs(imageRect.height - frame.clientHeight) <= 1,
              imageHasSize: imageRect.width > 0 && imageRect.height > 0,
            };
          }),
        };
      });
    });

    for (const m of measures) {
      const prefix = `Slide ${m.idx}${m.layout ? ` (${m.layout})` : ''}`;
      if (m.scrollOverflow > 4) {
        errors.push(`${prefix}: M1 DOM overflow ${m.scrollOverflow}px. ${overflowFix(m.scrollOverflow)}.`);
      }
      if (m.visual.bottomOverflow > 4) {
        errors.push(`${prefix}: M1 visual bottom overflow ${m.visual.bottomOverflow}px; lowest element is ${m.visual.bottomNode}. ${overflowFix(m.visual.bottomOverflow)}.`);
      }
      if (m.visual.topOverflow > 4) {
        errors.push(`${prefix}: M1 visual top overflow ${m.visual.topOverflow}px; highest element is ${m.visual.topNode}. Move content down by the measured overflow plus 16-24px.`);
      }
      if (m.visual.bottom > m.visual.safeBottom) {
        warnings.push(`${prefix}: M1 content reaches ${Math.round(m.visual.bottom)}px; nav-safe line is ${m.visual.safeBottom}px. Lift the lowest block or add .nav-safe-bottom.`);
      }
      if (m.visual.bottomGap > 170 && m.visual.activeRatio < 0.74) {
        warnings.push(`${prefix}: M1 bottom whitespace ${m.visual.bottomGap}px; active content height ${Math.round(m.visual.activeRatio * 100)}%. Restore spacing/content instead of over-correcting overflow.`);
      }
      for (const gap of m.titleGaps) {
        warnings.push(`${prefix}: M2 ${gap.title} has ${gap.gap}px gap before ${gap.next} (min ${gap.minGap}px).`);
      }
      for (const image of m.imageSlots) {
        const slot = image.slot.match(/^s(?:15-grid|16-brief)-(shot|21x9|16x10)$/);
        if (!slot) continue;
        if (image.width <= 0 || image.height <= 0) {
          errors.push(`${prefix}: ${image.slot} has a collapsed image frame (${image.width}x${image.height}px).`);
          continue;
        }
        const expectedFit = slot[1] === 'shot' ? 'contain' : 'cover';
        if (image.fit !== expectedFit) errors.push(`${prefix}: ${image.slot} renders with object-fit:${image.fit}; expected ${expectedFit}.`);
        if (!image.imageHasSize || image.outsideFrame) errors.push(`${prefix}: ${image.slot} image must have positive dimensions and stay inside its frame.`);
        if (slot[1] === 'shot' && !image.positionInFrame) errors.push(`${prefix}: ${image.slot} object-position may crop the source screenshot; use center center or percentages between 0% and 100%.`);
        if (slot[1] !== 'shot') {
          if (!image.fillsFrame) errors.push(`${prefix}: ${image.slot} image must fill the generated frame.`);
          const [width, height] = slot[1].split('x').map(Number);
          if (Math.abs(image.width / image.height - width / height) > 0.03) errors.push(`${prefix}: ${image.slot} rendered frame does not match its ${slot[1]} ratio (${Math.round(image.width)}x${Math.round(image.height)}px).`);
        }
      }
    }
  } finally {
    await browser.close();
  }
}

await runRenderedMeasurements();

if (warnings.length) {
  console.warn('Warnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error('Swiss deck validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Swiss deck validation passed: ${slides.length} slide(s).`);
