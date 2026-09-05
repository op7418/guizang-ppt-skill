#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const [file,...args]=process.argv.slice(2);
let targetMinutes=NaN;
let targetProvided=false;
let runtimeOnly=false;
let cliError='';

for(let i=0;i<args.length;i++){
  const arg=args[i];
  if(arg==='--runtime-only'){
    runtimeOnly=true;
  }else if(arg==='--target-minutes'){
    targetProvided=true;
    const value=args[++i];
    if(value===undefined||value.startsWith('--'))cliError='--target-minutes requires a positive number.';
    else targetMinutes=Number(value);
  }else if(arg.startsWith('--target-minutes=')){
    targetProvided=true;
    targetMinutes=Number(arg.slice('--target-minutes='.length));
  }else{
    cliError=`Unknown option: ${arg}`;
  }
}

if(!file||file.startsWith('--')||cliError||(targetProvided&&(!Number.isFinite(targetMinutes)||targetMinutes<=0))){
  if(cliError)console.error(`ERROR ${cliError}`);
  else if(targetProvided)console.error('ERROR --target-minutes requires a positive number.');
  console.error('Usage: node scripts/validate-presenter-mode.mjs <index.html> [--target-minutes 30] [--runtime-only]');
  process.exit(2);
}

const html=readFileSync(file,'utf8');
const source=html.replace(/<!--[\s\S]*?-->/g,'');
const errors=[];
const warnings=[];

function extractArray(name){
  const marker=new RegExp(`(?:const|let|var)\\s+${name}\\s*=`).exec(source);
  if(!marker)return null;
  const start=source.indexOf('[',marker.index+marker[0].length);
  if(start<0)return null;
  let depth=0,quote='',escaped=false,lineComment=false,blockComment=false;
  for(let i=start;i<source.length;i++){
    const ch=source[i],next=source[i+1];
    if(lineComment){if(ch==='\n')lineComment=false;continue;}
    if(blockComment){if(ch==='*'&&next==='/'){blockComment=false;i++;}continue;}
    if(quote){if(escaped){escaped=false;continue;}if(ch==='\\'){escaped=true;continue;}if(ch===quote)quote='';continue;}
    if(ch==='/'&&next==='/'){lineComment=true;i++;continue;}
    if(ch==='/'&&next==='*'){blockComment=true;i++;continue;}
    if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
    if(ch==='[')depth++;
    if(ch===']'&&--depth===0)return source.slice(start,i+1);
  }
  return null;
}

const slideTags=[...source.matchAll(/<section\b(?=[^>]*\bclass="[^"]*\bslide\b[^"]*")[^>]*>/g)].map(m=>m[0]);
const slideIds=slideTags.map((tag,i)=>tag.match(/\bdata-slide-id="([^"]+)"/)?.[1]||'');
if(!slideIds.length){
  const message='No slides found; only the reusable presenter runtime can be validated.';
  if(runtimeOnly)warnings.push(message);
  else errors.push(`${message} Pass --runtime-only only when checking an intentionally empty template.`);
}

slideIds.forEach((id,i)=>{
  if(!id)errors.push(`Slide ${i+1}: missing data-slide-id.`);
  else if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))errors.push(`Slide ${i+1}: data-slide-id="${id}" must be a lowercase semantic slug.`);
});
const duplicates=slideIds.filter((id,i)=>id&&slideIds.indexOf(id)!==i);
if(duplicates.length)errors.push(`Duplicate data-slide-id: ${[...new Set(duplicates)].join(', ')}`);

let speakerNotes=[];
const arraySource=extractArray('SPEAKER_NOTES');
if(!arraySource){
  errors.push('Missing const SPEAKER_NOTES = [...].');
}else{
  try{speakerNotes=vm.runInNewContext(`(${arraySource})`,Object.create(null),{timeout:1000});}
  catch(error){errors.push(`SPEAKER_NOTES cannot be parsed: ${error.message}`);}
}

if(!Array.isArray(speakerNotes))errors.push('SPEAKER_NOTES must be an array.');
else{
  if(speakerNotes.length!==slideIds.length)errors.push(`Notes/slides mismatch: ${speakerNotes.length} notes for ${slideIds.length} slides.`);
  const noteIds=speakerNotes.map(n=>n?.id);
  const noteDupes=noteIds.filter((id,i)=>id&&noteIds.indexOf(id)!==i);
  if(noteDupes.length)errors.push(`Duplicate speaker-note id: ${[...new Set(noteDupes)].join(', ')}`);
  speakerNotes.forEach((note,i)=>{
    if(!note||typeof note!=='object'){errors.push(`Note ${i+1}: must be an object.`);return;}
    for(const field of ['id','title','purpose','transition'])if(typeof note[field]!=='string'||!note[field].trim())errors.push(`Note ${i+1}: ${field} is required.`);
    if(note.minutes!==undefined&&note.minutes!==null&&note.minutes!==''&&(!Number.isFinite(Number(note.minutes))||Number(note.minutes)<=0))errors.push(`Note ${i+1}: minutes must be > 0 when provided.`);
    if(note.autoAdvanceSeconds!==undefined&&note.autoAdvanceSeconds!==null&&note.autoAdvanceSeconds!==''&&(!Number.isFinite(Number(note.autoAdvanceSeconds))||Number(note.autoAdvanceSeconds)<=0))errors.push(`Note ${i+1}: autoAdvanceSeconds must be > 0 when provided.`);
    if(note.section!==undefined&&(typeof note.section!=='string'||!note.section.trim()))errors.push(`Note ${i+1}: section must be non-empty text when provided.`);
    for(const field of ['cue','interaction','delivery','advance','fallback','pronunciation']){
      const value=note[field];
      if(value===undefined||value===null||value==='')continue;
      const valid=typeof value==='string'?Boolean(value.trim()):Array.isArray(value)&&value.length>0&&value.every(x=>typeof x==='string'&&x.trim());
      if(!valid)errors.push(`Note ${i+1}: ${field} must be non-empty text or an array of non-empty text.`);
    }
    if(!Array.isArray(note.talk)||!note.talk.length)errors.push(`Note ${i+1}: talk must be a non-empty array.`);
    else{
      if(note.talk.some(x=>typeof x!=='string'||!x.trim()))errors.push(`Note ${i+1}: every talk item must be non-empty text.`);
      if(note.talk.length<3||note.talk.length>5)warnings.push(`Note ${i+1} (${note.id}): talk has ${note.talk.length} items; 3-5 is the default.`);
    }
    if(slideIds[i]&&note.id!==slideIds[i])errors.push(`Position ${i+1}: note id "${note.id}" does not match slide id "${slideIds[i]}".`);
  });
}

const runtimeChecks=[
  ['right-bottom presenter entry','id="ppt-presenter-btn"'],
  ['presenter shell','id="ppt-presenter"'],
  ['16:9 preview viewport','class="ppt-frame-viewport"'],
  ['proportional preview fitter','fitPresenterFrames'],
  ['overview control','id="ppt-grid"'],
  ['embedded presenter overview','id="ppt-presenter-overview"'],
  ['first-page control','id="ppt-first"'],
  ['last/restart control','id="ppt-last"'],
  ['audience status','id="ppt-sync"'],
  ['audience recovery','id="ppt-reopen"'],
  ['audience shutdown handling','showAudienceEnded'],
  ['direct window sync','postMessage('],
  ['BroadcastChannel fallback','BroadcastChannel'],
  ['storage fallback','__guizangPptSync'],
  ['per-slide timer','id="ppt-slide-clock"'],
  ['clear timer status','id="ppt-slide-status"'],
  ['rehearsal mode','id="ppt-rehearsal"'],
  ['auto advance','id="ppt-auto-toggle"'],
  ['laser and circle tools','id="ppt-presenter-ink"'],
  ['audience annotation layer','id="ppt-audience-ink"'],
  ['black, white, and freeze controls','setScreenMode'],
  ['preflight checks','id="ppt-preflight"'],
  ['layout presets','data-layout-choice'],
  ['capsule auto-advance switch','class="ppt-switch"'],
  ['styled interval stepper','class="ppt-stepper"'],
  ['reload-free preview navigation','preview-goto'],
  ['shortcut help','openShortcuts'],
];
for(const [label,needle]of runtimeChecks)if(!html.includes(needle))errors.push(`Presenter runtime missing ${label}.`);
if(!/\.ppt-preview-stack\s*\{[^}]*grid-template-rows\s*:/s.test(html))errors.push('Presenter preview stack must define vertical grid rows.');
if(!/\.ppt-frame\s*\{[^}]*aspect-ratio\s*:\s*16\s*\/\s*9/s.test(html))errors.push('Presenter preview frames must declare a 16:9 aspect ratio.');
if(!/fitPresenterFrames[\s\S]*?16\s*\/\s*9/.test(html))errors.push('Presenter preview fitter must preserve the 16:9 ratio.');
if(!/id="ppt-timer-toggle"[^>]*>开始计时<\/button>/.test(html))errors.push('Presenter timer must use the explicit label "开始计时".');
if(!/id="ppt-timer-reset"[^>]*>重置计时<\/button>/.test(html))errors.push('Presenter timer reset must use the explicit label "重置计时".');
if(!html.includes('继续计时'))errors.push('Presenter timer resume state must use the explicit label "继续计时".');
if(/\.ppt-preview-stack\{[^}]*grid-template-columns/.test(html))errors.push('Presenter previews must stack vertically; remove grid-template-columns from .ppt-preview-stack.');

const timedNotes=speakerNotes.filter(n=>Number.isFinite(Number(n?.minutes))&&Number(n.minutes)>0);
const planned=timedNotes.reduce((sum,n)=>sum+Number(n.minutes),0);
const completePlan=speakerNotes.length>0&&timedNotes.length===speakerNotes.length;
if(timedNotes.length&&!completePlan)warnings.push(`Timing is partial: ${timedNotes.length} of ${speakerNotes.length} notes provide minutes; total-budget checks are skipped.`);
if(completePlan&&Number.isFinite(targetMinutes)&&targetMinutes>0&&planned>targetMinutes*.9)errors.push(`Planned ${planned.toFixed(1)} min exceeds the 90% speaking budget (${(targetMinutes*.9).toFixed(1)} of ${targetMinutes} min).`);
if(completePlan&&Number.isFinite(targetMinutes)&&targetMinutes>0&&planned<targetMinutes*.55)warnings.push(`Planned ${planned.toFixed(1)} min is below 55% of the requested ${targetMinutes} min; confirm the deck is not under-scripted.`);

warnings.forEach(x=>console.warn(`WARN  ${x}`));
errors.forEach(x=>console.error(`ERROR ${x}`));
console.log(`Presenter validation: ${slideIds.length} slides, ${speakerNotes.length} notes, ${completePlan?planned.toFixed(1):'partial / —'} planned minutes, ${errors.length} errors, ${warnings.length} warnings.`);
process.exit(errors.length?1:0);
