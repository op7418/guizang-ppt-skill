import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';
import {
  buildImageRequest,
  endpointForRegion,
  generateImage,
  parseApiResponse,
  parseArguments,
  saveImageResults,
} from './generate-minimax-image.mjs';

test('selects the configured regional endpoints',()=>{
  assert.equal(endpointForRegion('global_en'),'https://api.minimax.io/v1/image_generation');
  assert.equal(endpointForRegion('cn_zh'),'https://api.minimaxi.com/v1/image_generation');
  assert.throws(()=>endpointForRegion('unknown'),/Unsupported region/);
});

test('builds a text-to-image request from CLI options',()=>{
  const options=parseArguments([
    '--prompt','Editorial city scene',
    '--output','images/03-city.png',
    '--region','cn_zh',
    '--model','image-01-live',
    '--aspect-ratio','16:9',
    '--seed','42',
    '--n','2',
    '--prompt-optimizer','false',
  ]);
  assert.deepEqual(buildImageRequest(options),{
    model:'image-01-live',
    prompt:'Editorial city scene',
    response_format:'url',
    n:2,
    aspect_ratio:'16:9',
    seed:42,
    prompt_optimizer:false,
  });
});

test('parses image URLs and response metadata',()=>{
  assert.deepEqual(parseApiResponse({
    data:{image_urls:['https://images.example/one.png']},
    metadata:{success_count:1,failed_count:0},
    base_resp:{status_code:0},
  }),{
    images:['https://images.example/one.png'],
    successCount:1,
    failedCount:0,
  });
  assert.throws(()=>parseApiResponse({
    base_resp:{status_code:1001,status_msg:'Rejected request'},
  }),/API error 1001/);
});

test('saves URL and base64 responses to deterministic paths',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'minimax-image-test-'));
  const bytes=Uint8Array.from([137,80,78,71,13,10,26,10]);
  const fetchImpl=async url=>{
    assert.equal(url,'https://images.example/generated.png');
    return {
      ok:true,
      status:200,
      headers:{get:name=>name.toLowerCase()==='content-type'?'image/png':null},
      arrayBuffer:async()=>bytes.buffer,
    };
  };

  try{
    const files=await saveImageResults([
      'https://images.example/generated.png',
      `data:image/png;base64,${Buffer.from(bytes).toString('base64')}`,
    ],join(directory,'images','slide.png'),{fetchImpl});
    assert.deepEqual(files.map(file=>file.split('/').at(-1)),['slide-1.png','slide-2.png']);
    assert.deepEqual(await readFile(files[0]),Buffer.from(bytes));
    assert.deepEqual(await readFile(files[1]),Buffer.from(bytes));
  }finally{
    await rm(directory,{recursive:true,force:true});
  }
});

test('posts to the selected region and downloads URL responses',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'minimax-image-request-test-'));
  const output=join(directory,'images','hero.png');
  const bytes=Uint8Array.from([137,80,78,71,13,10,26,10]);
  const requests=[];
  const fetchImpl=async (url,options)=>{
    requests.push({url,options});
    if(url==='https://api.minimaxi.com/v1/image_generation'){
      return {
        ok:true,
        status:200,
        text:async()=>JSON.stringify({
          data:{image_urls:['https://images.example/hero.png']},
          metadata:{success_count:1,failed_count:0},
          base_resp:{status_code:0},
        }),
      };
    }
    assert.equal(url,'https://images.example/hero.png');
    return {
      ok:true,
      status:200,
      headers:{get:name=>name.toLowerCase()==='content-type'?'image/png':null},
      arrayBuffer:async()=>bytes.buffer,
    };
  };

  try{
    const options=parseArguments([
      '--prompt','Editorial hero',
      '--output',output,
      '--region','cn_zh',
      '--width','1600',
      '--height','900',
      '--response-format','url',
    ]);
    const result=await generateImage(options,{apiKey:'test-key',fetchImpl});
    assert.equal(requests[0].options.method,'POST');
    assert.equal(requests[0].options.headers.Authorization,'Bearer test-key');
    assert.deepEqual(JSON.parse(requests[0].options.body),{
      model:'image-01',
      prompt:'Editorial hero',
      response_format:'url',
      n:1,
      width:1600,
      height:900,
    });
    assert.equal(result.files[0],output);
    assert.deepEqual(await readFile(output),Buffer.from(bytes));
  }finally{
    await rm(directory,{recursive:true,force:true});
  }
});
