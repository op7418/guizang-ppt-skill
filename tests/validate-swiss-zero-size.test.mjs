import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, test } from 'node:test';

// These are browser integration tests: install playwright and its Chromium first.
// The real CLI must run its rendered checks; a static-only pass is not sufficient.
const root = fileURLToPath(new URL('../', import.meta.url));
const validator = process.env.SWISS_VALIDATOR || path.join(root, 'scripts/validate-swiss-deck.mjs');
const template = await readFile(path.join(root, 'assets/template-swiss.html'), 'utf8');
const motionSource = await readFile(path.join(root, 'assets/motion.min.js'), 'utf8');
const motionUrl = `data:text/javascript;base64,${Buffer.from(motionSource).toString('base64')}`;
const styles = [...template.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((match) => match[1]).join('\n');
assert.ok(styles.includes('.h-bar-chart'), 'Fixtures must use the real Swiss CSS');
const directory = await mkdtemp(path.join(os.tmpdir(), 'swiss-zero-size-'));
after(() => rm(directory, { recursive: true, force: true }));
let fixtureIndex = 0;

const pixel = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20"%3E%3Crect width="20" height="20" fill="blue"/%3E%3C/svg%3E';
const slide = (content, id = 'fixture') => `<section class="slide light" data-layout="S07" data-slide-id="${id}"><div class="canvas-card"><h2 class="h-xl">Rendered chart</h2><div class="samples">${content}</div></div></section>`;
const track = (content, dimensions = 'width:300px;height:24px') => `<div class="sample" style="position:relative;${dimensions}">${content}</div>`;
const fill = (className, dimensions) => `<div class="${className}" style="display:block;background:var(--accent);${dimensions}"></div>`;

async function validate(slides, { css = '', script = '' } = {}) {
  const filename = path.join(directory, `fixture-${++fixtureIndex}.html`);
  await writeFile(filename, `<!doctype html><html><head><meta charset="utf-8"><style>${styles}\n.sample{margin-bottom:8px}.samples{margin-top:40px}${css}</style></head><body><main id="deck">${slides}</main><script>${script}</script></body></html>`);
  const result = await new Promise((resolve, reject) => {
    execFile(process.execPath, [validator, filename], {
      cwd: root,
      timeout: 45000,
      maxBuffer: 1024 * 1024,
    }, (error, stdout, stderr) => {
      if (error && typeof error.code !== 'number') return reject(error);
      resolve({ status: error?.code || 0, output: stdout + stderr });
    });
  });
  assert.doesNotMatch(result.output, /Rendered measurement skipped/, result.output);
  return result;
}

function passes(result) {
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /Swiss deck validation passed/, result.output);
  assert.doesNotMatch(result.output, /M3 zero-size/, result.output);
}

function failsFor(result, ...labels) {
  assert.equal(result.status, 1, result.output);
  const diagnostics = result.output.split('\n').filter((line) => line.includes('M3 zero-size'));
  assert.ok(diagnostics.length, result.output);
  for (const label of labels) {
    assert.ok(diagnostics.some((line) => line.includes(label)), `Missing zero-size diagnostic for ${label}:\n${result.output}`);
  }
  assert.ok(diagnostics.every((line) => /0(?:\.0+)?\s*(?:px|×|x)/.test(line)), result.output);
}

test('rejects the issue #48 grid-collapse reproduction with the upstream CSS', async () => {
  const result = await validate(slide(`
    <div class="h-bar-chart">
      <div class="bar-row" style="display:grid;grid-template-columns:15vw 1fr 8vw;gap:1vw">
        <span>Label</span>
        <div style="position:relative;height:2.4vh;background:var(--surface-1)">
          <div class="bar-fill" style="position:absolute;inset:0;width:64.8%;background:var(--accent)"></div>
        </div>
        <span class="mono">64.8</span>
      </div>
    </div>`));
  failsFor(result, '.bar-fill');
  assert.match(result.output, /Slide 1 \(S07\): M3 zero-size/);
});

test('rejects collapsed chart axes, vertical bars, and image slots', async () => {
  const result = await validate(slide([
    track(fill('row-fill', 'width:0%;height:24px'), 'width:0;height:24px'),
    track(fill('tl-axis', 'width:0;height:24px')),
    track(fill('bar-vert', 'width:24px;height:100%'), 'width:300px;height:0'),
    `<div class="frame-img sample" style="width:0;height:24px"><img src='${pixel}'></div>`,
    `<div class="sample" style="width:300px;height:0"><img data-image-slot="custom-evidence" src='${pixel}' style="width:100%;height:100%;display:block"></div>`,
  ].join('')), {
    script: `document.querySelector('.row-fill').animate([{width:'0%'},{width:'60%'}],{duration:200,delay:1400,fill:'forwards'});`,
  });
  failsFor(result, '.row-fill', '.tl-axis', '.bar-vert', 'img');
  assert.equal(result.output.split('\n').filter((line) => line.includes('M3 zero-size')).length, 5, result.output);
});

test('accepts healthy components and small positive bars without rounding to zero', async () => {
  passes(await validate(slide([
    track(fill('bar-fill', 'width:64.8%;height:24px')),
    track(fill('row-fill', 'width:0.1px;height:24px')),
    track(fill('tl-axis', 'width:1px;height:24px')),
    track(fill('bar-vert', 'width:24px;height:0.1px')),
    `<div class="frame-img sample" style="width:60px;height:24px"><img data-image-slot="custom-evidence" src='${pixel}'></div>`,
  ].join(''))));
});

test('accepts explicit zero data from inline styles, stylesheets, and CSS variables', async () => {
  passes(await validate(slide([
    track(fill('bar-fill', 'width:0%;height:24px')),
    track(fill('row-fill css-zero-horizontal', 'height:24px')),
    track(fill('bar-vert', 'width:24px;height:0px')),
    track(fill('bar-vert css-zero-vertical', 'width:24px')),
    track(fill('row-fill', 'width:calc(0% + 0px);height:24px')),
  ].join('')), { css: '.css-zero-horizontal{--datum:0%;width:var(--datum)}.css-zero-vertical{height:0%}' }));
});

test('does not exempt zero data with a collapsed parent or perpendicular dimension', async () => {
  const result = await validate(slide([
    track(fill('bar-fill', 'width:0%;height:24px'), 'width:0;height:24px'),
    track(fill('row-fill', 'width:0%;height:0')),
    track(fill('bar-vert', 'width:24px;height:0'), 'width:300px;height:0'),
  ].join('')));
  failsFor(result, '.bar-fill', '.row-fill', '.bar-vert');
});

test('ignores deliberately hidden components and unrelated zero-size decoration', async () => {
  const hidden = ['display:none', 'visibility:hidden', 'opacity:0', 'content-visibility:hidden']
    .map((style) => `<div style="${style}">${track(fill('bar-fill', 'width:60%;height:24px'), 'width:0;height:24px')}</div>`).join('');
  passes(await validate(slide(`${hidden}
    <div class="scope-hidden" style="display:none">${track(fill('bar-fill hidden-animated', 'width:60%;height:24px'))}</div>
    <div hidden>${fill('tl-axis', 'width:0;height:24px')}</div>
    <canvas class="ascii-bg" style="width:0;height:0"></canvas>
    <div class="grain" style="width:0;height:0"></div><div style="width:0;height:0"></div>
    ${track(fill('row-fill', 'width:50%;height:24px'))}`), {
    script: `document.querySelector('.hidden-animated').animate([{width:'0%'},{width:'60%'}],{duration:20000});`,
  }));
});

test('waits for delayed finite entry animations without waiting for infinite decoration', async () => {
  passes(await validate(slide([
    track(fill('bar-fill waapi-grow', 'width:60%;height:24px')),
    track(fill('row-fill waapi-width', 'width:0%;height:24px')),
    track(fill('bar-vert css-grow', 'width:24px;height:24px')),
    '<div class="grain spinning" style="width:0;height:0"></div>',
    '<div class="grain finite-decoration" style="width:0;height:0"></div>',
  ].join('')), {
    css: '@keyframes rise{from{transform:scaleY(0)}to{transform:scaleY(1)}}.css-grow{animation:rise .2s 1.4s both;transform-origin:bottom}@keyframes spin{to{transform:rotate(360deg)}}.spinning{animation:spin 1s infinite}',
    script: `document.querySelector('.waapi-grow').animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:200,delay:1400,fill:'both'});document.querySelector('.waapi-width').animate([{width:'0%'},{width:'60%'}],{duration:200,delay:1400,fill:'both'});document.querySelector('.finite-decoration').animate([{opacity:0},{opacity:1}],{duration:20000});`,
  }));
});

test('activates future slides before checking their settled component sizes', async () => {
  const result = await validate(
    slide(track(fill('bar-fill', 'width:50%;height:24px')), 'first') +
    slide(track(fill('row-fill', 'width:60%;height:24px'), 'width:0;height:24px'), 'second'),
    {
      css: '.slide:not(.active){display:none}',
      script: `window.go=(index)=>{document.querySelectorAll('section.slide').forEach((slide,i)=>slide.classList.toggle('active',i===index));window.__currentSlideIndex=index;};window.go(0);`,
    },
  );
  failsFor(result, '.row-fill');
  assert.match(result.output, /Slide 2 \(S07\): M3 zero-size/);
  assert.doesNotMatch(result.output, /Slide 1 \(S07\): M3 zero-size/);
});

test('measures the completed width updates from the bundled Motion engine', async () => {
  const result = await validate(slide([
    track(fill('row-fill', 'width:0%;height:24px')),
    track(fill('tl-axis grows', 'width:0%;height:24px')),
    track(fill('tl-axis collapses', 'width:40px;height:24px')),
  ].join('')).replace('data-layout="S07"', 'data-layout="S07" data-animate="bar-grow"'), {
    script: `(async()=>{
      const {animate}=await import(${JSON.stringify(motionUrl)});
      document.body.classList.add('motion-ready');
      for(const node of document.querySelectorAll('.row-fill,.grows')){
        const target='60%';node.style.width='0%';
        animate(node,{width:['0%',target]},{duration:.2,delay:1.4});
      }
      animate(document.querySelector('.collapses'),{width:['40px','0px']},{duration:.2,delay:1.4});
    })();`,
  });
  // Before Motion finishes, .grows is zero and .collapses is healthy. Requiring
  // the reverse proves the bundled script ran and the CLI observed its endpoint.
  failsFor(result, '.tl-axis.collapses');
  assert.doesNotMatch(result.output, /M3 zero-size[^\n]*(?:\.grows|\.row-fill)/, result.output);
});

test('reports an error instead of passing an unsettled finite animation', async () => {
  const result = await validate(slide(track(fill('bar-fill', 'width:60%;height:24px'))), {
    script: `document.querySelector('.bar-fill').animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:20000,fill:'both'});`,
  });
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /M3 size checks could not settle within 10s/, result.output);
  assert.doesNotMatch(result.output, /Swiss deck validation passed/, result.output);
});

test('waits for a delayed image to acquire its intrinsic height', async () => {
  const timers = new Set();
  let responses = 0;
  const server = createServer((request, response) => {
    if (request.url !== '/delayed.svg') {
      response.writeHead(404).end();
      return;
    }
    const timer = setTimeout(() => {
      timers.delete(timer);
      responses++;
      response.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' });
      response.end('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80"><rect width="160" height="80" fill="blue"/></svg>');
    }, 1800);
    timers.add(timer);
    response.once('close', () => { clearTimeout(timer); timers.delete(timer); });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const source = `http://127.0.0.1:${server.address().port}/delayed.svg`;
    passes(await validate(slide(`
      <div class="frame-img sample" style="width:160px"><img data-image-slot="delayed-evidence" src="${source}" style="height:auto"></div>
      ${track(fill('tl-axis load-proof', 'width:0;height:24px'))}`), {
      script: `document.querySelector('img').addEventListener('load',()=>{document.querySelector('.load-proof').style.width='40px';},{once:true});`,
    }));
    assert.equal(responses, 1, 'The browser must actually load the delayed local image');
  } finally {
    for (const timer of timers) clearTimeout(timer);
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeAllConnections();
    });
  }
});
