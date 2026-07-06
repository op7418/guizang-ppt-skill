(function(){
  'use strict';

  // ============ 模板类型检测 ============
  var csRoot = getComputedStyle(document.documentElement);
  var isStyleA = !!csRoot.getPropertyValue('--ink-tint').trim(); // Magazine has --ink-tint, Swiss doesn't

  // ============ 状态 ============
  var editMode = false;
  var selectedEl = null;
  var editedStyles = new Map();
  var root = document.documentElement;

  // 存储原始 CSS 变量值
  var rootVarNames = isStyleA
    ? ['--ink','--ink-rgb','--paper','--paper-rgb','--paper-tint','--ink-tint']
    : ['--accent','--accent-rgb','--accent-on','--accent-bright','--paper','--paper-rgb','--ink','--ink-rgb','--grey-1','--grey-2','--grey-3'];
  var origRootVars = {};
  rootVarNames.forEach(function(v){ origRootVars[v] = csRoot.getPropertyValue(v).trim(); });

  function cssToJs(p){ return p.replace(/-([a-z])/g, function(_,c){ return c.toUpperCase(); }); }

  // ============ 属性组 ============
  var PROP_GROUPS = [
    { name: '位置 / 尺寸', props: [
      {css:'margin-top',label:'上外边距',unit:'px',min:0,max:300,step:1},
      {css:'margin-bottom',label:'下外边距',unit:'px',min:0,max:300,step:1},
      {css:'margin-left',label:'左外边距',unit:'px',min:0,max:300,step:1},
      {css:'margin-right',label:'右外边距',unit:'px',min:0,max:300,step:1},
      {css:'padding-top',label:'上内边距',unit:'px',min:0,max:200,step:1},
      {css:'padding-bottom',label:'下内边距',unit:'px',min:0,max:200,step:1},
      {css:'padding-left',label:'左内边距',unit:'px',min:0,max:200,step:1},
      {css:'padding-right',label:'右内边距',unit:'px',min:0,max:200,step:1},
      {css:'width',label:'宽度',unit:'px',min:0,max:1200,step:1},
      {css:'max-width',label:'最大宽度',unit:'px',min:0,max:1200,step:1},
      {css:'height',label:'高度',unit:'px',min:0,max:1200,step:1},
      {css:'gap',label:'间距',unit:'px',min:0,max:200,step:1}
    ]},
    { name: '文字', props: [
      {css:'font-size',label:'字号',unit:'px',min:8,max:300,step:1},
      {css:'line-height',label:'行高',unit:'',min:0.8,max:3,step:0.05},
      {css:'letter-spacing',label:'字间距',unit:'em',min:-0.1,max:0.5,step:0.01},
      {css:'font-weight',label:'字重',unit:'',min:100,max:900,step:100},
      {css:'color',label:'文字颜色',type:'color'},
      {css:'text-align',label:'对齐',type:'select',opts:['left','center','right','justify']}
    ]},
    { name: '背景 / 边框', props: [
      {css:'background-color',label:'背景色',type:'color'},
      {css:'opacity',label:'不透明度',unit:'',min:0,max:1,step:0.05},
      {css:'border-width',label:'边框宽度',unit:'px',min:0,max:40,step:1},
      {css:'border-radius',label:'圆角',unit:'px',min:0,max:100,step:1},
      {css:'border-color',label:'边框颜色',type:'color'}
    ]},
    { name: '布局', props: [
      {css:'flex-direction',label:'方向',type:'select',opts:['row','row-reverse','column','column-reverse']},
      {css:'align-items',label:'交叉轴对齐',type:'select',opts:['stretch','flex-start','flex-end','center','baseline']},
      {css:'justify-content',label:'主轴对齐',type:'select',opts:['flex-start','flex-end','center','space-between','space-around','space-evenly']}
    ]}
  ];

  // ============ DOM 引用 ============
  var panel = document.getElementById('edit-panel');
  var floatBtn = document.getElementById('edit-float-btn');
  var elSection = document.getElementById('ep-el-section');
  var elTag = document.getElementById('ep-el-tag');
  var propsContainer = document.getElementById('ep-props');

  // ============ 编辑模式切换 ============
  function toggleEditMode() {
    editMode = !editMode;
    document.body.classList.toggle('edit-mode', editMode);
    if (!editMode) clearSelection();
    updateFloatBtn();
  }
  function updateFloatBtn(){ floatBtn.style.opacity = editMode ? '.85' : ''; }

  // ============ 元素选择 ============
  function clearSelection() {
    if (selectedEl){ selectedEl.classList.remove('selected'); selectedEl = null; }
    elSection.style.display = 'none';
    propsContainer.innerHTML = '';
  }

  function selectElement(el) {
    if (selectedEl === el) return;
    clearSelection();
    selectedEl = el;
    el.classList.add('selected');
    var tag = el.tagName.toLowerCase();
    var cls = Array.from(el.classList).filter(function(c){ return c !== 'selected'; }).slice(0,3).join('.');
    elTag.textContent = '<' + tag + '>' + (cls ? ' .' + cls : '');
    elSection.style.display = 'flex';
    buildPropertyEditors(el);
  }

  // ============ 构建属性编辑器 ============
  function buildPropertyEditors(el) {
    propsContainer.innerHTML = '';
    var cs = getComputedStyle(el);
    var inline = el.style;

    // 文字内容编辑
    var rawText = el.textContent;
    if (rawText && rawText.trim()) {
      var hasKids = el.children.length > 0;
      var tw = document.createElement('div');
      tw.style.cssText = 'margin-bottom:12px';
      var tl = document.createElement('span');
      tl.style.cssText = 'font-family:var(--mono);font-size:10px;letter-spacing:.1em;display:block;margin-bottom:4px';
      tl.style.color = isStyleA ? 'rgba(var(--paper-rgb),.45)' : 'var(--text-helper)';
      tl.textContent = '文字内容' + (hasKids ? ' (含子元素，修改将替换结构)' : '');
      tw.appendChild(tl);
      var ta = document.createElement('textarea');
      ta.rows = Math.min(8, Math.max(2, (rawText.match(/\n/g)||[]).length + 1));
      ta.value = el.textContent;
      ta.addEventListener('input', function(){ el.textContent = ta.value; });
      tw.appendChild(ta);
      propsContainer.appendChild(tw);
    }

    PROP_GROUPS.forEach(function(group){
      var details = document.createElement('details');
      details.className = 'ep-group';
      if (group.name === '位置 / 尺寸') details.open = true;
      var summary = document.createElement('summary');
      summary.textContent = group.name;
      details.appendChild(summary);
      var content = document.createElement('div');
      content.style.cssText = 'display:flex;flex-direction:column;gap:6px';
      group.props.forEach(function(pd){
        var row = createPropRow(el, pd, cs, inline);
        if (row) content.appendChild(row);
      });
      details.appendChild(content);
      propsContainer.appendChild(details);
    });

    // 自定义 CSS
    var cd = document.createElement('details');
    cd.className = 'ep-group';
    cd.innerHTML = '<summary>自定义 CSS</summary>';
    var cc = document.createElement('div');
    cc.style.cssText = 'display:flex;flex-direction:column;gap:8px';
    var cta = document.createElement('textarea');
    cta.rows = 3;
    cta.placeholder = '例如: box-shadow: 0 2px 8px rgba(0,0,0,.2);\n直接写 CSS 属性: 值; 即可';
    cc.appendChild(cta);
    var ab = document.createElement('button');
    ab.textContent = '应用';
    ab.style.cssText = 'padding:6px 12px;font-size:11px;border:1px solid;background:transparent;cursor:pointer;align-self:flex-end';
    ab.style.borderColor = isStyleA ? 'rgba(var(--paper-rgb),.15)' : 'var(--border-subtle)';
    ab.style.color = isStyleA ? 'rgba(var(--paper-rgb),.55)' : 'var(--text-secondary)';
    ab.onclick = function(){
      var text = cta.value.trim();
      if (!text) return;
      text.split(';').forEach(function(rule){
        var ci = rule.indexOf(':');
        if (ci === -1) return;
        var prop = rule.substring(0, ci).trim();
        var val = rule.substring(ci + 1).trim();
        if (prop && val) applyProperty(el, prop, val);
      });
      buildPropertyEditors(el);
    };
    cc.appendChild(ab);
    cd.appendChild(cc);
    propsContainer.appendChild(cd);
  }

  function createPropRow(el, pd, cs, inline) {
    var jsProp = cssToJs(pd.css);
    var currentVal = inline[jsProp] || cs.getPropertyValue(pd.css);

    if (pd.type === 'color') {
      var row = document.createElement('div'); row.className = 'ep-row';
      var lbl = document.createElement('span'); lbl.className = 'ep-label'; lbl.textContent = pd.label;
      var inp = document.createElement('input'); inp.type = 'color'; inp.value = rgbToHex(currentVal);
      var vs = document.createElement('span'); vs.className = 'ep-val'; vs.textContent = inp.value;
      inp.addEventListener('input', function(){ vs.textContent = inp.value; applyProperty(el, pd.css, inp.value); });
      var rb = document.createElement('button'); rb.className = 'nudge'; rb.textContent = '↺'; rb.title = '重置';
      rb.onclick = function(){ applyProperty(el, pd.css, ''); inp.value = rgbToHex(cs.getPropertyValue(pd.css)); vs.textContent = inp.value; };
      row.appendChild(lbl); row.appendChild(inp); row.appendChild(vs); row.appendChild(rb);
      return row;
    }

    if (pd.type === 'select') {
      var row = document.createElement('div'); row.className = 'ep-row';
      var lbl = document.createElement('span'); lbl.className = 'ep-label'; lbl.textContent = pd.label;
      var sel = document.createElement('select');
      pd.opts.forEach(function(o){
        var opt = document.createElement('option'); opt.value = o; opt.textContent = o;
        if (currentVal === o) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function(){ applyProperty(el, pd.css, sel.value); });
      var rb = document.createElement('button'); rb.className = 'nudge'; rb.textContent = '↺'; rb.title = '重置';
      rb.onclick = function(){ applyProperty(el, pd.css, ''); var rv = cs.getPropertyValue(pd.css); if (rv) sel.value = rv; };
      row.appendChild(lbl); row.appendChild(sel); row.appendChild(rb);
      return row;
    }

    // Numeric
    var numVal = parseFloat(currentVal);
    if (isNaN(numVal)) return null;

    var row = document.createElement('div'); row.className = 'ep-row';
    var lbl = document.createElement('span'); lbl.className = 'ep-label'; lbl.textContent = pd.label;
    var mb = document.createElement('button'); mb.className = 'nudge'; mb.textContent = '−';
    var slider = document.createElement('input'); slider.type = 'range';
    slider.min = pd.min; slider.max = pd.max; slider.step = pd.step;
    slider.value = Math.min(pd.max, Math.max(pd.min, numVal));
    var pb = document.createElement('button'); pb.className = 'nudge'; pb.textContent = '+';
    var vs = document.createElement('span'); vs.className = 'ep-val';
    var displayVal = pd.step < 1 ? numVal.toFixed(2) : Math.round(numVal);
    vs.textContent = displayVal + (pd.unit || '');
    var rb = document.createElement('button'); rb.className = 'nudge'; rb.textContent = '↺'; rb.title = '重置';

    function onChange(){
      var v = parseFloat(slider.value);
      var dv = pd.step < 1 ? v.toFixed(2) : Math.round(v);
      vs.textContent = dv + (pd.unit || '');
      applyProperty(el, pd.css, v + (pd.unit || ''));
    }
    slider.addEventListener('input', onChange);
    mb.onclick = function(){ slider.value = Math.max(pd.min, parseFloat(slider.value) - pd.step); onChange(); };
    pb.onclick = function(){ slider.value = Math.min(pd.max, parseFloat(slider.value) + pd.step); onChange(); };
    rb.onclick = function(){
      applyProperty(el, pd.css, '');
      var rv = parseFloat(cs.getPropertyValue(pd.css));
      if (!isNaN(rv)){ slider.value = Math.min(pd.max, Math.max(pd.min, rv)); onChange(); }
    };
    row.appendChild(lbl); row.appendChild(mb); row.appendChild(slider); row.appendChild(pb); row.appendChild(vs); row.appendChild(rb);
    return row;
  }

  // ============ 属性读写 ============
  function applyProperty(el, cssProp, value) {
    var jsProp = cssToJs(cssProp);
    if (!editedStyles.has(el)) editedStyles.set(el, {});
    var orig = editedStyles.get(el);
    if (!(jsProp in orig)) orig[jsProp] = el.style[jsProp];
    el.style[jsProp] = (value === '' || value === null) ? orig[jsProp] : value;
  }

  function rgbToHex(color) {
    if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return '#000000';
    if (color[0] === '#') {
      if (color.length === 7) return color;
      if (color.length === 4) return '#' + color[1]+color[1]+color[2]+color[2]+color[3]+color[3];
      return color;
    }
    var m = color.match(/[\d.]+/g);
    if (!m || m.length < 3) return '#000000';
    return '#' + [parseInt(m[0]), parseInt(m[1]), parseInt(m[2])].map(function(v){ return v.toString(16).padStart(2,'0'); }).join('');
  }

  // ============ 全局: 主题切换 ============
  (function(){
    var themes = isStyleA ? {
      ink:    {vars:{'--ink':'#0a0a0b','--ink-rgb':'10,10,11','--paper':'#f1efea','--paper-rgb':'241,239,234','--paper-tint':'#e8e5de','--ink-tint':'#18181a'}, label:'🖋 墨水经典'},
      indigo: {vars:{'--ink':'#0a1f3d','--ink-rgb':'10,31,61','--paper':'#f1f3f5','--paper-rgb':'241,243,245','--paper-tint':'#e4e8ec','--ink-tint':'#152a4a'}, label:'🌊 靛蓝瓷'},
      forest: {vars:{'--ink':'#1a2e1f','--ink-rgb':'26,46,31','--paper':'#f5f1e8','--paper-rgb':'245,241,232','--paper-tint':'#ece7da','--ink-tint':'#253d2c'}, label:'🌿 森林墨'},
      kraft:  {vars:{'--ink':'#2a1e13','--ink-rgb':'42,30,19','--paper':'#eedfc7','--paper-rgb':'238,223,199','--paper-tint':'#e0d0b6','--ink-tint':'#3a2a1d'}, label:'🍂 牛皮纸'},
      dune:   {vars:{'--ink':'#1f1a14','--ink-rgb':'31,26,20','--paper':'#f0e6d2','--paper-rgb':'240,230,210','--paper-tint':'#e3d7bf','--ink-tint':'#2d2620'}, label:'🌙 沙丘'}
    } : {
      ikb:    {vars:{'--accent':'#002FA7','--accent-rgb':'0,47,167','--accent-bright':'#5B7BFF','--accent-on':'#ffffff'}, label:'🔵 IKB 克莱因蓝'},
      lemon:  {vars:{'--accent':'#E8C300','--accent-rgb':'232,195,0','--accent-bright':'#FFD940','--accent-on':'#0a0a0a'}, label:'🟡 柠檬黄'},
      lime:   {vars:{'--accent':'#A3E635','--accent-rgb':'163,230,53','--accent-bright':'#BEF264','--accent-on':'#0a0a0a'}, label:'🟢 柠檬绿'},
      orange: {vars:{'--accent':'#FF6B35','--accent-rgb':'255,107,53','--accent-bright':'#FF8C60','--accent-on':'#ffffff'}, label:'🟠 安全橙'}
    };
    var sel = document.getElementById('ep-theme');
    Object.keys(themes).forEach(function(k){
      var o = document.createElement('option');
      o.value = k; o.textContent = themes[k].label;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function(){
      var t = themes[sel.value];
      if (!t) return;
      Object.keys(t.vars).forEach(function(p){ root.style.setProperty(p, t.vars[p]); });
    });
  })();

  // 整体缩放
  document.getElementById('ep-zoom').addEventListener('input', function(){
    var v = parseFloat(this.value);
    document.getElementById('ep-zoom-val').textContent = v.toFixed(2) + 'x';
    root.style.zoom = v;
  });

  // 间距档位 (仅 Style B Swiss 有效)
  if (!isStyleA) {
    var presets = {
      compact: {'--sp-3':'4px','--sp-4':'8px','--sp-5':'12px','--sp-6':'16px','--sp-7':'24px','--sp-8':'32px','--sp-9':'40px','--sp-10':'48px','--sp-11':'64px','--sp-12':'80px','--sp-13':'128px'},
      normal:  {'--sp-3':'8px','--sp-4':'12px','--sp-5':'16px','--sp-6':'24px','--sp-7':'32px','--sp-8':'40px','--sp-9':'48px','--sp-10':'64px','--sp-11':'80px','--sp-12':'96px','--sp-13':'160px'},
      loose:   {'--sp-3':'12px','--sp-4':'16px','--sp-5':'24px','--sp-6':'32px','--sp-7':'48px','--sp-8':'56px','--sp-9':'64px','--sp-10':'80px','--sp-11':'104px','--sp-12':'128px','--sp-13':'200px'}
    };
    document.getElementById('ep-spacing').addEventListener('change', function(){
      var p = presets[this.value];
      if (!p) return;
      Object.keys(p).forEach(function(k){ root.style.setProperty(k, p[k]); });
    });
  } else {
    document.getElementById('ep-spacing-row').style.display = 'none';
  }

  // ============ 导出 ============
  document.getElementById('ep-download').addEventListener('click', function(){
    var wasEdit = editMode;
    panel.style.display = 'none';
    floatBtn.style.display = 'none';
    document.body.classList.remove('edit-mode');
    document.querySelectorAll('.selected').forEach(function(el){ el.classList.remove('selected'); });

    var html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

    panel.style.display = '';
    floatBtn.style.display = '';
    if (wasEdit) document.body.classList.add('edit-mode');
    if (selectedEl) selectedEl.classList.add('selected');

    var blob = new Blob([html], {type: 'text/html;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'index.html';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ============ 重置 ============
  document.getElementById('ep-reset').addEventListener('click', function(){
    if (confirm('确定要重置所有修改吗？页面将刷新回到初始状态。')) location.reload();
  });

  // ============ 退出 ============
  document.getElementById('ep-exit').addEventListener('click', toggleEditMode);
  document.querySelector('#edit-panel .ep-close').addEventListener('click', toggleEditMode);
  floatBtn.addEventListener('click', toggleEditMode);

  // 清除单元素修改
  document.getElementById('ep-clear-styles').addEventListener('click', function(){
    if (!selectedEl) return;
    if (editedStyles.has(selectedEl)) {
      var orig = editedStyles.get(selectedEl);
      Object.keys(orig).forEach(function(p){ selectedEl.style[p] = orig[p]; });
      editedStyles.delete(selectedEl);
    }
    buildPropertyEditors(selectedEl);
  });

  // ============ 点击选中 ============
  document.addEventListener('click', function(e){
    if (!editMode) return;
    if (panel.contains(e.target)) return;
    if (floatBtn.contains(e.target)) return;
    if (e.target.closest('#nav')) return;
    var ov = document.getElementById('overview');
    if (ov && ov.style.display === 'block') return;
    if (e.target.tagName === 'CANVAS') return;
    var slide = e.target.closest('.slide');
    if (!slide) return;
    if (e.target === slide) return;
    e.preventDefault();
    e.stopPropagation();
    selectElement(e.target);
  }, true);

  // ============ E 键切换 ============
  addEventListener('keydown', function(e){
    if (e.key && e.key.toLowerCase() === 'e' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var tag = (e.target.tagName || '');
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      var ov = document.getElementById('overview');
      if (ov && ov.style.display === 'block') return;
      e.preventDefault();
      toggleEditMode();
    }
  });

  updateFloatBtn();
})();
