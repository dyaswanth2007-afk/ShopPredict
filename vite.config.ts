import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const offUrl='https://world.openfoodfacts.org/api/v2/search';
const offFields='code,product_name,brands,categories,image_url,quantity,countries,countries_tags,countries_tags_en';
const cache=new Map<string,{until:number;body:unknown}>();

function sourceProxy():Plugin{
  return {name:'shoppredict-source-proxy',configureServer(server){
    server.middlewares.use('/api/shopredict/openfoodfacts',async(_req,res)=>{
      const cached=cache.get('off');if(cached&&cached.until>Date.now()){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(cached.body));return}
      try{
        const url=new URL(offUrl);url.searchParams.set('countries_tags_en','India');url.searchParams.set('page_size','100');url.searchParams.set('page','1');url.searchParams.set('fields',offFields);
        const upstream=await fetch(url,{headers:{'User-Agent':'ShopPredict/1.0 (academic demonstration; https://openfoodfacts.github.io/openfoodfacts-server/api/)','Accept':'application/json'},signal:AbortSignal.timeout(15000)});
        if(!upstream.ok)throw new Error(`Open Food Facts returned HTTP ${upstream.status}`);
        const body=await upstream.json();cache.set('off',{until:Date.now()+12*60*60*1000,body});res.setHeader('Content-Type','application/json');res.end(JSON.stringify(body));
      }catch(error){res.statusCode=502;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:error instanceof Error?error.message:'Open Food Facts request failed'}))}
    });
    server.middlewares.use('/api/shopredict/mandi',async(req,res)=>{
      if(req.method!=='POST'){res.statusCode=405;res.end('POST required');return}
      try{
        const chunks:Buffer[]=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>32768)throw new Error('Request too large');chunks.push(Buffer.from(chunk))}
        const input=JSON.parse(Buffer.concat(chunks).toString('utf8')) as {apiKey?:string;resourceId?:string;state?:string;commodity?:string};
        const apiKey=String(input.apiKey||'').trim(),resourceId=String(input.resourceId||'').trim();
        if(!apiKey){res.statusCode=400;throw new Error('Enter a data.gov.in API key. It is used for this request only and is not saved.')}
        if(!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(resourceId)){res.statusCode=400;throw new Error('Enter the resource ID shown in the dataset’s Data API tab.')}
        const cacheKey=`mandi:${resourceId}:${String(input.state||'')}:${String(input.commodity||'')}`;const cached=cache.get(cacheKey);
        if(cached&&cached.until>Date.now()){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(cached.body));return}
        const url=new URL(`https://api.data.gov.in/resource/${resourceId}`);url.searchParams.set('api-key',apiKey);url.searchParams.set('format','json');url.searchParams.set('limit','100');url.searchParams.set('offset','0');
        url.searchParams.set('fields','state,district,market,commodity,variety,grade,arrival_date,min_price,max_price,modal_price');
        if(input.state)url.searchParams.set('filters[state]',String(input.state));if(input.commodity)url.searchParams.set('filters[commodity]',String(input.commodity));
        const upstream=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(20000)});if(!upstream.ok)throw new Error(`data.gov.in returned HTTP ${upstream.status}`);
        const body=await upstream.json();cache.set(cacheKey,{until:Date.now()+6*60*60*1000,body});res.setHeader('Content-Type','application/json');res.end(JSON.stringify(body));
      }catch(error){if(!res.statusCode||res.statusCode<400)res.statusCode=502;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:error instanceof Error?error.message:'Government data request failed'}))}
    });
  }};
}

export default defineConfig({plugins:[react(),sourceProxy()]});
