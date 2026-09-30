import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import vm from 'node:vm';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const validator=join(root,'scripts/validate-presenter-mode.mjs');
const locales={
  Chinese:{start:'开始计时',reset:'重置计时',resume:'继续计时',pause:'暂停'},
  English:{start:'Start',reset:'Reset',resume:'Resume',pause:'Pause'},
  French:{start:'Démarrer',reset:'Réinitialiser',resume:'Reprendre',pause:'Pause'},
};
const templates=['template.html','template-swiss.html'].map(name=>{
  let html=readFileSync(join(root,'assets',name),'utf8');
  if(!/<section\b[^>]*class="[^"]*\bslide\b/.test(html.replace(/<!--[\s\S]*?-->/g,''))){
    html=html.replace('<!-- SLIDES_HERE -->','<section class="slide" data-slide-id="timer-test"><h1>Timer test</h1></section>');
    html=html.replace(/const SPEAKER_NOTES = \[[\s\S]*?\];/,`const SPEAKER_NOTES = [{
      id:'timer-test',title:'Timer test',purpose:'Check presenter controls',
      talk:['Start the timer','Pause and resume','Reset the timer'],transition:'Finish',minutes:1
    }];`);
  }
  return {name,html};
});

function localize(html,labels){
  return html.replaceAll('开始计时',labels.start).replaceAll('重置计时',labels.reset)
    .replaceAll('继续计时',labels.resume).replace("timerRunning?'暂停'",`timerRunning?'${labels.pause}'`);
}

function validate(html){
  const directory=mkdtempSync(join(tmpdir(),'presenter-validator-'));
  try{
    const file=join(directory,'index.html');
    writeFileSync(file,html);
    const result=spawnSync(process.execPath,[validator,file],{encoding:'utf8'});
    assert.ifError(result.error);
    return {status:result.status,output:result.stdout+result.stderr};
  }finally{rmSync(directory,{recursive:true,force:true});}
}

function changeButton(html,id,change){
  const pattern=new RegExp(`<button\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?<\\/button>`);
  assert.match(html,pattern);
  return html.replace(pattern,change);
}

for(const {name,html} of templates){
  for(const [locale,labels] of Object.entries(locales)){
    test(`${name}: ${locale} timer labels pass validation`,()=>{
      const result=validate(localize(html,labels));
      assert.equal(result.status,0,result.output);
      assert.match(result.output,/0 errors/);
    });
  }

  for(const [id,description] of [['ppt-timer-toggle','toggle'],['ppt-timer-reset','reset']]){
    for(const [variant,change] of [
      ['missing',()=> ''],
      ['commented out',button=>`<!-- ${button} -->`],
      ['non-button',button=>button.replaceAll('button','div')],
      ['whitespace-only',button=>button.replace(/>[^<]*<\/button>$/,'> \t <\/button>')],
      ['whitespace entities',button=>button.replace(/>[^<]*<\/button>$/,'>&nbsp;&#32;&#x09;</button>')],
      ['empty nested label',button=>button.replace(/>[^<]*<\/button>$/,'><span> </span></button>')],
      ['hidden text',button=>button.replace(/>([^<]*)<\/button>$/,'><span aria-hidden="true">$1</span></button>')],
      ['nested hidden text',button=>button.replace(/>([^<]*)<\/button>$/,'><span aria-hidden="true"><span>icon</span>$1</span></button>')],
      ['hidden button',button=>button.replace('<button ','<button hidden ')],
      ['empty referenced label',button=>`<span id="${id}-empty"> </span>`+button.replace('<button ',`<button aria-labelledby="${id}-empty" `)],
    ]){
      test(`${name}: ${variant} ${description} is rejected`,()=>{
        const result=validate(changeButton(html,id,change));
        assert.equal(result.status,1,result.output);
        assert.ok(result.output.includes(`Presenter timer ${description} missing or unlabelled.`),result.output);
      });
    }
    for(const [variant,change] of [
      ['nested text',button=>button.replace(/>([^<]*)<\/button>$/,'><span>$1</span></button>')],
      ['aria-label',button=>button.replace(/>([^<]*)<\/button>$/,' aria-label="$1"></button>')],
      ['aria-labelledby',button=>`<span id="${id}-name">Timer action</span>`+button.replace(/>[^<]*<\/button>$/,` aria-labelledby="${id}-name"></button>`)],
      ['title',button=>button.replace(/>([^<]*)<\/button>$/,' title="$1"></button>')],
    ]){
      test(`${name}: ${variant} labels the ${description}`,()=>{
        const result=validate(changeButton(localize(html,locales.English),id,change));
        assert.equal(result.status,0,result.output);
      });
    }
    test(`${name}: disconnected ${description} is rejected`,()=>{
      const handler=description==='toggle'?'toggleTimer':'resetTimer';
      const disconnected=html.replace(`document.getElementById('${id}').onclick=${handler};`,'');
      assert.notEqual(disconnected,html);
      const result=validate(disconnected);
      assert.equal(result.status,1,result.output);
      assert.ok(result.output.includes(`Presenter timer ${description} must be wired to ${handler}.`),result.output);
    });
    test(`${name}: ${description} accepts a click event listener`,()=>{
      const handler=description==='toggle'?'toggleTimer':'resetTimer';
      const connected=html.replace(
        `document.getElementById('${id}').onclick=${handler};`,
        `document.getElementById('${id}').addEventListener('click', ${handler});`,
      );
      assert.notEqual(connected,html);
      const result=validate(connected);
      assert.equal(result.status,0,result.output);
    });
  }

  for(const label of ['暂停','继续计时','开始计时']){
    test(`${name}: empty runtime ${label} label is rejected`,()=>{
      const result=validate(html.replace(`'${label}'`,"' '"));
      assert.equal(result.status,1,result.output);
      assert.ok(result.output.includes('Presenter timer state labels must be non-empty.'),result.output);
    });
  }
  test(`${name}: a fixed runtime label is rejected`,()=>{
    const result=validate(html.replace("timerRunning?'暂停':(totalUsed?'继续计时':'开始计时')","'Start'"));
    assert.equal(result.status,1,result.output);
    assert.ok(result.output.includes('Presenter timer label must reflect running, paused and initial states.'),result.output);
  });
  test(`${name}: an invisible escaped runtime label is rejected`,()=>{
    const result=validate(html.replace("'继续计时'","'\\u200b'"));
    assert.equal(result.status,1,result.output);
    assert.ok(result.output.includes('Presenter timer state labels must be non-empty.'),result.output);
  });
  test(`${name}: a semicolon within a runtime label is accepted`,()=>{
    const localized=localize(html,{...locales.English,pause:'Pause; timer running'});
    const result=validate(localized);
    assert.equal(result.status,0,result.output);
    const {timer,label}=loadTimer(localized);
    timer.toggleTimer();
    assert.equal(label(),'Pause; timer running');
  });
  test(`${name}: runtime labels can come from a translation dictionary`,()=>{
    const translated=localize(html,locales.English).replace(
      'const timerButton=document.getElementById',
      'const timerLabels={start:"Start",pause:"Pause",resume:"Resume"};const timerButton=document.getElementById',
    ).replace("timerRunning?'Pause':(totalUsed?'Resume':'Start')",'timerRunning?timerLabels.pause:(totalUsed?timerLabels.resume:timerLabels.start)');
    const result=validate(translated);
    assert.equal(result.status,0,result.output);
    const {timer,advance,label}=loadTimer(translated);
    timer.renderTimer();
    assert.equal(label(),'Start');
    timer.toggleTimer();
    assert.equal(label(),'Pause');
    advance(1000);
    timer.toggleTimer();
    assert.equal(label(),'Resume');
  });
}

// Execute the template's complete presenter closure. Only expose its existing timer
// functions for the test; no timer implementation is copied into the harness.
function loadTimer(html){
  const start=html.indexOf('window.__pptPresenter=(()=>{');
  const end=html.indexOf('\n})();',start);
  assert.ok(start>=0&&end>start,'Presenter runtime boundaries must exist');
  let source=html.slice(start,end+'\n})();'.length);
  assert.ok(source.includes('return{initMode,'),'Presenter runtime API must exist');
  source=source.replace('return{initMode,','return{toggleTimer,resetTimer,renderTimer,currentElapsed,currentSlideElapsed,initMode,');
  const elements=new Map(['ppt-timer-toggle','ppt-clock','ppt-slide-clock'].map(id=>[id,{textContent:''}]));
  let now=10000;
  class FakeDate extends Date{static now(){return now;}}
  const context={
    window:{__SPEAKER_NOTES__:[{id:'timer-test'}]},
    document:{title:'Timer test',getElementById:id=>elements.get(id)||null},
    location:{search:'',pathname:'/timer-test'},
    localStorage:{getItem:()=>null},
    slides:[{dataset:{slideId:'timer-test'}}],idx:0,total:1,
    URLSearchParams,Date:FakeDate,setInterval:()=>0,
  };
  vm.runInNewContext(source,context,{timeout:1000});
  return {
    timer:context.window.__pptPresenter,
    advance:milliseconds=>{now+=milliseconds;},
    label:()=>elements.get('ppt-timer-toggle').textContent,
    clock:()=>elements.get('ppt-clock').textContent,
  };
}

for(const {name,html} of templates){
  for(const [locale,labels] of Object.entries(locales)){
    test(`${name}: ${locale} timer starts, pauses, resumes and resets`,()=>{
      const {timer,advance,label,clock}=loadTimer(localize(html,labels));
      function expectState(running,elapsed,expectedLabel){
        timer.renderTimer();
        assert.equal(timer.debugState().timerRunning,running);
        assert.equal(timer.currentElapsed(),elapsed);
        assert.equal(timer.currentSlideElapsed(),elapsed);
        assert.ok(label().trim(),'Every timer state needs a nonempty label');
        assert.equal(label(),expectedLabel);
      }
      expectState(false,0,labels.start);
      timer.toggleTimer();
      advance(2500);
      expectState(true,2500,labels.pause);
      assert.equal(clock(),'00:02');
      timer.toggleTimer();
      expectState(false,2500,labels.resume);
      advance(7000);
      expectState(false,2500,labels.resume);
      timer.toggleTimer();
      advance(1500);
      expectState(true,4000,labels.pause);
      assert.equal(clock(),'00:04');
      timer.resetTimer();
      expectState(true,0,labels.pause);
      assert.equal(clock(),'00:00');
      advance(1000);
      expectState(true,1000,labels.pause);
      timer.toggleTimer();
      timer.resetTimer();
      expectState(false,0,labels.start);
      assert.equal(clock(),'00:00');
    });
  }
}
