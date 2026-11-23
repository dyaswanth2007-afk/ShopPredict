import {describe,expect,it} from 'vitest';
import {aggregateSalesByDate,calculateSalesAmount,createSalesId,mergeDailySales,salesForProduct} from './dailySales';

describe('append-only daily sales aggregation',()=>{
  it('adds separate same-day sales entries into one daily total',()=>{
    const entries=[{date:'2026-11-23',quantity:10},{date:'2026-11-23',quantity:15},{date:'2026-11-23',quantity:5}];
    expect(entries).toHaveLength(3);
    expect(aggregateSalesByDate(entries)).toEqual([['2026-11-23',30]]);
  });

  it('adds manual transactions to imported demand without replacing it',()=>{
    expect(mergeDailySales([['2026-11-23',20]],[{date:'2026-11-23',quantity:10},{date:'2026-11-23',quantity:15},{date:'2026-11-23',quantity:5}]))
      .toEqual([['2026-11-23',50]]);
  });

  it('preserves a large number of entries while calculating each date total',()=>{
    const entries=Array.from({length:100},(_,i)=>({date:`2026-11-${String(1+(i%10)).padStart(2,'0')}`,quantity:1}));
    expect(entries).toHaveLength(100);
    expect(aggregateSalesByDate(entries)).toHaveLength(10);
    expect(aggregateSalesByDate(entries).reduce((sum,[,quantity])=>sum+quantity,0)).toBe(100);
  });

  it('keeps product histories separate and gives every transaction a unique sales ID',()=>{
    const rows=[{id:'1',productKey:'rice',date:'2026-11-23',quantity:10},{id:'2',productKey:'tea',date:'2026-11-23',quantity:8}];
    expect(salesForProduct(rows,'rice')).toEqual([rows[0]]);
    let next=0;const ids=new Set(Array.from({length:100},()=>createSalesId(()=>`sale-${++next}`)));
    expect(ids.size).toBe(100);
  });

  it('calculates known sales amounts and leaves unknown prices blank',()=>{
    expect(calculateSalesAmount(3,12.5)).toBe(37.5);
    expect(calculateSalesAmount(3,null)).toBeNull();
  });
});
