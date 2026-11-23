import type {ManualDailySale} from './types';

export function localDateISO(date=new Date()):string{
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

/** Daily demand is the imported source quantity plus every manual transaction for that date. */
export function mergeDailySales(source:[string,number][],manual:Pick<ManualDailySale,'date'|'quantity'>[]):[string,number][]{
  const byDate=new Map(source);
  for(const record of manual)byDate.set(record.date,(byDate.get(record.date)||0)+record.quantity);
  return [...byDate].sort(([a],[b])=>a.localeCompare(b));
}

export function aggregateSalesByDate(rows:Pick<ManualDailySale,'date'|'quantity'>[]):[string,number][]{
  const totals=new Map<string,number>();
  for(const row of rows)totals.set(row.date,(totals.get(row.date)||0)+row.quantity);
  return [...totals].sort(([a],[b])=>a.localeCompare(b));
}

export function salesForProduct<T extends Pick<ManualDailySale,'productKey'>>(rows:T[],productKey:string):T[]{
  return rows.filter(row=>row.productKey===productKey);
}

export function createSalesId(makeId:()=>string=()=>globalThis.crypto.randomUUID()):string{
  return makeId();
}

export function calculateSalesAmount(quantity:number,unitPrice:number|null):number|null{
  return unitPrice===null?null:Math.round(quantity*unitPrice*100)/100;
}

export function observedRange(rows:[string,number][]):{from:string|null;to:string|null}{
  return rows.length?{from:rows[0][0],to:rows[rows.length-1][0]}:{from:null,to:null};
}
