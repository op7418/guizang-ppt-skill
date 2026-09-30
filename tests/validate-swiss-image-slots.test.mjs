import assert from 'node:assert/strict';
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validateSwissImageSlots } from '../scripts/swiss-image-slots.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const layouts = [
  { layout: 'S15', prefix: 's15-grid' },
  { layout: 'S16', prefix: 's16-brief' },
];

function frame(slot, classes, style = '', src = 'images/example.png') {
  return `<div class="frame-img ${classes}"${style ? ` style="${style}"` : ''}><img src="${src}" data-image-slot="${slot}"></div>`;
}

function rejects(html, layout, diagnostic) {
  const errors = validateSwissImageSlots(html, layout);
  assert.ok(Array.isArray(errors), 'validator returns an array');
  assert.ok(errors.length > 0, `Expected invalid image markup to fail: ${html}`);
  assert.ok(errors.every((error) => typeof error === 'string'), 'errors are diagnostic strings');
  if (diagnostic) assert.match(errors.join('\n'), diagnostic);
}

for (const { layout, prefix } of layouts) {
  test(`${layout}: generated images retain their registered aspect ratios`, () => {
    for (const ratio of ['21x9', '16x10']) {
      assert.deepEqual(validateSwissImageSlots(frame(`${prefix}-${ratio}`, `r-${ratio}`), layout), []);
      rejects(frame(`${prefix}-${ratio}`, `r-${ratio} fit-contain`), layout, /fit-contain/);
      rejects(frame(`${prefix}-${ratio}`, 'r-4x3'), layout, new RegExp(`r-${ratio}`));
      rejects(frame(`${prefix}-${ratio}`, ''), layout);
      rejects(frame(`${prefix}-${ratio}`, `r-${ratio} r-4x3`), layout);
      rejects(frame(`${prefix}-${ratio}`, `r-${ratio}`, 'aspect-ratio: 4 / 3'), layout);
      assert.deepEqual(validateSwissImageSlots(frame(`${prefix}-${ratio}`, `r-${ratio}`, `aspect-ratio: ${ratio.replace('x', '/')}`), layout), []);
      for (const height of ['18vh', '200px', '12rem', '100%', 'auto']) {
        rejects(frame(`${prefix}-${ratio}`, `r-${ratio}`, `height: ${height}`), layout);
      }
      for (const utility of ['h-16', 'h-28', 'h-32']) {
        rejects(frame(`${prefix}-${ratio}`, `r-${ratio} ${utility}`), layout);
      }
    }
  });

  test(`${layout}: original screenshots have explicit containment and a usable frame size`, () => {
    for (const size of ['r-16x10', 'r-16x9', 'r-4x3', 'r-3x2', 'r-3x4', 'r-1x1', 'h-16', 'h-18', 'h-22', 'h-26', 'h-28', 'h-32']) {
      assert.deepEqual(validateSwissImageSlots(frame(`${prefix}-shot`, `fit-contain ${size}`), layout), [], size);
    }
    for (const style of ['height: 240px', 'height: 18vh', 'height: 20vw', 'height: 12rem', 'height: 12em', 'height: .5em', 'aspect-ratio: 1.5', 'aspect-ratio: 4 / 3']) {
      assert.deepEqual(validateSwissImageSlots(frame(`${prefix}-shot`, 'fit-contain', style), layout), [], style);
    }
    rejects(frame(`${prefix}-shot`, 'r-16x10'), layout, /fit-contain/);
    rejects(frame(`${prefix}-shot`, 'fit-contain r-21x9'), layout, /21x9/);
    rejects(frame(`${prefix}-shot`, 'fit-contain r-21x9 h-18'), layout, /21x9/);
    rejects(frame(`${prefix}-shot`, 'fit-contain'), layout);
    rejects(frame(`${prefix}-shot`, 'fit-contain h-99'), layout);
    rejects(frame(`${prefix}-shot`, 'fit-contain r-custom'), layout);
    for (const style of ['height: 100%', 'min-height: 18vh', 'max-height: 18vh', 'height: 0px', 'height: -10px', 'height: auto', 'height: 12', 'aspect-ratio: 0', 'aspect-ratio: -1', 'aspect-ratio: 4 / 0', 'aspect-ratio: auto']) {
      rejects(frame(`${prefix}-shot`, 'fit-contain', style), layout);
    }
    for (const size of ['r-16x10', 'h-18']) {
      for (const style of ['height: 0', 'height: 0px', 'max-height: 0', 'max-height: 0vh']) {
        rejects(frame(`${prefix}-shot`, `fit-contain ${size}`, style), layout);
      }
    }
    for (const style of ['aspect-ratio: 0', 'aspect-ratio: 4 / 0', 'aspect-ratio: auto']) {
      rejects(frame(`${prefix}-shot`, 'fit-contain r-16x10', style), layout);
    }
  });

  test(`${layout}: renaming or relocating an image cannot bypass the slot contract`, () => {
    rejects(frame(`${prefix}-original`, 'fit-contain r-16x10'), layout);
    rejects(frame(`${prefix}-21x9-original`, 'fit-contain r-21x9'), layout);
    rejects(frame('s22-hero-21x9', 'r-21x9'), layout);
    rejects('<div class="frame-img r-16x10 fit-contain"><img src="images/example.png"></div>', layout, /data-image-slot/);
    rejects(`<img src="images/example.png" data-image-slot="${prefix}-shot">`, layout, /frame-img/);
    rejects(`<div class="frame-img fit-contain h-18"><span><img src="images/example.png" data-image-slot="${prefix}-shot"></span></div>`, layout);
    rejects(`<div class="frame-img r-21x9"><span><img src="images/example.png" data-image-slot="${prefix}-21x9"></span></div>`, layout);
    rejects(frame(`${prefix}-shot`, 'fit-contain h-18'), layout === 'S15' ? 'S16' : 'S15');
    rejects(frame(`${prefix}-21x9`, 'r-21x9'), 'S22');
    rejects(frame(`${prefix}-16x10`, 'r-16x10'), 'S01');
    rejects(frame(`${prefix}-shot`, 'fit-contain h-18'), 'S01');
  });

  test(`${layout}: every image is checked regardless of its source`, () => {
    for (const src of ['https://example.com/screenshot.png', '/assets/screenshot.png', 'data:image/png;base64,AAAA']) {
      assert.deepEqual(validateSwissImageSlots(frame(`${prefix}-shot`, 'fit-contain h-18', '', src), layout), []);
      rejects(frame(`${prefix}-21x9`, 'r-21x9 fit-contain', '', src), layout);
      rejects(`<div class="frame-img fit-contain h-18"><img src="${src}"></div>`, layout, /data-image-slot/);
    }
  });

  test(`${layout}: validation follows each image's direct frame parent`, () => {
    const valid = frame(`${prefix}-21x9`, 'r-21x9');
    const invalid = frame(`${prefix}-shot`, 'fit-contain');
    rejects(`<div>${valid}${invalid}</div>`, layout);
    rejects(`<div class="frame-img fit-contain h-18"><div>${invalid}</div></div>`, layout);
    assert.deepEqual(validateSwissImageSlots(`${valid}${frame(`${prefix}-shot`, 'fit-contain h-18')}`, layout), []);
  });
}

test('HTML attribute quoting and order do not change slot validation', () => {
  const examples = [
    `<figure style='height: 18vh' class='frame-img fit-contain'><img data-image-slot='s15-grid-shot' alt='Original screenshot' src='images/shot.png'></figure>`,
    `<div class='frame-img r-21x9'><img data-image-slot='s15-grid-21x9' src='images/generated.png'></div>`,
    `<div class="frame-img fit-contain" style="aspect-ratio:4/3"><img data-image-slot=s15-grid-shot src=images/shot.png></div>`,
    `<div class="frame-img r-21x9"><img src=images/generated.png data-image-slot=s15-grid-21x9></div>`,
  ];
  for (const html of examples) assert.deepEqual(validateSwissImageSlots(html, 'S15'), [], html);
  rejects(`<div class='frame-img r-21x9 fit-contain'><img data-image-slot=s15-grid-21x9 src=images/generated.png></div>`, 'S15', /fit-contain/);
});

test('non-image S15/S16 layouts remain valid and unrelated slots are not reinterpreted', () => {
  assert.deepEqual(validateSwissImageSlots('<div>Text only</div>', 'S15'), []);
  assert.deepEqual(validateSwissImageSlots('<div>Text only</div>', 'S16'), []);
  assert.deepEqual(validateSwissImageSlots(frame('s22-hero-21x9', 'r-21x9'), 'S22'), []);
});

test('inline object-fit cannot override the slot intent', () => {
  const shot = frame('s15-grid-shot', 'fit-contain h-18');
  const generated = frame('s15-grid-21x9', 'r-21x9');
  rejects(shot.replace('<img ', '<img style="object-fit:cover" '), 'S15');
  rejects(generated.replace('<img ', '<img style="object-fit:contain" '), 'S15');
  assert.deepEqual(validateSwissImageSlots(shot.replace('<img ', '<img style="object-fit:contain" '), 'S15'), []);
  assert.deepEqual(validateSwissImageSlots(generated.replace('<img ', '<img style="object-fit:cover" '), 'S15'), []);
});

test('commented markup and script strings do not create visible image requirements', () => {
  const html = `<!-- <img src="images/old.png"> --><script>const sample = '<img src="images/example.png">';</script>${frame('s15-grid-shot', 'fit-contain h-18')}`;
  assert.deepEqual(validateSwissImageSlots(html, 'S15'), []);
});

test('CLI static checks accept screenshot slots and reject slot-contract violations', (t) => {
  // Isolate both module resolution roots so this exercises static validation even
  // when the calling project has Playwright installed.
  const directory = mkdtempSync(path.join(os.tmpdir(), 'swiss-image-slots-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const script of ['validate-swiss-deck.mjs', 'swiss-image-slots.mjs']) {
    copyFileSync(path.join(root, 'scripts', script), path.join(directory, script));
  }
  const cases = [
    { name: 'S15 original screenshot', layout: 'S15', content: frame('s15-grid-shot', 'fit-contain r-16x10'), status: 0 },
    { name: 'S16 original screenshot', layout: 'S16', content: frame('s16-brief-shot', 'fit-contain h-18'), status: 0 },
    { name: 'mixed attribute quotes', layout: 'S15', content: `<div class="frame-img fit-contain h-18"><img src="images/shot.png" data-image-slot='s15-grid-shot'></div>`, status: 0 },
    { name: 'generated 21:9 image', layout: 'S15', content: frame('s15-grid-21x9', 'r-21x9'), status: 0 },
    { name: 'contained generated image', layout: 'S15', content: frame('s15-grid-21x9', 'fit-contain r-21x9'), status: 1 },
    { name: 'unknown replacement slot', layout: 'S16', content: frame('s16-brief-original', 'fit-contain h-18'), status: 1 },
    { name: 'unsized screenshot', layout: 'S16', content: frame('s16-brief-shot', 'fit-contain'), status: 1 },
    { name: 'unregistered remote image', layout: 'S15', content: '<img src="https://example.com/screenshot.png">', status: 1 },
    { name: 'slot on another layout', layout: 'S01', content: frame('s15-grid-shot', 'fit-contain h-18'), status: 1 },
  ];
  for (const { name, layout, content, status } of cases) {
    const file = path.join(directory, 'index.html');
    writeFileSync(file, `<!doctype html><html><body><section class="slide" data-layout="${layout}">${content}</section></body></html>`);
    const result = spawnSync(process.execPath, [path.join(directory, 'validate-swiss-deck.mjs'), file], {
      cwd: directory,
      env: { ...process.env, NODE_PATH: '' },
      encoding: 'utf8',
    });
    assert.ifError(result.error);
    assert.equal(result.status, status, `${name}\n${result.stdout}${result.stderr}`);
    assert.match(result.stderr, /Rendered measurement skipped/, name);
    if (status === 0) assert.match(result.stdout, /Swiss deck validation passed: 1 slide\(s\)/, name);
    else assert.match(result.stderr, /Slide 1:/, name);
  }
});
