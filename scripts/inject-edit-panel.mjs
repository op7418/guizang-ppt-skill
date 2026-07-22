// 将 WYSIWYG 编辑面板注入生成的 HTML 文件
// 用法: node scripts/inject-edit-panel.mjs <path/to/index.html>

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(__dirname, '..');

const htmlPath = process.argv[2];
if (!htmlPath) {
  console.error('用法: node scripts/inject-edit-panel.mjs <path/to/index.html>');
  process.exit(1);
}

let html = readFileSync(htmlPath, 'utf8');

// 检测模板类型: Style B (Swiss) 有 --accent 或 data-layout, Style A (Magazine) 有 --ink-tint
const isStyleB = html.includes('--accent') || html.includes('data-layout');

// 读取对应资源
const cssFile = isStyleB ? 'assets/edit-panel/style-b.css' : 'assets/edit-panel/style-a.css';
const css = readFileSync(resolve(skillRoot, cssFile), 'utf8');
const panelHtml = readFileSync(resolve(skillRoot, 'assets/edit-panel/panel.html'), 'utf8');
const js = readFileSync(resolve(skillRoot, 'assets/edit-panel/editor.js'), 'utf8');

// 替换标记
html = html.replace('/* @edit-panel-css */', css);
html = html.replace('<!-- @edit-panel -->', panelHtml);
html = html.replace('<!-- @edit-panel-js -->', '<script>\n' + js + '\n</script>');
html = html.replace('← → 翻页 · B 静态 · ESC 索引', '← → 翻页 · E 编辑 · B 静态 · ESC 索引');

writeFileSync(htmlPath, html, 'utf8');
console.log('✅ 编辑面板已注入: ' + htmlPath + ' (Style ' + (isStyleB ? 'B' : 'A') + ')');
