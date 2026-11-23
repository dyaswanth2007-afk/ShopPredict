import fs from 'node:fs/promises';
import Papa from 'papaparse';

const input='data/india/packsense-india.csv';
const output='public/data/india-products.json';
const sourceUrl='https://huggingface.co/datasets/PackSense/packsense-india';
const retrievedAt='2026-11-03T10:30:30.000Z';
const text=await fs.readFile(input,'utf8');
const parsed=Papa.parse(text,{header:true,skipEmptyLines:true});
if(parsed.errors.length)throw new Error(`CSV parse failed: ${parsed.errors[0].message}`);
const unique=new Map();
for(const row of parsed.data){
  const barcode=String(row.code||'').trim(),name=String(row.product_name||'').trim(),brand=String(row.brands||'').split('|')[0].trim(),category=String(row.categories_tags||'').split('|')[0].trim();
  if(!/^\d{8,14}$/.test(barcode)||!name||!brand||!category||unique.has(barcode))continue;
  const amount=String(row.quantity_amount||'').trim(),unit=String(row.quantity_unit||'').trim();
  unique.set(barcode,{barcode,name,brand,category,imageUrl:null,packageSize:amount?(unit?`${amount} ${unit}`:amount):null,countries:['India'],sourceUrl,sourceName:'PackSense India catalogue (derived from Open Food Facts)',sourceDatasetUrl:sourceUrl,productPageUrl:null,classification:'PUBLIC_DATASET',retrievedAt,mrp:null,retailSellingPrice:null,historicalTransactionPrice:null});
}
const products=[...unique.values()];
if(products.length<5)throw new Error(`Expected a usable India product catalogue, found ${products.length} records.`);
await fs.mkdir('public',{recursive:true});
await fs.writeFile(output,JSON.stringify({sourceName:'PackSense India catalogue',sourceUrl,snapshotDate:'2026-11-03',retrievedAt,license:'ODbL 1.0',derivedFrom:'Open Food Facts',classification:'PUBLIC_DATASET',products}));
console.log(`Wrote ${products.length} qualified PackSense products to ${output}.`);
