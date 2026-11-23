export type DataClassification='VERIFIED_REAL'|'PUBLIC_DATASET'|'SIMULATED'|'MANUAL';
export type IndianCatalogProduct={
  barcode:string;name:string;brand:string;category:string;imageUrl:string|null;packageSize:string|null;
  countries:string[];sourceUrl:string;sourceName:string;sourceDatasetUrl:string;productPageUrl:string|null;classification:'PUBLIC_DATASET';retrievedAt:string;
  mrp:null;retailSellingPrice:null;historicalTransactionPrice:null;
};
export type MandiPriceRecord={state:string;district:string;market:string;commodity:string;variety:string;grade:string;arrivalDate:string;minPrice:number|null;maxPrice:number|null;modalPrice:number|null;currency:'INR';unit:'per quintal';sourceUrl:string;classification:'VERIFIED_REAL'};

type OffProduct={code?:string;product_name?:string;brands?:string;categories?:string;image_url?:string;quantity?:string;countries?:string;countries_tags?:string[];countries_tags_en?:string[]};
export function normalizeIndianProducts(raw:OffProduct[],retrievedAt=new Date().toISOString()):IndianCatalogProduct[]{
  const unique=new Map<string,IndianCatalogProduct>();
  for(const row of raw){
    const barcode=String(row.code||'').trim(),name=String(row.product_name||'').trim(),brand=String(row.brands||'').split(',')[0].trim(),category=String(row.categories||'').split(',')[0].trim();
    const countryTags=[...(row.countries_tags||[]),...(row.countries_tags_en||[])].map(x=>x.toLowerCase().replace(/^en:/,''));
    if(!/^\d{8,14}$/.test(barcode)||!name||!brand||!category||!countryTags.some(x=>x==='india'||x==='in'))continue;
    if(unique.has(barcode))continue;
    const image=String(row.image_url||'');
    unique.set(barcode,{barcode,name,brand,category,imageUrl:/^https:\/\//i.test(image)?image:null,packageSize:String(row.quantity||'').trim()||null,countries:['India'],sourceUrl:'https://world.openfoodfacts.org/data',sourceDatasetUrl:'https://world.openfoodfacts.org/data',productPageUrl:`https://world.openfoodfacts.org/product/${encodeURIComponent(barcode)}`,sourceName:'Open Food Facts API',classification:'PUBLIC_DATASET',retrievedAt,mrp:null,retailSellingPrice:null,historicalTransactionPrice:null});
  }
  return [...unique.values()];
}
export function chooseRandomFive<T extends {barcode:string}>(catalog:T[],random=Math.random):T[]{
  if(catalog.length<5)return[];
  const pool=[...catalog];for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  return pool.slice(0,5);
}
export function validCachedCatalog(value:unknown):value is {products:IndianCatalogProduct[];retrievedAt:string}{
  if(!value||typeof value!=='object')return false;const row=value as {products?:unknown;retrievedAt?:unknown};
  return Array.isArray(row.products)&&typeof row.retrievedAt==='string'&&row.products.every(p=>p&&typeof p==='object'&&typeof(p as IndianCatalogProduct).barcode==='string'&&(p as IndianCatalogProduct).classification==='PUBLIC_DATASET');
}
export function normalizeMandiRecords(raw:Record<string,unknown>[],sourceUrl:string):MandiPriceRecord[]{
  const n=(v:unknown)=>{const value=Number(String(v??'').replace(/,/g,''));return Number.isFinite(value)&&value>=0?value:null};
  return raw.map(row=>({state:String(row.state||''),district:String(row.district||''),market:String(row.market||''),commodity:String(row.commodity||''),variety:String(row.variety||''),grade:String(row.grade||''),arrivalDate:String(row.arrival_date||row.arrivaldate||''),minPrice:n(row.min_price),maxPrice:n(row.max_price),modalPrice:n(row.modal_price),currency:'INR' as const,unit:'per quintal' as const,sourceUrl,classification:'VERIFIED_REAL' as const})).filter(row=>row.state&&row.market&&row.commodity&&row.arrivalDate&&(row.minPrice!==null||row.modalPrice!==null||row.maxPrice!==null));
}
export const INDIA_MANDI_RESOURCE_URL='https://www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity';
