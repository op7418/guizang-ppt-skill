import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const validator = path.join(root, 'scripts/validate-swiss-deck.mjs');

async function loadPlaywright() {
  // Match the CLI's two dependency roots; only an absent dependency is optional.
  const candidates = [
    createRequire(pathToFileURL(validator)),
    createRequire(pathToFileURL(path.join(process.cwd(), 'package.json'))),
  ];
  for (const require of candidates) {
    let resolved;
    try {
      resolved = require.resolve('playwright');
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') continue;
      throw error;
    }
    const module = await import(pathToFileURL(resolved).href);
    return module.default || module;
  }
  return null;
}

function svgSource(width, height) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#f5f8ff"/><rect x="8" y="8" width="${width - 16}" height="${height - 16}" fill="none" stroke="#1f8b58" stroke-width="16"/><circle cx="${width / 2}" cy="${height / 2}" r="120" fill="#0037ff"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

test('rendered image slots preserve screenshots and fill generated frames', async (t) => {
  const playwright = await loadPlaywright();
  if (!playwright) {
    t.skip('Playwright is not resolvable from the repository or current project.');
    return;
  }

  // A missing/broken Chromium installation must fail, rather than silently skip.
  const browser = await playwright.chromium.launch({
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  t.after(() => browser.close());
  const directory = mkdtempSync(path.join(os.tmpdir(), 'swiss-image-slots-rendered-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const template = readFileSync(path.join(root, 'assets/template-swiss.html'), 'utf8');
  const css = template.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  assert.ok(css, 'Swiss template must contain its frame styles');
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const screenshot = svgSource(1600, 1027);
  const generated21x9 = svgSource(2100, 900);
  const generated16x10 = svgSource(1600, 1000);
  const cases = [
    { name: 'S15 screenshot with ratio frame', layout: 'S15', slot: 's15-grid-shot', classes: 'fit-contain r-16x10', source: screenshot, status: 0, natural: [1600, 1027], height: 450, fit: 'contain' },
    { name: 'S16 screenshot with h-32 frame', layout: 'S16', slot: 's16-brief-shot', classes: 'fit-contain h-32', source: screenshot, status: 0, natural: [1600, 1027], height: 288, fit: 'contain' },
    { name: 'generated 21x9 frame', layout: 'S15', slot: 's15-grid-21x9', classes: 'r-21x9', source: generated21x9, status: 0, natural: [2100, 900], height: 720 * 9 / 21, fit: 'cover' },
    { name: 'generated 16x10 frame', layout: 'S16', slot: 's16-brief-16x10', classes: 'r-16x10', source: generated16x10, status: 0, natural: [1600, 1000], height: 450, fit: 'cover' },
    { name: 'stylesheet cropping override', layout: 'S15', slot: 's15-grid-shot', classes: 'fit-contain r-16x10', source: screenshot, extra: '.frame-img > img{object-fit:cover!important}', status: 1, error: /expected contain/ },
    { name: 'collapsed screenshot frame', layout: 'S15', slot: 's15-grid-shot', classes: 'fit-contain r-16x10', source: screenshot, extra: '.frame-img{height:0!important}', status: 1, error: /collapsed image frame/ },
    { name: 'oversized screenshot image', layout: 'S15', slot: 's15-grid-shot', classes: 'fit-contain r-16x10', source: screenshot, extra: '.frame-img > img{width:200%;height:200%}', status: 1, error: /stay inside its frame/ },
    { name: 'negative screenshot object-position', layout: 'S15', slot: 's15-grid-shot', classes: 'fit-contain r-16x10', source: screenshot, extra: '.frame-img > img{object-position:-100px -100px!important}', status: 1, error: /object-position may crop/ },
    { name: 'undersized generated image', layout: 'S15', slot: 's15-grid-21x9', classes: 'r-21x9', source: generated21x9, extra: '.frame-img > img{width:50%}', status: 1, error: /must fill the generated frame/ },
    { name: 'wrong computed generated ratio', layout: 'S15', slot: 's15-grid-21x9', classes: 'r-21x9', source: generated21x9, extra: '.frame-img{aspect-ratio:1/1!important}', status: 1, error: /does not match its 21x9 ratio/ },
  ];

  for (const [index, item] of cases.entries()) {
    await t.test(item.name, async () => {
      const file = path.join(directory, `case-${index}.html`);
      writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8"><style>${css}\nbody{overflow:auto}.slide{position:relative;display:block;width:1600px;height:900px;padding:60px}.test-frame{width:720px}${item.extra || ''}</style></head><body><section class="slide" data-layout="${item.layout}"><h2 style="margin-bottom:40px">Image slot regression</h2><div class="test-frame"><div class="frame-img ${item.classes}"><img data-image-slot="${item.slot}" src="${item.source}" alt="Image slot regression source"></div></div></section></body></html>`);
      const result = spawnSync(process.execPath, [validator, file], {
        // Preserve the root from which loadPlaywright resolved project dependencies.
        cwd: process.cwd(),
        encoding: 'utf8',
        // Chromium launch itself allows 30 seconds; include measurement and shutdown.
        timeout: 60000,
      });
      const output = `stdout:\n${result.stdout || ''}\nstderr:\n${result.stderr || ''}`;
      assert.equal(result.error, undefined, output);
      assert.doesNotMatch(output, /Rendered measurement skipped/, output);
      assert.equal(result.status, item.status, output);
      if (item.error) {
        assert.match(output, item.error, output);
      } else {
        assert.match(output, /Swiss deck validation passed: 1 slide\(s\)/, output);
        await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
        const rendered = await page.locator('img').evaluate(async (img) => {
          await img.decode();
          const frame = img.parentElement.getBoundingClientRect();
          return {
            natural: [img.naturalWidth, img.naturalHeight],
            fit: getComputedStyle(img).objectFit,
            width: frame.width,
            height: frame.height,
          };
        });
        assert.deepEqual(rendered.natural, item.natural, output);
        assert.equal(rendered.fit, item.fit, output);
        assert.equal(rendered.width, 720, output);
        assert.ok(Math.abs(rendered.height - item.height) < 1, `${JSON.stringify(rendered)}\n${output}`);
      }
      // Invalid cases only need the CLI browser; release the inspection browser.
      if (index === 3) await browser.close();
    });
  }
});
