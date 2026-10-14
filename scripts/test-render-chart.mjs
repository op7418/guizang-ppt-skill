import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { Socket } from 'node:net';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import * as echarts from 'echarts';
import * as fontkit from 'fontkit';
import {
  CHART_TYPES, THEMES, parseCSV, loadSpec, validateSpec, selectFont,
  formatValue, buildOption, inspectLayout, render, main,
} from './render-chart.mjs';

const SCRIPT = fileURLToPath(new URL('./render-chart.mjs', import.meta.url));
const KINDS = ['pie', 'donut', 'bar', 'barh', 'line'];
const PALETTES = {
  'magazine-ink': ['#f1efea', '#0a0a0b', '#0a0a0b'],
  'magazine-indigo': ['#f1f3f5', '#0a1f3d', '#0a1f3d'],
  'magazine-forest': ['#f5f1e8', '#1a2e1f', '#1a2e1f'],
  'magazine-kraft': ['#eedfc7', '#2a1e13', '#2a1e13'],
  'magazine-dune': ['#f0e6d2', '#1f1a14', '#1f1a14'],
  'swiss-ikb': ['#fafaf8', '#0a0a0a', '#002FA7'],
  'swiss-lemon': ['#fafaf8', '#0a0a0a', '#FFD500'],
  'swiss-green': ['#fafaf8', '#0a0a0a', '#C5E803'],
  'swiss-orange': ['#fafaf8', '#0a0a0a', '#FF6B35'],
};
const makeSpec = (type = 'bar', overrides = {}) => ({
  type, labels: ['华东', '华南', '华北'], series: [{ name: '销售额', values: [12, 8, 5] }],
  title: '季度销售分析', source: '来源：内部统计', x_label: '区域', y_label: '金额',
  unit: '万元', width: 800, height: 500, show_values: true, ...overrides,
});
const seriesOf = (...values) => values.map((items, index) => ({ name: `系列${index}`, values: items }));
const near = (actual, expected, epsilon = 1e-6) =>
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);

function temporary(t) {
  const root = mkdtempSync(join(tmpdir(), 'chart-js-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return {
    root, path: name => join(root, name),
    write(name, content) { const path = join(root, name); writeFileSync(path, content); return path; },
    json(name = 'input.json', spec = makeSpec()) {
      return this.write(name, JSON.stringify(spec));
    },
  };
}

function figure(t, input) {
  const spec = validateSpec(input), font = selectFont(spec);
  const chart = echarts.init(createCanvas(spec.width, spec.height), null, {
    renderer: 'canvas', ssr: true, width: spec.width, height: spec.height, devicePixelRatio: 1,
  });
  t.after(() => chart.dispose());
  chart.setOption(buildOption(spec, font.family));
  chart.getZr().refreshImmediately();
  return { chart, spec, font };
}

function assertGlyphs(font, text) {
  const opened = fontkit.openSync(font.path);
  const face = (opened.fonts || [opened]).find(item => item.postscriptName === font.postscriptName);
  assert.ok(face, `Selected font face missing from ${font.path}`);
  assert.equal(face.familyName, font.family);
  const chars = [...new Set([...text].filter(char => !/\s/.test(char)))];
  for (const char of chars) assert.ok(face.hasGlyphForCodePoint(char.codePointAt(0)), `Missing glyph: ${char}`);
  assert.ok(face.layout(chars.join('')).glyphs.every(glyph => glyph.id !== 0), 'Font shaping produced .notdef');
}

async function assertPNG(path, width, height, paper = PALETTES['magazine-ink'][0], accent) {
  const bytes = readFileSync(path);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(bytes.readUInt32BE(16), width);
  assert.equal(bytes.readUInt32BE(20), height);
  const image = await loadImage(bytes);
  assert.deepEqual([image.width, image.height], [width, height]);
  const context = createCanvas(width, height).getContext('2d');
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, width, height).data;
  const rgb = hex => hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16));
  const background = rgb(paper), foreground = accent && rgb(accent);
  assert.deepEqual([...pixels.subarray(0, 4)], [...background, 255]);
  let content = 0, accentPixels = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] && background.some((value, channel) => value !== pixels[i + channel])) content++;
    if (foreground?.every((value, channel) => value === pixels[i + channel]) && pixels[i + 3] === 255) accentPixels++;
  }
  assert.ok(content > 100, 'PNG contains no meaningful non-background pixels');
  if (foreground) assert.ok(accentPixels > 10, 'Theme accent missing from actual pixels');
}

function cli(root, args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: root, encoding: 'utf8', timeout: 60000, maxBuffer: 1024 * 1024,
    env: { ...process.env, DISPLAY: '', WAYLAND_DISPLAY: '' },
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  return result;
}

function oneJSON(text) {
  assert.equal(text.trim().split('\n').length, 1, text);
  assert.ok(text.length <= 2000, 'CLI JSON must remain brief');
  return JSON.parse(text);
}
function errorJSON(result) {
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  const error = oneJSON(result.stderr);
  assert.deepEqual(Object.keys(error), ['error']);
  assert.equal(typeof error.error, 'string');
  assert.ok(error.error.trim());
  assert.doesNotMatch(result.stderr, /Traceback|\n\s+at /);
  return error.error;
}
async function callMain(t, args) {
  const stdout = [], stderr = [];
  const log = t.mock.method(console, 'log', (...items) => stdout.push(items.join(' ')));
  const error = t.mock.method(console, 'error', (...items) => stderr.push(items.join(' ')));
  try {
    const pending = main(args);
    assert.ok(pending instanceof Promise);
    return { status: await pending, stdout: stdout.join('\n'), stderr: stderr.join('\n') };
  } finally { log.mock.restore(); error.mock.restore(); }
}

function assertLine(t, values) {
  const { chart } = figure(t, makeSpec('line', {
    labels: values.map((_, i) => `L${i}`), series: seriesOf(values), unit: '',
  }));
  const data = chart.getModel().getSeriesByIndex(0).getData();
  const line = chart.getZr().storage.getDisplayList().find(element => element.type === 'ec-polyline');
  assert.ok(line, 'Real ECharts line path is missing');
  assert.equal(line.shape.connectNulls, false);
  assert.equal(line.shape.points.length, values.length * 2);
  const commands = [];
  line.buildPath({
    moveTo: (x, y) => commands.push(['M', x, y]),
    lineTo: (x, y) => commands.push(['L', x, y]),
  }, line.shape);
  const expected = [];
  values.forEach((value, index) => {
    const stored = data.get(data.mapDimension('y'), index);
    if (value === null) {
      assert.ok(Number.isNaN(stored));
      assert.ok(Number.isNaN(line.shape.points[index * 2 + 1]));
      assert.ok(!data.getItemGraphicEl(index), 'Null point must not acquire a symbol');
    } else {
      assert.equal(stored, value);
      assert.ok(data.getItemGraphicEl(index));
      expected.push([index === 0 || values[index - 1] === null ? 'M' : 'L',
        ...chart.convertToPixel({ seriesIndex: 0 }, [index, value])]);
    }
  });
  assert.deepEqual(commands.map(item => item[0]), expected.map(item => item[0]));
  commands.forEach((command, index) => {
    near(command[1], expected[index][1], 1e-3);
    near(command[2], expected[index][2], 1e-3);
  });
}

function assertPie(t, type, values, fractions) {
  const { chart } = figure(t, makeSpec(type, { series: seriesOf(values) }));
  const data = chart.getModel().getSeriesByIndex(0).getData();
  assert.equal(data.count(), values.length);
  values.forEach((value, index) => {
    const shape = data.getItemGraphicEl(index).shape;
    assert.equal(data.getRawDataItem(index).rawValue, value);
    near(Math.abs(shape.endAngle - shape.startAngle) / (2 * Math.PI), fractions[index]);
    assert.ok(shape.r > 0);
    if (type === 'donut') assert.ok(shape.r0 > 0 && shape.r0 < shape.r);
    else assert.equal(shape.r0, 0);
  });
}

test('validation applies defaults without sharing or mutating input', () => {
  const input = { type: 'bar', labels: ['甲'], series: seriesOf([1]) };
  const original = structuredClone(input), spec = validateSpec(input);
  assert.deepEqual(input, original);
  assert.deepEqual([spec.width, spec.height, spec.theme, spec.stacked, spec.show_values],
    [1600, 900, 'magazine-ink', false, false]);
  for (const key of ['title', 'source', 'unit', 'x_label', 'y_label']) assert.equal(spec[key], '');
  spec.labels[0] = '乙'; spec.series[0].values[0] = 99;
  assert.deepEqual(input, original);
});

test('five chart types and nine exact theme palettes are supported', () => {
  assert.deepEqual(CHART_TYPES, KINDS);
  assert.deepEqual(THEMES, PALETTES);
  for (const type of KINDS) for (const theme of Object.keys(PALETTES)) {
    const spec = validateSpec(makeSpec(type, { theme }));
    assert.equal(spec.type, type); assert.equal(spec.theme, theme);
  }
});

test('all types reject nonfinite, boolean, string and oversized values', () => {
  for (const type of KINDS) for (const value of [NaN, Infinity, -Infinity, true, false, '12', 'NaN', 1e101, -1e101, undefined, {}, 1n]) {
    assert.throws(() => validateSpec(makeSpec(type, { series: seriesOf([1, value, 3]) })), /finite numbers/);
  }
});

test('numeric magnitudes and integer dimension boundaries are enforced', () => {
  for (const type of ['bar', 'barh', 'line']) {
    validateSpec(makeSpec(type, { series: seriesOf([-1e100, 0, 1e100]) }));
    validateSpec(makeSpec(type, { series: seriesOf([-1e-100, 0, 1e-100]) }));
  }
  for (const key of ['width', 'height']) {
    for (const value of [400, 4096]) assert.equal(validateSpec(makeSpec('bar', { [key]: value }))[key], value);
    for (const value of [399, 4097, 0, -1, 800.5, NaN, Infinity, true, '800', null]) {
      assert.throws(() => validateSpec(makeSpec('bar', { [key]: value })), new RegExp(key));
    }
  }
});

test('root, labels, series shapes and lengths reject malformed input', () => {
  for (const input of [null, [], true, 1, 'chart']) assert.throws(() => validateSpec(input));
  for (const labels of [null, [], 'ABC', [''], [' '], [1], [true], [null]]) {
    assert.throws(() => validateSpec(makeSpec('bar', { labels })));
  }
  for (const series of [null, [], {}, 'S', [null], [{ name: 'S' }], [{ values: [1, 2, 3] }],
    ...[null, 1, '', ' '].map(name => [{ name, values: [1, 2, 3] }]),
    ...[null, [], [1, 2], [1, 2, 3, 4], '123'].map(values => [{ name: 'S', values }])]) {
    assert.throws(() => validateSpec(makeSpec('bar', { series })));
  }
  for (const key of ['type', 'labels', 'series']) {
    const spec = makeSpec(); delete spec[key]; assert.throws(() => validateSpec(spec));
  }
});

test('unknown fields, duplicate series, optional types and invalid stacks fail', () => {
  assert.throws(() => validateSpec(makeSpec('bar', { extra: true })), /Unknown fields/);
  assert.throws(() => validateSpec(makeSpec('bar', { series: [{ name: 'S', values: [1, 2, 3], extra: true }] })), /exactly/);
  assert.throws(() => validateSpec(makeSpec('bar', { series: [{ name: 'S', values: [1, 2, 3] }, { name: 'S', values: [4, 5, 6] }] })), /unique/);
  for (const key of ['title', 'source', 'unit', 'x_label', 'y_label']) for (const value of [null, true, 1, []]) {
    assert.throws(() => validateSpec(makeSpec('bar', { [key]: value })));
  }
  for (const key of ['show_values', 'stacked']) for (const value of [0, 1, 'true', null]) {
    assert.throws(() => validateSpec(makeSpec('bar', { [key]: value })));
  }
  for (const type of [null, 'scatter', 'BAR']) assert.throws(() => validateSpec(makeSpec(type)));
  for (const theme of [null, 1, 'unknown', '__proto__', 'toString']) assert.throws(() => validateSpec(makeSpec('bar', { theme })));
  for (const type of KINDS) {
    if (['bar', 'barh'].includes(type)) validateSpec(makeSpec(type, { stacked: true }));
    else assert.throws(() => validateSpec(makeSpec(type, { stacked: true })), /stacked/);
  }
});

test('category and series count limits include their valid endpoints', () => {
  const labels = Array.from({ length: 80 }, (_, i) => `L${i}`);
  const series = Array.from({ length: 8 }, (_, i) => ({ name: `S${i}`, values: labels.map(() => i + 1) }));
  validateSpec(makeSpec('bar', { labels, series }));
  assert.throws(() => validateSpec(makeSpec('bar', { labels: [...labels, 'extra'], series: seriesOf(Array(81).fill(1)) })), /1-80/);
  assert.throws(() => validateSpec(makeSpec('bar', { labels, series: [...series, { name: 'extra', values: Array(80).fill(1) }] })), /1-8/);
  for (const type of ['pie', 'donut']) {
    validateSpec(makeSpec(type, { labels: labels.slice(0, 8), series: seriesOf(Array(8).fill(1)) }));
    assert.throws(() => validateSpec(makeSpec(type, { labels: labels.slice(0, 9), series: seriesOf(Array(9).fill(1)) })), /at most 8/);
    assert.throws(() => validateSpec(makeSpec(type, { series: seriesOf([1, 2, 3], [4, 5, 6]) })), /one series/);
  }
});

test('null is preserved only in line series containing a number', () => {
  for (const type of KINDS) {
    const spec = makeSpec(type, { series: seriesOf([1, null, 3]) });
    if (type === 'line') assert.equal(validateSpec(spec).series[0].values[1], null);
    else assert.throws(() => validateSpec(spec), /null/);
  }
  assert.throws(() => validateSpec(makeSpec('line', { series: seriesOf([null, null, null]) })), /at least one/);
});

test('pie and donut reject zero totals and negatives but accept zero slices', () => {
  for (const type of ['pie', 'donut']) {
    for (const values of [[0, 0, 0], [-0, 0, -0], [-1, 2, 3], [-1, -2, -3]]) {
      assert.throws(() => validateSpec(makeSpec(type, { series: seriesOf(values) })), /positive total/);
    }
    validateSpec(makeSpec(type, { series: seriesOf([0, 2, 0]) }));
  }
});

test('JSON loading handles BOM, Unicode, syntax, roots, encoding and suffixes', t => {
  const files = temporary(t), spec = makeSpec();
  assert.deepEqual(loadSpec(files.write('input.JSON', '\uFEFF' + JSON.stringify(spec))), spec);
  for (const [i, text] of ['[]', 'null', '12', 'true', '"text"', '{broken', '{"a":1,}', '{"v":NaN}', '{"v":Infinity}'].entries()) {
    assert.throws(() => loadSpec(files.write(`bad-${i}.json`, text)));
  }
  assert.throws(() => loadSpec(files.write('bad.json', Buffer.from([0xff, 0xfe, 0x80]))));
  assert.throws(() => loadSpec(files.write('input.txt', '{}')), /json or .csv/);
  assert.throws(() => loadSpec(files.path('missing.json')), /ENOENT/);
});

test('CSV preserves quoted commas, escaped quotes, newlines, BOM and missing cells', t => {
  const files = temporary(t);
  const csv = '\uFEFF 地区 , 营收 , 利润 \r\n" 华东,沿海 ", +1.25e1 , .2 \r\n"华""南", , -3. \r\n"华\n北",0,';
  const expected = { labels: ['华东,沿海', '华"南', '华\n北'], series: [
    { name: '营收', values: [12.5, null, 0] }, { name: '利润', values: [0.2, -3, null] },
  ] };
  assert.deepEqual(parseCSV(csv), expected);
  assert.deepEqual(loadSpec(files.write('input.CSV', csv)), expected);
  validateSpec({ type: 'line', ...expected });
  assert.throws(() => validateSpec({ type: 'bar', ...expected }));
  for (const newline of ['\n', '\r\n', '\r']) for (const ending of ['', newline]) {
    assert.deepEqual(parseCSV(`类别,数量${newline}甲,1${ending}`).series[0].values, [1]);
  }
  assert.deepEqual(parseCSV('类别,数量\n甲,""').series[0].values, [null]);
});

test('CSV rejects empty or duplicate headers, wrong columns and empty labels', () => {
  for (const text of ['', '地区,销售\n', '地区\n华东\n', '地区, \n华东,1\n', ' ,销售\n华东,1\n',
    '地区,销售, 销售 \n华东,1,2\n', '地区,地区\n华东,1\n']) assert.throws(() => parseCSV(text));
  for (const row of ['华东', '华东,1,2', '']) assert.throws(() => parseCSV(`地区,销售\n${row}\n`), /row 2.*2 columns/);
  assert.throws(() => validateSpec({ type: 'line', ...parseCSV('地区,销售\n  ,1\n') }), /nonempty/);
});

test('CSV rejects malformed quoting and nondecimal tokens with locations', () => {
  for (const row of ['"华东,1', '华"东,1', '"华东"oops,1', '"华东""x,1']) {
    assert.throws(() => parseCSV(`地区,销售\n${row}`), /quote|quoted/);
  }
  for (const value of ['oops', 'true', 'false', 'null', '0x10', '0b10', '1_000', '1.2.3', '1e', 'NaN', 'inf', '-Infinity']) {
    assert.throws(() => parseCSV(`地区,销售\n华东,${value}\n`), /row 2, column 2/);
  }
});

test('loaded JSON and CSV magnitudes are validated without coercion', t => {
  const files = temporary(t);
  for (const token of ['1e101', '-1e101', '1e999']) {
    const csv = loadSpec(files.write('number.csv', `地区,销售\n华东,${token}`));
    assert.throws(() => validateSpec({ type: 'line', ...csv }), /finite numbers/);
    const json = loadSpec(files.write('number.json', `{"type":"line","labels":["甲"],"series":[{"name":"S","values":[${token}]}]}`));
    assert.throws(() => validateSpec(json), /finite numbers/);
  }
  for (const value of [true, false, '12']) {
    assert.throws(() => validateSpec(loadSpec(files.json('coercion.json', makeSpec('bar', { series: seriesOf([1, value, 3]) })))), /finite numbers/);
  }
});

test('automatic fonts genuinely cover Chinese and all metadata glyphs', () => {
  for (const theme of ['magazine-ink', 'swiss-ikb']) {
    const spec = validateSpec(makeSpec('bar', { theme })), font = selectFont(spec);
    assert.ok(existsSync(font.path));
    assertGlyphs(font, [spec.title, spec.source, spec.x_label, spec.y_label, spec.unit,
      ...spec.labels, ...spec.series.map(item => item.name), '0123456789%.,()-+e'].join(''));
  }
});

test('explicit font paths and family names work; absent and corrupt fonts fail', t => {
  const files = temporary(t), spec = validateSpec(makeSpec()), font = selectFont(spec);
  assert.equal(selectFont(spec, font.path).path, font.path);
  assert.equal(selectFont(spec, font.family).family, font.family);
  for (const requested of [files.path('missing.ttf'), 'NoSuchChartFont-6f2b99', files.write('broken.ttf', 'not a font')]) {
    assert.throws(() => selectFont(spec, requested), /No matching font/);
  }
  assert.throws(() => selectFont({ ...spec, title: '\u{10FFFF}' }, font.path), /No matching font/);
});

test('formatValue retains signs, small nonzero numbers and literal units', () => {
  for (const [value, unit, expected] of [[1234.5, '万元', '1,234.5万元'], [-12.5, '%', '-12.5%'], [0, '', '0'], [1.23456789, '', '1.23457']]) {
    assert.equal(formatValue(value, unit), expected);
  }
  for (const value of [1e-100, 1e100, -1e-100]) {
    const text = formatValue(value);
    assert.equal(Number(text.replaceAll(',', '')), value);
    assert.doesNotMatch(text, /NaN|Infinity/);
  }
});

test('grouped bar and barh geometry preserves values, zero baselines and separation', t => {
  const values = [[2, -3, 0], [5, -7, 11]];
  for (const type of ['bar', 'barh']) {
    const { chart } = figure(t, makeSpec(type, { series: seriesOf(...values) }));
    const horizontal = type === 'barh', along = horizontal ? 0 : 1, across = 1 - along;
    const centers = [[], []], breadths = [[], []];
    values.forEach((items, seriesIndex) => {
      const data = chart.getModel().getSeriesByIndex(seriesIndex).getData();
      assert.equal(data.count(), 3);
      items.forEach((value, category) => {
        const box = data.getItemLayout(category);
        assert.equal(data.getItemGraphicEl(category).type, 'rect');
        const start = [box.x, box.y], end = [box.x + box.width, box.y + box.height];
        near(chart.convertFromPixel({ seriesIndex }, start)[along], 0);
        near(chart.convertFromPixel({ seriesIndex }, end)[along], value);
        centers[seriesIndex][category] = (start[across] + end[across]) / 2;
        breadths[seriesIndex][category] = end[across] - start[across];
        assert.ok(breadths[seriesIndex][category] > 0);
      });
    });
    values[0].forEach((_, category) => {
      const point = chart.convertToPixel({ seriesIndex: 0 }, horizontal ? [0, category] : [category, 0]);
      near((centers[0][category] + centers[1][category]) / 2, point[across]);
      near(breadths[0][category], breadths[1][category]);
      assert.ok(Math.abs(centers[0][category] - centers[1][category]) > breadths[0][category]);
    });
    if (horizontal) assert.ok(centers[0][0] < centers[0][1]);
  }
});

test('positive and negative stacks accumulate independently in actual bar geometry', t => {
  const values = [[4, -3, 2, -2], [-1, 5, 7, -4], [6, -2, -5, 3]];
  const bases = [[0, 0, 0, 0], [0, 0, 2, -2], [4, -3, 0, 0]];
  for (const type of ['bar', 'barh']) {
    const { chart } = figure(t, makeSpec(type, { stacked: true, labels: ['甲', '乙', '丙', '丁'], series: seriesOf(...values) }));
    const horizontal = type === 'barh', along = horizontal ? 0 : 1, ends = [[], [], [], []];
    values.forEach((items, seriesIndex) => items.forEach((value, category) => {
      const data = chart.getModel().getSeriesByIndex(seriesIndex).getData();
      const box = data.getItemLayout(category);
      assert.equal(data.getItemGraphicEl(category).type, 'rect');
      const start = chart.convertFromPixel({ seriesIndex }, [box.x, box.y])[along];
      const end = chart.convertFromPixel({ seriesIndex }, [box.x + box.width, box.y + box.height])[along];
      near(start, bases[seriesIndex][category]); near(end - start, value);
      const pixel = chart.convertToPixel({ seriesIndex }, horizontal ? [0, category] : [category, 0]);
      near(horizontal ? box.y + box.height / 2 : box.x + box.width / 2, pixel[1 - along]);
      ends[category].push(end);
    }));
    for (let category = 0; category < 4; category++) {
      near(Math.max(...ends[category]), [10, 5, 9, 3][category]);
      near(Math.min(...ends[category]), [-1, -5, -5, -6][category]);
    }
  }
});

test('line interior null creates two real path segments, never a zero point', t => {
  assertLine(t, [5, 8, null, 4, 7]);
});

test('line endpoint and consecutive nulls remain absent in geometry', t => {
  for (const values of [[null, 2, 3, 4, null], [1, null, null, 4, 5], [null, null, 3, null, null]]) assertLine(t, values);
});

test('pie and donut geometry respects zero slices and proportional angles', t => {
  for (const type of ['pie', 'donut']) assertPie(t, type, [1, 0, 3], [0.25, 0, 0.75]);
});

test('large and tiny pie values retain actual proportions and render PNGs', async t => {
  const files = temporary(t);
  for (const magnitude of [1e-100, 1e99]) for (const type of ['pie', 'donut']) {
    const values = [magnitude, magnitude, 2 * magnitude];
    assertPie(t, type, values, [0.25, 0.25, 0.5]);
    const output = files.path(`${type}-${magnitude}.png`);
    await render(makeSpec(type, { series: seriesOf(values) }), output);
    await assertPNG(output, 800, 500);
  }
});

test('all five types render real Chinese glyphs and nonempty exact-size PNGs', async t => {
  const files = temporary(t);
  for (const type of KINDS) {
    const input = makeSpec(type);
    if (!['pie', 'donut'].includes(type)) input.series.push({ name: '预算', values: [9, 7, 6] });
    const original = structuredClone(input), output = files.path(`${type}.png`);
    const result = await render(input, output);
    assert.deepEqual(input, original);
    assert.equal(result.output, output); assert.equal(result.type, type);
    assert.deepEqual([result.width, result.height, result.categories, result.series], [800, 500, 3, input.series.length]);
    assert.ok(result.font); assert.ok(Array.isArray(result.warnings));
    await assertPNG(output, 800, 500);
    const { chart, font } = figure(t, input);
    const spans = chart.getZr().storage.getDisplayList().filter(element => element.type === 'tspan' && !element.ignore && element.style.text);
    const text = spans.map(element => element.style.text).join('');
    for (const expected of [input.title, input.source, input.unit, ...input.labels]) assert.ok(text.includes(expected), expected);
    for (const span of spans) assert.ok(span.style.font.includes(font.family), span.style.font);
    assertGlyphs(font, text);
    assert.ok(inspectLayout(chart, 800, 500).every(warning => typeof warning === 'string'));
  }
});

test('all nine themes produce their exact background and accent pixels', async t => {
  const files = temporary(t);
  for (const [index, [theme, [paper, , accent]]] of Object.entries(PALETTES).entries()) {
    const type = KINDS[index % KINDS.length], output = files.path(`${theme}.png`);
    const result = await render(makeSpec(type, { theme }), output);
    assert.equal(result.theme, theme);
    await assertPNG(output, 800, 500, paper, accent);
  }
});

test('PNG dimensions support defaults, odd sizes and both valid extremes', async t => {
  const files = temporary(t);
  for (const [width, height] of [[400, 400], [937, 521], [1600, 900], [4096, 400], [400, 4096]]) {
    const spec = makeSpec('bar', { width, height }), output = files.path(`${width}x${height}.png`);
    if (width === 1600) { delete spec.width; delete spec.height; }
    await render(spec, output);
    await assertPNG(output, width, height);
  }
});

test('layout inspection flags dense labels while standard charts fit the canvas', async t => {
  const files = temporary(t);
  const standard = await render(makeSpec('bar', { width: 1600, height: 900, show_values: false }), files.path('standard.png'));
  assert.deepEqual(standard.warnings, []);
  const crowded = await render(makeSpec('bar', { width: 400, height: 400,
    labels: Array.from({ length: 40 }, (_, index) => `拥挤类别${index}`),
    series: [{ name: '数量', values: Array(40).fill(2) }] }), files.path('crowded.png'));
  assert.ok(crowded.warnings.some(warning => /overlap|outside/.test(warning)));
});

test('large signed bar values remain proportional after axis normalization', t => {
  for (const magnitude of [1e-100, 1e99]) {
    const { chart } = figure(t, makeSpec('bar', { series: seriesOf([magnitude, 2 * magnitude, -magnitude]) }));
    const data = chart.getModel().getSeriesByIndex(0).getData();
    const heights = [0, 1, 2].map(index => data.getItemLayout(index).height);
    near(Math.abs(heights[1] / heights[0]), 2);
    near(heights[2] / heights[0], -1);
  }
});

test('native rendering works offline with an explicitly selected local font', async t => {
  const files = temporary(t), spec = makeSpec('line'), font = selectFont(validateSpec(spec));
  const blocked = () => { throw new Error('Rendering must not access the network'); };
  const connection = t.mock.method(Socket.prototype, 'connect', blocked);
  const fetch = t.mock.method(globalThis, 'fetch', blocked);
  try {
    const output = files.path('offline.png'), result = await render(spec, output, font.path);
    assert.equal(result.font, font.family);
    await assertPNG(output, 800, 500);
    assert.equal(connection.mock.callCount(), 0); assert.equal(fetch.mock.callCount(), 0);
  } finally { connection.mock.restore(); fetch.mock.restore(); }
});

test('render rejects bad output paths and invalid input and never overwrites files', async t => {
  const files = temporary(t), sentinel = Buffer.from('existing content\0\xff');
  for (const name of ['chart', 'chart.jpg', 'chart.svg', 'chart.png.backup', 'missing/chart.png']) {
    const output = files.path(name);
    await assert.rejects(render(makeSpec(), output)); assert.equal(existsSync(output), false);
  }
  assert.equal(existsSync(files.path('missing')), false);
  const existing = files.write('existing.png', sentinel);
  await assert.rejects(render(makeSpec(), existing), /already exists/);
  assert.deepEqual(readFileSync(existing), sentinel);
  await assert.rejects(render(makeSpec(), join(existing, 'child.png')));
  const invalid = files.path('invalid.png');
  await assert.rejects(render(makeSpec('bar', { extra: true }), invalid)); assert.equal(existsSync(invalid), false);
  const raced = files.path('race.PNG');
  const results = await Promise.allSettled([render(makeSpec(), raced), render(makeSpec(), raced)]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter(result => result.status === 'rejected').length, 1);
  await assertPNG(raced, 800, 500);
});

test('async main handles BOM CSV and overrides with one concise success JSON', async t => {
  const files = temporary(t), input = files.write('input.csv', '\uFEFF地区,实际,预算\n华东,3,4\n华南,5,6\n');
  const output = files.path('main.png');
  const result = await callMain(t, ['--input', input, '--output', output, '--type', 'barh', '--theme', 'swiss-green',
    '--title', '销售统计', '--source', '来源：内部数据', '--x-label', '金额', '--y-label', '地区', '--unit', '元',
    '--width', '800', '--height', '500', '--show-values', '--stacked']);
  assert.equal(result.status, 0); assert.equal(result.stderr, '');
  const summary = oneJSON(result.stdout);
  assert.deepEqual([summary.output, summary.type, summary.theme, summary.series, summary.categories], [output, 'barh', 'swiss-green', 2, 2]);
  await assertPNG(output, 800, 500, PALETTES['swiss-green'][0]);
});

test('async main validation errors return nonzero and one brief JSON error', async t => {
  const files = temporary(t), input = files.json('invalid.json', makeSpec('bar', { extra: true }));
  const output = files.path('failure.png');
  const result = await callMain(t, ['--input', input, '--output', output]);
  assert.match(errorJSON(result), /Unknown fields/);
  assert.equal(existsSync(output), false);
});

test('CLI entry point succeeds headlessly with --font and uppercase PNG suffix', async t => {
  const files = temporary(t), input = files.json(), output = files.path('success.PNG');
  const font = selectFont(validateSpec(makeSpec()));
  const result = cli(files.root, ['--input', input, '--output', output, '--font', font.path]);
  assert.equal(result.status, 0, result.stderr); assert.equal(result.stderr, '');
  const summary = oneJSON(result.stdout);
  assert.equal(summary.output, output); assert.equal(summary.font, font.family);
  await assertPNG(output, 800, 500);
});

test('CLI malformed inputs and arguments fail nonzero without output or stack traces', t => {
  const files = temporary(t), input = files.json(), output = files.path('error.png');
  const badInputs = [files.json('unknown.json', makeSpec('bar', { extra: true })),
    files.json('bool.json', makeSpec('bar', { series: seriesOf([1, true, 3]) })),
    files.write('syntax.json', '{broken'), files.write('array.json', '[]'),
    files.write('bad.csv', '地区,销售\n华东,oops'), files.write('short.csv', '地区,销售\n华东'),
    files.write('input.txt', '{}'), files.write('encoding.json', Buffer.from([0xff, 0xfe])), files.path('missing.json')];
  for (const source of badInputs) {
    errorJSON(cli(files.root, ['--input', source, '--output', output, '--type', 'bar']));
    assert.equal(existsSync(output), false);
  }
  const base = ['--input', input, '--output', output];
  for (const args of [[], ['--input', input], [...base, '--unknown-option'], [...base, 'positional'], [...base, '--type'],
    ...[['--type', 'scatter'], ['--theme', 'unknown'], ['--width', 'wide'], ['--width', '800.5'], ['--height', '399']].map(pair => [...base, ...pair])]) {
    errorJSON(cli(files.root, args)); assert.equal(existsSync(output), false);
  }
});

test('CLI rejects invalid --font and output paths while preserving source and destination', t => {
  const files = temporary(t), input = files.json(), original = readFileSync(input), output = files.path('font.png');
  for (const font of ['NoSuchChartFont-6f2b99', files.path('missing.ttf'), files.write('corrupt.ttf', 'bad font')]) {
    assert.match(errorJSON(cli(files.root, ['--input', input, '--output', output, '--font', font])), /font/i);
    assert.equal(existsSync(output), false);
  }
  const sentinel = Buffer.from('do not overwrite'), existing = files.write('existing.png', sentinel);
  for (const destination of [existing, input, files.path('wrong.svg'), files.path('missing/out.png')]) {
    errorJSON(cli(files.root, ['--input', input, '--output', destination]));
    if (destination !== existing && destination !== input) assert.equal(existsSync(destination), false);
  }
  assert.deepEqual(readFileSync(existing), sentinel);
  assert.deepEqual(readFileSync(input), original);
});
