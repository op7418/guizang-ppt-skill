import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

let canvasAPI;
let echarts;
let fontkit;
try {
  canvasAPI = await import('@napi-rs/canvas');
  echarts = await import('echarts');
  fontkit = await import('fontkit');
} catch {
  console.error(JSON.stringify({ error: 'Missing chart dependencies. Run npm ci --ignore-scripts in the skill directory.' }));
  process.exit(1);
}
const { createCanvas, GlobalFonts } = canvasAPI;
echarts.setPlatformAPI({ createCanvas: () => createCanvas(32, 32) });

export const THEMES = {
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
export const CHART_TYPES = ['pie', 'donut', 'bar', 'barh', 'line'];
const fields = new Set(['type', 'theme', 'title', 'x_label', 'y_label', 'source', 'unit',
  'show_values', 'stacked', 'width', 'height', 'labels', 'series']);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const check = (condition, message) => { if (!condition) throw new Error(message); };
const numberPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

export function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', quoted = false, closed = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') { quoted = false; closed = true; }
      else cell += char;
    } else if (char === ',' || char === '\r' || char === '\n') {
      row.push(cell); cell = ''; closed = false;
      if (char !== ',') {
        rows.push(row); row = [];
        if (char === '\r' && text[i + 1] === '\n') i++;
      }
    } else if (char === '"') {
      check(cell === '' && !closed, `CSV row ${rows.length + 1}: unexpected quote.`);
      quoted = true;
    } else {
      check(!closed || /[ \t]/.test(char), `CSV row ${rows.length + 1}: text after closing quote.`);
      cell += char;
    }
  }
  check(!quoted, 'CSV contains an unclosed quoted field.');
  if (cell !== '' || row.length || closed) rows.push([...row, cell]);
  check(rows.length >= 2 && rows[0].length >= 2, 'CSV needs a header and data: labels first, numeric series after.');
  const header = rows[0].map(value => value.trim());
  check(header.every(Boolean) && new Set(header).size === header.length, 'CSV headers must be nonempty and unique.');
  const series = header.slice(1).map(name => ({ name, values: [] }));
  const labels = [];
  rows.slice(1).forEach((values, rowIndex) => {
    check(values.length === header.length, `CSV row ${rowIndex + 2}: expected ${header.length} columns.`);
    labels.push(values[0].trim());
    series.forEach((item, column) => {
      const raw = values[column + 1].trim();
      check(raw === '' || numberPattern.test(raw), `CSV row ${rowIndex + 2}, column ${column + 2}: not a decimal number.`);
      item.values.push(raw === '' ? null : Number(raw));
    });
  });
  return { labels, series };
}

export function loadSpec(path) {
  const text = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(path)).replace(/^\uFEFF/, '');
  if (extname(path).toLowerCase() === '.csv') return parseCSV(text);
  check(extname(path).toLowerCase() === '.json', 'Input must be a .json or .csv file.');
  const spec = JSON.parse(text);
  check(isObject(spec), 'JSON must be an object containing type, labels and series.');
  return spec;
}

export function validateSpec(input) {
  check(isObject(input), 'Chart specification must be an object.');
  const unknown = Object.keys(input).filter(key => !fields.has(key));
  check(!unknown.length, `Unknown fields: ${unknown.join(', ')}`);
  check(CHART_TYPES.includes(input.type), `Set type (or --type) to one of: ${CHART_TYPES.join(', ')}`);
  const spec = { theme: 'magazine-ink', title: '', x_label: '', y_label: '', source: '', unit: '',
    show_values: false, stacked: false, width: 1600, height: 900, ...input };
  check(typeof spec.theme === 'string' && Object.hasOwn(THEMES, spec.theme), 'Unknown theme.');
  for (const key of ['title', 'x_label', 'y_label', 'source', 'unit']) {
    check(typeof spec[key] === 'string', `${key} must be a string.`);
  }
  for (const key of ['show_values', 'stacked']) check(typeof spec[key] === 'boolean', `${key} must be true or false.`);
  for (const key of ['width', 'height']) {
    check(Number.isInteger(spec[key]) && spec[key] >= 400 && spec[key] <= 4096,
      `${key} must be an integer between 400 and 4096 pixels.`);
  }
  check(Array.isArray(spec.labels) && spec.labels.length >= 1 && spec.labels.length <= 80,
    'labels must contain 1-80 categories; aggregate larger datasets explicitly first.');
  check(spec.labels.every(label => typeof label === 'string' && label.trim()), 'Each label must be a nonempty string.');
  check(Array.isArray(spec.series) && spec.series.length >= 1 && spec.series.length <= 8, 'series must contain 1-8 named series.');
  for (const [index, item] of spec.series.entries()) {
    check(isObject(item) && Object.keys(item).sort().join(',') === 'name,values',
      `Series ${index + 1} must contain exactly name and values.`);
    check(typeof item.name === 'string' && item.name.trim(), `Series ${index + 1} needs a nonempty name.`);
    check(Array.isArray(item.values) && item.values.length === spec.labels.length, `Series ${item.name}: values must match labels in length.`);
    for (const value of item.values) {
      if (value === null && spec.type === 'line') continue;
      check(typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 1e100,
        `Series ${item.name}: values must be finite numbers with magnitude <= 1e100; null is allowed only in line charts.`);
    }
    check(item.values.some(value => value !== null), `Series ${item.name}: at least one numeric value is required.`);
  }
  check(new Set(spec.series.map(item => item.name)).size === spec.series.length, 'Series names must be unique.');
  check(!spec.stacked || ['bar', 'barh'].includes(spec.type), 'stacked is supported only for bar and barh charts.');
  if (['pie', 'donut'].includes(spec.type)) {
    check(spec.series.length === 1 && spec.labels.length <= 8, 'Pie/donut charts need one series and at most 8 categories.');
    const values = spec.series[0].values;
    check(values.every(value => value >= 0) && values.some(value => value > 0),
      'Pie/donut values must be nonnegative with a positive total.');
  }
  return structuredClone(spec);
}

let fontFiles;
const fontCache = new Map();
function systemFontFiles() {
  if (fontFiles) return fontFiles;
  const directories = process.platform === 'darwin'
    ? ['/System/Library/Fonts', '/Library/Fonts', join(homedir(), 'Library/Fonts')]
    : process.platform === 'win32'
      ? [join(process.env.WINDIR || 'C:\\Windows', 'Fonts'), join(homedir(), 'AppData/Local/Microsoft/Windows/Fonts')]
      : ['/usr/share/fonts', '/usr/local/share/fonts', join(homedir(), '.fonts'), join(homedir(), '.local/share/fonts')];
  fontFiles = [];
  function visit(directory) {
    if (!existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (/\.(ttf|ttc|otf|otc)$/i.test(entry.name)) fontFiles.push(path);
    }
  }
  directories.forEach(visit);
  return fontFiles;
}
function faces(path) {
  if (!fontCache.has(path)) {
    try {
      const font = fontkit.openSync(path);
      const rank = face => Number(!/regular|normal|book/i.test(face.subfamilyName)) * 10 +
        (/\bSC\b/.test(face.familyName) ? 0 : /\bTC\b/.test(face.familyName) ? 1 : 2);
      fontCache.set(path, (font.fonts || [font]).sort((a, b) => rank(a) - rank(b)));
    } catch { fontCache.set(path, []); }
  }
  return fontCache.get(path);
}

export function selectFont(spec, requested) {
  const text = [spec.title, spec.x_label, spec.y_label, spec.source, spec.unit, ...spec.labels,
    ...spec.series.map(item => item.name), '0123456789%.,()-+e'].join('');
  const codepoints = [...new Set([...text].filter(char => !/\s/.test(char)).map(char => char.codePointAt(0)))];
  const requestedPath = requested?.startsWith('~/') ? join(homedir(), requested.slice(2)) : requested;
  const isFile = requestedPath && existsSync(requestedPath) && statSync(requestedPath).isFile();
  const priorities = spec.theme.startsWith('magazine')
    ? [/Songti|NotoSerifCJK/i, /Arial.*Unicode|NotoSansCJK|PingFang|Heiti/i]
    : [/Arial.*Unicode|NotoSansCJK|PingFang|Heiti/i];
  const paths = isFile ? [resolve(requestedPath)] : [...systemFontFiles()].sort((a, b) => {
    const rank = path => { const i = priorities.findIndex(pattern => pattern.test(path)); return i < 0 ? 100 : i; };
    return rank(a) - rank(b);
  });
  for (const path of paths) {
    for (const face of faces(path)) {
      if (requested && !isFile && face.familyName !== requested && face.fullName !== requested) continue;
      if (!codepoints.every(codepoint => face.hasGlyphForCodePoint(codepoint))) continue;
      check(GlobalFonts.registerFromPath(path) !== null, `Cannot register font: ${path}`);
      return { family: face.familyName, path, postscriptName: face.postscriptName };
    }
  }
  throw new Error('No matching font covers all chart text. Install a suitable font or pass --font /path/to/font.ttf.');
}

export function formatValue(value, unit = '') {
  if (value !== 0 && (Math.abs(value) >= 1e9 || Math.abs(value) < 1e-4)) {
    return value.toExponential(5).replace(/\.?0+(?=e)/, '') + unit;
  }
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 6 }).format(value) + unit;
}
const wrap = (text, length) => text.split('\n').map(line => {
  const chars = [...line];
  return Array.from({ length: Math.ceil(chars.length / length) }, (_, i) => chars.slice(i * length, (i + 1) * length).join('')).join('\n');
}).join('\n');
const dark = color => {
  const rgb = color.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 < 0.45;
};

export function buildOption(input, fontFamily) {
  const spec = validateSpec(input);
  const [paper, ink, accent] = THEMES[spec.theme];
  const colors = [accent, '#737373', '#d4d4d2', ink, '#f0f0ee', '#737373', '#d4d4d2', ink];
  const scale = Math.min(spec.width / 1600, spec.height / 900);
  const fontSize = 28 * scale;
  const option = {
    animation: false, backgroundColor: paper, color: colors,
    textStyle: { fontFamily, fontSize, color: ink },
    tooltip: { show: false },
    title: { text: wrap(spec.title, 32), left: '8%', top: '4%', padding: 0,
      textStyle: { fontFamily, fontSize: 42 * scale, fontWeight: 'normal', color: ink, lineHeight: 54 * scale } },
    graphic: [{ type: 'text', left: '8%', bottom: '3%', silent: true,
      style: { text: wrap(spec.source, 70), fontFamily, fontSize: 20 * scale, fill: ink, lineHeight: 26 * scale } }],
  };
  const decal = index => index === 0 ? undefined : {
    symbol: index % 3 === 0 ? 'circle' : 'rect', color: dark(colors[index]) ? paper : ink,
    dashArrayX: [1, 0], dashArrayY: [2, 6 + index * 2], rotation: index % 2 ? Math.PI / 4 : -Math.PI / 4,
    symbolSize: 1,
  };
  if (spec.type === 'pie' || spec.type === 'donut') {
    const values = spec.series[0].values;
    const largest = Math.max(...values);
    const normalized = values.map(value => value / largest);
    const total = normalized.reduce((a, b) => a + b, 0);
    const keys = values.map((_, i) => `slice-${i}`);
    option.legend = { data: keys, orient: 'vertical', left: '55%', top: 'middle', selectedMode: false, icon: 'rect',
      itemWidth: 28 * scale, itemHeight: 17 * scale, itemGap: 22 * scale,
      textStyle: { fontFamily, fontSize, color: ink, lineHeight: 36 * scale },
      formatter: key => {
        const index = keys.indexOf(key);
        return `${wrap(spec.labels[index], 14)}  ${formatValue(values[index], spec.unit)} (${(normalized[index] / total * 100).toFixed(1)}%)`;
      } };
    option.series = [{ type: 'pie', silent: true, clockwise: true, startAngle: 90, stillShowZeroSum: false,
      center: ['30%', '51%'], radius: spec.type === 'donut' ? ['31%', '48%'] : [0, '48%'],
      label: { show: false }, labelLine: { show: false }, emphasis: { disabled: true },
      data: normalized.map((value, index) => ({ value, name: keys[index], rawValue: values[index],
        itemStyle: { color: colors[index], borderColor: paper, borderWidth: 3 * scale, decal: decal(index) } })) }];
    if (spec.type === 'donut') {
      option.graphic.push({ type: 'text', x: spec.width * 0.30, y: spec.height * 0.51, silent: true,
        style: { text: formatValue(values.reduce((a, b) => a + b, 0), spec.unit), fontFamily,
          fontSize: 40 * scale, fill: ink, align: 'center', verticalAlign: 'middle' } });
    }
    return option;
  }
  const horizontal = spec.type === 'barh';
  const labels = spec.labels.map(label => wrap(label, 14));
  const keys = spec.series.map((_, index) => `series-${index}`);
  if (spec.series.length > 1) {
    option.legend = { data: keys, left: '12%', top: '15%', selectedMode: false, icon: spec.type === 'line' ? undefined : 'rect',
      itemWidth: 28 * scale, itemHeight: 16 * scale, itemGap: 30 * scale,
      textStyle: { fontFamily, fontSize, color: ink }, formatter: key => spec.series[keys.indexOf(key)].name };
  }
  const maxLabel = Math.max(...labels.flatMap(label => label.split('\n').map(line => [...line].length)));
  const left = horizontal ? Math.max(spec.width * 0.12, maxLabel * fontSize + 45 * scale) : spec.width * 0.14;
  option.grid = { left, right: '8%', top: '26%', bottom: '24%', containLabel: false };
  const magnitude = Math.max(...spec.series.flatMap(item => item.values.filter(value => value !== null).map(Math.abs)));
  // Normalize extreme magnitudes before ECharts computes its axis intervals.
  const divisor = magnitude && (magnitude > 1e12 || magnitude < 1e-6) ? magnitude : 1;
  const allValues = spec.series.flatMap(item => item.values.filter(value => value !== null));
  const isLine = spec.type === 'line';
  const valueAxis = {
    type: 'value', name: horizontal ? spec.x_label : spec.y_label, nameLocation: 'middle',
    nameGap: (horizontal ? 65 : 110) * scale, nameTextStyle: { fontFamily, fontSize, color: ink },
    scale: isLine, splitNumber: 5,
    axisLabel: { fontFamily, fontSize, color: ink, margin: 14 * scale,
      formatter: value => formatValue(value * divisor, spec.unit) },
    axisLine: { show: true, lineStyle: { color: '#737373' } }, axisTick: { show: false },
    splitLine: { show: true, lineStyle: { color: '#d4d4d2' } },
    min: !isLine && allValues.every(value => value >= 0) ? 0 : undefined,
    max: !isLine && allValues.every(value => value <= 0) && allValues.some(value => value < 0) ? 0 : undefined,
  };
  const categoryAxis = {
    type: 'category', data: spec.labels.map((_, index) => String(index)),
    inverse: horizontal, boundaryGap: true,
    name: horizontal ? spec.y_label : spec.x_label, nameLocation: 'middle',
    nameGap: (horizontal ? maxLabel * fontSize / scale + 40 : 95) * scale,
    nameTextStyle: { fontFamily, fontSize, color: ink },
    axisLabel: { fontFamily, fontSize, color: ink, interval: 0, margin: 16 * scale,
      formatter: key => labels[Number(key)], rotate: !horizontal && labels.length > 8 ? 25 : 0 },
    axisLine: { show: true, lineStyle: { color: '#737373' } }, axisTick: { show: false },
  };
  option.xAxis = horizontal ? valueAxis : categoryAxis;
  option.yAxis = horizontal ? categoryAxis : valueAxis;
  option.series = spec.series.map((item, index) => ({
    type: isLine ? 'line' : 'bar', name: keys[index], silent: true, animation: false,
    data: item.values.map(value => ({ value: value === null ? null : value / divisor, rawValue: value,
      label: !isLine && !spec.stacked && value < 0 ? { position: horizontal ? 'left' : 'bottom' } : undefined })),
    stack: spec.stacked ? 'values' : undefined, stackStrategy: 'samesign',
    connectNulls: false, smooth: false, showSymbol: true, symbolSize: 12 * scale,
    symbol: ['circle', 'rect', 'triangle', 'diamond', 'roundRect', 'pin', 'arrow', 'circle'][index],
    lineStyle: { width: 4 * scale, type: ['solid', 'dashed', 'dotted'][index % 3], color: colors[index] },
    itemStyle: { color: colors[index], borderColor: ink, borderWidth: 0.6 * scale, decal: isLine ? undefined : decal(index) },
    barGap: '10%', barCategoryGap: '28%',
    label: { show: spec.show_values, fontFamily, fontSize: 25 * scale,
      color: spec.stacked && dark(colors[index]) ? paper : ink,
      position: spec.stacked ? 'inside' : horizontal ? 'right' : 'top',
      backgroundColor: spec.stacked ? colors[index] : undefined, padding: spec.stacked ? [2 * scale, 3 * scale] : 0,
      formatter: params => params.data.rawValue === null ? '' : formatValue(params.data.rawValue, spec.unit) },
    emphasis: { disabled: true },
  }));
  return option;
}

export function inspectLayout(chart, width, height) {
  const texts = [];
  const warnings = [];
  for (const element of chart.getZr().storage.getDisplayList()) {
    if (element.type !== 'tspan' || element.ignore || element.invisible || !element.style.text) continue;
    const box = element.getBoundingRect().clone();
    if (element.getComputedTransform()) box.applyTransform(element.getComputedTransform());
    if (box.x < -1 || box.y < -1 || box.x + box.width > width + 1 || box.y + box.height > height + 1) {
      warnings.push(`Text outside canvas; shorten text or change aspect ratio: ${String(element.style.text).slice(0, 60)}`);
    }
    texts.push({ box, text: String(element.style.text) });
  }
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i].box, b = texts[j].box;
      if (Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 2 &&
          Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 2) {
        warnings.push('Chart labels overlap; shorten labels, adjust dimensions or split the chart.');
      }
    }
  }
  return [...new Set(warnings)].slice(0, 5);
}

export async function render(input, output, requestedFont) {
  const spec = validateSpec(input);
  check(extname(output).toLowerCase() === '.png', 'Output must end in .png; keep input JSON/CSV for future edits.');
  check(existsSync(dirname(output)) && statSync(dirname(output)).isDirectory(), `Output directory does not exist: ${dirname(output)}`);
  check(!existsSync(output), `Output already exists: ${output}. Choose a new filename.`);
  const font = selectFont(spec, requestedFont);
  const canvas = createCanvas(spec.width, spec.height);
  const chart = echarts.init(canvas, null, { renderer: 'canvas', ssr: true, width: spec.width, height: spec.height, devicePixelRatio: 1 });
  try {
    chart.setOption(buildOption(spec, font.family));
    chart.getZr().refreshImmediately();
    const warnings = inspectLayout(chart, spec.width, spec.height);
    const buffer = await canvas.encode('png');
    check(buffer.readUInt32BE(16) === spec.width && buffer.readUInt32BE(20) === spec.height, 'Unexpected image dimensions.');
    writeFileSync(output, buffer, { flag: 'wx' });
    return { output: resolve(output), type: spec.type, theme: spec.theme, width: spec.width, height: spec.height,
      font: font.family, categories: spec.labels.length, series: spec.series.length, warnings };
  } finally { chart.dispose(); }
}

export async function main(args = process.argv.slice(2)) {
  try {
    const options = Object.fromEntries(['input', 'output', 'type', 'theme', 'title', 'x-label', 'y-label',
      'source', 'unit', 'width', 'height', 'font'].map(key => [key, { type: 'string' }]));
    for (const key of ['show-values', 'stacked', 'help']) options[key] = { type: 'boolean' };
    const { values } = parseArgs({ args, options, allowPositionals: false, strict: true });
    if (values.help) {
      console.log('node render-chart.mjs --input data.json|data.csv --output chart.png\n' +
        `Types: ${CHART_TYPES.join(', ')}\nThemes: ${Object.keys(THEMES).join(', ')}\n` +
        'Options: --type --theme --title --x-label --y-label --source --unit --width --height --font --show-values --stacked');
      return 0;
    }
    check(values.input && values.output, '--input and --output are required.');
    const spec = loadSpec(values.input);
    for (const [key, value] of Object.entries(values)) {
      const field = key.replaceAll('-', '_');
      if (!fields.has(field)) continue;
      if (['width', 'height'].includes(field)) {
        check(/^\d+$/.test(value), `${key} must be an integer.`);
        spec[field] = Number(value);
      } else spec[field] = value;
    }
    console.log(JSON.stringify(await render(spec, values.output, values.font)));
    return 0;
  } catch (error) {
    console.error(JSON.stringify({ error: String(error.message).slice(0, 1200) }));
    return 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main();
