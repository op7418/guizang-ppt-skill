#!/usr/bin/env node
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, join, parse, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const PROVIDER_NAME='MiniMax';
const ENDPOINTS=Object.freeze({
  global_en:'https://api.minimax.io/v1/image_generation',
  cn_zh:'https://api.minimaxi.com/v1/image_generation',
});
const DEFAULT_MODEL='image-01';
const MODELS=new Set(["image-01","image-01-live"]);
const OUTPUT_FORMATS=new Set(["url","base64"]);
const AUTHORIZATION_SCHEME='Bearer';
const REQUEST_METHOD='POST';
const RESPONSE_FIELD='data.image_urls';
const SUCCESS_COUNT_FIELD='metadata.success_count';
const FAILED_COUNT_FIELD='metadata.failed_count';
const STATUS_FIELD='base_resp.status_code';
const URL_TTL_HOURS=24;

function usage(){
  return [
    'Usage:',
    '  MINIMAX_API_KEY=... node scripts/generate-minimax-image.mjs --prompt <text> --output <path> [options]',
    '',
    'Options:',
    '  --region <global_en|cn_zh>      API region (default: global_en)',
    `  --model <${[...MODELS].join('|')}>  Image model (default: ${DEFAULT_MODEL})`,
    '  --aspect-ratio <ratio>          Requested image ratio',
    '  --width <pixels>                Requested image width',
    '  --height <pixels>               Requested image height',
    '  --response-format <url|base64>  Response format (default: url)',
    '  --seed <integer>                Deterministic seed',
    '  --n <count>                     Number of images (default: 1)',
    '  --prompt-optimizer <true|false> Enable or disable prompt optimization',
    '  --help                          Show this help',
  ].join('\n');
}

function readPath(value,path){
  return path.split('.').reduce((current,key)=>current?.[key],value);
}

function takeValue(argv,index,flag){
  const value=argv[index+1];
  if(value===undefined)throw new Error(`${flag} requires a value.`);
  return value;
}

function parseInteger(value,flag,{min=Number.MIN_SAFE_INTEGER}={}){
  const number=Number(value);
  if(!Number.isInteger(number)||number<min)throw new Error(`${flag} must be an integer >= ${min}.`);
  return number;
}

function parseBoolean(value,flag){
  if(value==='true')return true;
  if(value==='false')return false;
  throw new Error(`${flag} must be true or false.`);
}

export function endpointForRegion(region){
  const endpoint=ENDPOINTS[region];
  if(!endpoint)throw new Error(`Unsupported region "${region}".`);
  return endpoint;
}

export function parseArguments(argv){
  const options={
    region:'global_en',
    model:DEFAULT_MODEL,
    responseFormat:'url',
    n:1,
  };

  for(let index=0;index<argv.length;index++){
    const flag=argv[index];
    if(flag==='--help'){options.help=true;continue;}
    const value=takeValue(argv,index,flag);
    index++;
    if(flag==='--prompt')options.prompt=value;
    else if(flag==='--output')options.output=value;
    else if(flag==='--region')options.region=value;
    else if(flag==='--model')options.model=value;
    else if(flag==='--aspect-ratio')options.aspectRatio=value;
    else if(flag==='--width')options.width=parseInteger(value,flag,{min:1});
    else if(flag==='--height')options.height=parseInteger(value,flag,{min:1});
    else if(flag==='--response-format')options.responseFormat=value;
    else if(flag==='--seed')options.seed=parseInteger(value,flag);
    else if(flag==='--n')options.n=parseInteger(value,flag,{min:1});
    else if(flag==='--prompt-optimizer')options.promptOptimizer=parseBoolean(value,flag);
    else throw new Error(`Unknown option "${flag}".`);
  }

  if(options.help)return options;
  if(!options.prompt?.trim())throw new Error('--prompt is required.');
  if(!options.output?.trim())throw new Error('--output is required.');
  endpointForRegion(options.region);
  if(!MODELS.has(options.model))throw new Error(`Unsupported model "${options.model}".`);
  if(!OUTPUT_FORMATS.has(options.responseFormat))throw new Error(`Unsupported response format "${options.responseFormat}".`);
  return options;
}

export function buildImageRequest(options){
  const body={
    model:options.model,
    prompt:options.prompt,
    response_format:options.responseFormat,
    n:options.n,
  };
  if(options.aspectRatio!==undefined)body.aspect_ratio=options.aspectRatio;
  if(options.width!==undefined)body.width=options.width;
  if(options.height!==undefined)body.height=options.height;
  if(options.seed!==undefined)body.seed=options.seed;
  if(options.promptOptimizer!==undefined)body.prompt_optimizer=options.promptOptimizer;
  return body;
}

export function parseApiResponse(payload){
  if(!payload||typeof payload!=='object')throw new Error(`${PROVIDER_NAME} returned an invalid JSON response.`);
  const statusCode=readPath(payload,STATUS_FIELD);
  if(statusCode!==undefined&&Number(statusCode)!==0){
    const message=payload.base_resp?.status_msg||payload.base_resp?.status_message||'Unknown API error';
    throw new Error(`${PROVIDER_NAME} API error ${statusCode}: ${message}`);
  }
  const images=readPath(payload,RESPONSE_FIELD);
  if(!Array.isArray(images)||images.length===0)throw new Error(`${PROVIDER_NAME} response did not include ${RESPONSE_FIELD}.`);
  if(images.some(image=>typeof image!=='string'||!image.trim())){
    throw new Error(`${RESPONSE_FIELD} must contain non-empty strings.`);
  }
  return {
    images,
    successCount:readPath(payload,SUCCESS_COUNT_FIELD),
    failedCount:readPath(payload,FAILED_COUNT_FIELD),
  };
}

function decodeBase64(value){
  const normalized=value.replace(/\s+/g,'');
  if(!normalized||!/^[A-Za-z0-9+/]+={0,2}$/.test(normalized))throw new Error('Image response is neither a URL nor valid base64 data.');
  return Buffer.from(normalized,'base64');
}

async function loadImage(entry,fetchImpl){
  if(/^https?:\/\//i.test(entry)){
    const response=await fetchImpl(entry);
    if(!response.ok)throw new Error(`Image download failed with HTTP ${response.status}.`);
    return {
      bytes:Buffer.from(await response.arrayBuffer()),
      contentType:response.headers.get('content-type')||'',
    };
  }

  const dataUri=/^data:([^;,]+);base64,(.+)$/s.exec(entry);
  if(dataUri)return {bytes:decodeBase64(dataUri[2]),contentType:dataUri[1]};
  return {bytes:decodeBase64(entry),contentType:''};
}

function extensionForContentType(contentType){
  const type=contentType.split(';',1)[0].trim().toLowerCase();
  if(type==='image/jpeg')return '.jpg';
  if(type==='image/png')return '.png';
  if(type==='image/webp')return '.webp';
  return '.bin';
}

function indexedOutputPath(output,index,count,contentType){
  const parsed=parse(output);
  const extension=parsed.ext||extensionForContentType(contentType);
  const suffix=count>1?`-${index+1}`:'';
  return join(parsed.dir,`${parsed.name}${suffix}${extension}`);
}

export async function saveImageResults(entries,output,{fetchImpl=globalThis.fetch}={}){
  if(typeof fetchImpl!=='function')throw new Error('A fetch implementation is required.');
  const files=[];
  for(let index=0;index<entries.length;index++){
    const image=await loadImage(entries[index],fetchImpl);
    const file=indexedOutputPath(output,index,entries.length,image.contentType);
    await mkdir(dirname(file),{recursive:true});
    await writeFile(file,image.bytes);
    files.push(resolve(file));
  }
  return files;
}

export async function generateImage(options,{apiKey,fetchImpl=globalThis.fetch}={}){
  if(!apiKey?.trim())throw new Error('MINIMAX_API_KEY is required.');
  if(typeof fetchImpl!=='function')throw new Error('Node.js 18 or newer is required for fetch support.');

  const endpoint=endpointForRegion(options.region);
  const response=await fetchImpl(endpoint,{
    method:REQUEST_METHOD,
    headers:{
      Authorization:`${AUTHORIZATION_SCHEME} ${apiKey}`,
      'Content-Type':'application/json',
    },
    body:JSON.stringify(buildImageRequest(options)),
  });
  const responseText=await response.text();
  let payload;
  try{payload=JSON.parse(responseText);}
  catch{throw new Error(`${PROVIDER_NAME} returned non-JSON data with HTTP ${response.status}.`);}
  if(!response.ok)throw new Error(`${PROVIDER_NAME} request failed with HTTP ${response.status}.`);

  const parsed=parseApiResponse(payload);
  const files=await saveImageResults(parsed.images,options.output,{fetchImpl});
  return {
    provider:PROVIDER_NAME,
    region:options.region,
    model:options.model,
    response_format:options.responseFormat,
    url_ttl_hours:URL_TTL_HOURS,
    success_count:parsed.successCount??files.length,
    failed_count:parsed.failedCount??0,
    files,
  };
}

async function main(){
  try{
    const options=parseArguments(process.argv.slice(2));
    if(options.help){console.log(usage());return;}
    const result=await generateImage(options,{apiKey:process.env.MINIMAX_API_KEY});
    console.log(JSON.stringify(result,null,2));
  }catch(error){
    console.error(`ERROR ${error.message}`);
    process.exitCode=1;
  }
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
