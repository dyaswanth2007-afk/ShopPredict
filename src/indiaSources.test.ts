import {describe,expect,it} from 'vitest';
import {chooseRandomFive,normalizeIndianProducts,normalizeMandiRecords} from './data/indiaSources';

describe('Indian source records',()=>{
  it('keeps only identified Open Food Facts records marked for India',()=>{
    const products=normalizeIndianProducts([
      {code:'8901234567890',product_name:'Indian Tea',brands:'Demo Tea',categories:'Beverages',countries_tags_en:['India'],image_url:'https://images.example/tea.jpg',quantity:'250 g'},
      {code:'8901234567891',product_name:'Missing brand',categories:'Beverages',countries_tags_en:['India']},
      {code:'8901234567892',product_name:'Not India',brands:'Brand',categories:'Food',countries_tags_en:['United States']}
    ],'2026-11-23T00:00:00.000Z');
    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({barcode:'8901234567890',brand:'Demo Tea',classification:'PUBLIC_DATASET',mrp:null,retailSellingPrice:null,historicalTransactionPrice:null});
    expect(products[0].productPageUrl).toContain('/product/8901234567890');
    expect(products[0].sourceUrl).toBe('https://world.openfoodfacts.org/data');
  });

  it('selects five unique random products from a larger catalogue',()=>{
    const catalog=Array.from({length:9},(_,i)=>({barcode:String(i)}));
    const selected=chooseRandomFive(catalog,()=>0.25);
    expect(selected).toHaveLength(5);
    expect(new Set(selected.map(item=>item.barcode)).size).toBe(5);
    expect(chooseRandomFive(catalog.slice(0,4))).toEqual([]);
  });

  it('preserves government mandi price units without making sales observations',()=>{
    const rows=normalizeMandiRecords([{state:'Maharashtra',district:'Pune',market:'Pune',commodity:'Tomato',variety:'Hybrid',arrival_date:'23/11/2026',min_price:'1000',max_price:'1500',modal_price:'1200'}],'https://www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity');
    expect(rows[0]).toMatchObject({arrivalDate:'23/11/2026',modalPrice:1200,currency:'INR',unit:'per quintal',classification:'VERIFIED_REAL'});
  });
});
