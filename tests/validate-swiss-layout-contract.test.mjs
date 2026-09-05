import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const validator = resolve(root, 'scripts/validate-swiss-deck.mjs');
const fixtureDir = mkdtempSync(resolve(tmpdir(), 'guizang-swiss-validator-'));

after(() => rmSync(fixtureDir, { recursive: true, force: true }));

function validate(name, slides, ...args) {
  const file = resolve(fixtureDir, `${name}.html`);
  writeFileSync(file, `<!doctype html><html><body>${slides}</body></html>`);
  const result = spawnSync(process.execPath, [validator, file, '--static-only', ...args], {
    cwd: root,
    encoding: 'utf8',
  });
  return {
    ...result,
    output: `${result.stdout}${result.stderr}`,
  };
}

test('accepts registered and bundled special layout IDs', () => {
  const slides = [
    '<section class="slide" data-layout="S01"><div>Index cover</div></section>',
    '<section class="slide light" data-layout="S22"><div class="hero-img-wrap"><img src="https://example.com/hero.png" alt="Hero" data-image-slot="s22-hero-21x9"></div></section>',
    '<section class="slide accent" data-layout="SWISS-COVER-ASCII"><h1 style="align-self:center">Cover</h1></section>',
    '<section class="slide split" data-layout="SWISS-CLOSING-ASCII"><h2>Closing</h2></section>',
  ].join('');
  const result = validate('registered-layouts', slides);

  assert.equal(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /Rendered measurement skipped/);
});

test('rejects missing and unknown layout IDs', () => {
  const missing = validate('missing-layout', '<section class="slide"><div>Missing</div></section>');
  const unknownSlide = '<section class="slide" data-layout="S23"><div>Unknown</div></section>';
  const unknown = validate('unknown-layout', unknownSlide);
  const unknownWithOptIn = validate('unknown-layout-opted-in', unknownSlide, '--allow-experimental');

  assert.equal(missing.status, 1, missing.output);
  assert.match(missing.output, /missing data-layout/);
  assert.equal(unknown.status, 1, unknown.output);
  assert.match(unknown.output, /not registered/);
  assert.equal(unknownWithOptIn.status, 1, unknownWithOptIn.output);
  assert.match(unknownWithOptIn.output, /not registered/);
});

for (const layout of ['P23', 'P24']) {
  test(`${layout} requires the explicit experimental opt-in`, () => {
    const className = layout === 'P23' ? 'swiss-img-split' : 'swiss-img-grid';
    const slide = `<section class="slide" data-layout="${layout}"><div class="${className}">Experimental</div></section>`;
    const locked = validate(`${layout.toLowerCase()}-locked`, slide);
    const optedIn = validate(`${layout.toLowerCase()}-allowed`, slide, '--allow-experimental');

    assert.equal(locked.status, 1, locked.output);
    assert.match(locked.output, /--allow-experimental/);
    assert.equal(optedIn.status, 0, optedIn.output);
  });
}

test('experimental structures cannot masquerade as registered layouts', () => {
  const slide = '<section class="slide" data-layout="S08"><div class="swiss-img-split">Wrong contract</div></section>';
  const result = validate('experimental-structure-with-registered-id', slide, '--allow-experimental');

  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /P23 experimental structure/);
});

test('the bundled Swiss template satisfies its own static validator', () => {
  const result = spawnSync(process.execPath, [validator, resolve(root, 'assets/template-swiss.html'), '--static-only'], {
    cwd: root,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
});

test('complete slide examples in the Swiss guide declare their contracts', () => {
  const guide = readFileSync(resolve(root, 'references/layouts-swiss.md'), 'utf8');
  const htmlExamples = [...guide.matchAll(/```html\s+([\s\S]*?)```/g)].map((match) => match[1]);
  const slideTags = htmlExamples.flatMap((example) => [...example.matchAll(/<section\b[^>]*\bclass="[^"]*\bslide\b[^"]*"[^>]*>/g)].map((match) => match[0]));
  const localImages = htmlExamples.flatMap((example) => [...example.matchAll(/<img\b[^>]*\bsrc="images\/[^"]+"[^>]*>/g)].map((match) => match[0]));

  assert.ok(slideTags.length > 0, 'expected at least one complete slide example');
  slideTags.forEach((tag) => assert.match(tag, /\bdata-layout="(?:S(?:0[1-9]|1[0-9]|2[0-2])|SWISS-(?:COVER|CLOSING)-ASCII|P2[34])"/, tag));
  slideTags.forEach((tag) => assert.match(tag, /\bdata-slide-id="[a-z0-9]+(?:-[a-z0-9]+)*"/, tag));
  localImages.forEach((tag) => assert.match(tag, /\bdata-image-slot="[^"]+"/, tag));
});

test('every documented Swiss animation recipe is registered by the template', () => {
  const guide = readFileSync(resolve(root, 'references/layouts-swiss.md'), 'utf8');
  const template = readFileSync(resolve(root, 'assets/template-swiss.html'), 'utf8');
  const documented = [...guide.matchAll(/\*\*动效 recipe\*\*:`([^`]+)`/g)].map((match) => match[1]);
  const recipeBlock = template.match(/const RECIPES = \{([\s\S]*?)\n  \};/)?.[1] ?? '';
  const registered = new Set([...recipeBlock.matchAll(/'([^']+)'\s*:/g)].map((match) => match[1]));
  const missing = [...new Set(documented)].filter((recipe) => !registered.has(recipe));

  assert.ok(documented.length > 0, 'expected documented animation recipes');
  assert.deepEqual(missing, []);
});

test('template comments only reference files that exist', () => {
  for (const templateName of ['template.html', 'template-swiss.html']) {
    const template = readFileSync(resolve(root, 'assets', templateName), 'utf8');
    const references = new Set([...template.matchAll(/references\/[a-z0-9-]+\.md/gi)].map((match) => match[0]));

    references.forEach((reference) => assert.ok(existsSync(resolve(root, reference)), `${templateName}: missing ${reference}`));
  }
});
