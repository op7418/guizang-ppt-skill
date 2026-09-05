import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const validator = resolve(root, 'scripts/validate-presenter-mode.mjs');
const emptyTemplate = resolve(root, 'assets/template.html');
const populatedTemplate = resolve(root, 'assets/template-swiss.html');

function validate(file, ...args) {
  const result = spawnSync(process.execPath, [validator, file, ...args], {
    cwd: root,
    encoding: 'utf8',
  });
  return {
    ...result,
    output: `${result.stdout}${result.stderr}`,
  };
}

test('an empty deck fails unless runtime-only validation is explicit', () => {
  const deckResult = validate(emptyTemplate);
  const runtimeResult = validate(emptyTemplate, '--runtime-only');

  assert.equal(deckResult.status, 1, deckResult.output);
  assert.match(deckResult.output, /Pass --runtime-only/);
  assert.equal(runtimeResult.status, 0, runtimeResult.output);
  assert.match(runtimeResult.output, /only the reusable presenter runtime/);
});

for (const args of [
  ['--target-minutes'],
  ['--target-minutes', 'nope'],
  ['--target-minutes=0'],
  ['--target-minutes=-5'],
]) {
  test(`rejects invalid timing option: ${args.join(' ')}`, () => {
    const result = validate(populatedTemplate, ...args);

    assert.equal(result.status, 2, result.output);
    assert.match(result.output, /requires a positive number/);
  });
}

test('accepts both supported target-minute syntaxes', () => {
  const spaced = validate(populatedTemplate, '--target-minutes', '2');
  const equals = validate(populatedTemplate, '--target-minutes=2');

  assert.equal(spaced.status, 0, spaced.output);
  assert.equal(equals.status, 0, equals.output);
});

test('rejects unknown options', () => {
  const result = validate(populatedTemplate, '--typo');

  assert.equal(result.status, 2, result.output);
  assert.match(result.output, /Unknown option/);
});
