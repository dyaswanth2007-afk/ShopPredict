import {describe,it,expect} from 'vitest';
import {processFrequencyRows,processTransactionRows,calendar,applyGrossNet} from './data/processing';
import {sampleRows} from './data/sample';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {mergeDailySales} from './data/dailySales';
import {calculateExpectedValue,aggregateDailyDemand,calculateRecommendedStock} from './calculations';

describe('shared sales data processing',()=>{
  it('preserves the dissertation sample frequency table',()=>{
    expect(sampleRows.reduce((n,r)=>n+r.frequency,0)).toBe(30);
    expect(sampleRows.find(r=>r.quantity===18)?.frequency).toBe(7);
  });

  it('excludes cancellations, separates returns, and retains zero-sales dates',()=>{
    const result=processTransactionRows([
      {InvoiceNo:'1001',StockCode:'A',Description:'Bag',Quantity:3,InvoiceDate:'2025-01-01'},
      {InvoiceNo:'1002',StockCode:'A',Description:'Bag',Quantity:2,InvoiceDate:'2025-01-01'},
      {InvoiceNo:'1003',StockCode:'A',Description:'Bag',Quantity:-1,InvoiceDate:'2025-01-02'},
      {InvoiceNo:'C1004',StockCode:'A',Description:'Bag',Quantity:9,InvoiceDate:'2025-01-02'},
      {InvoiceNo:'1005',StockCode:'B',Description:'',Quantity:1,InvoiceDate:'2025-01-03'},
      {InvoiceNo:'1006',StockCode:'',Description:'Missing ID',Quantity:1,InvoiceDate:'2025-01-03'},
      {InvoiceNo:'1007',StockCode:'A',Description:'Bag',Quantity:1,InvoiceDate:'not a date'}
    ],{invoiceNo:'InvoiceNo',stockCode:'StockCode',description:'Description',quantity:'Quantity',date:'InvoiceDate'},
    {id:'test',name:'Test',source:'uploaded',sourceLabel:'Test upload'});
    const bag=result.products.find(p=>p.id==='A')!;
    expect(result.meta.cleaning.cancellations).toBe(1);
    expect(result.meta.cleaning.returns).toBe(1);
    expect(result.meta.cleaning.missingProductIds).toBe(1);
    expect(result.meta.cleaning.invalidDates).toBe(1);
    expect(result.meta.cleaning.missingDescriptions).toBe(1);
    expect(bag.daily).toEqual([['2025-01-01',5]]);
    expect(bag.returnDaily).toEqual([['2025-01-02',-1]]);
    expect(bag.records).toEqual([{quantity:0,frequency:2},{quantity:5,frequency:1}]);
    expect(applyGrossNet(bag,'net').daily).toEqual([['2025-01-01',5],['2025-01-02',0],['2025-01-03',0]]);
  });

  it('keeps frequency imports undated rather than fabricating calendar records',()=>{
    const result=processFrequencyRows([
      {'Product ID':'SKU-1','Product Name':'Mug','Sales Quantity':0,Frequency:2},
      {'Product ID':'SKU-1','Product Name':'Mug','Sales Quantity':4,Frequency:3}
    ],{stockCode:'',productId:'Product ID',description:'Product Name',quantity:'Sales Quantity',frequency:'Frequency'},
    {id:'freq',name:'Frequency',source:'uploaded',sourceLabel:'Test frequency'});
    expect(result.products[0].records).toEqual([{quantity:0,frequency:2},{quantity:4,frequency:3}]);
    expect(result.products[0].daily).toEqual([]);
    expect(calendar('2025-01-01','2025-01-03')).toHaveLength(3);
  });

  it('reads CSV, XLSX, and XLS sheets into the shared transaction processor',()=>{
    const csv='Order Date,Product ID,Product Name,Quantity\n2025-01-01,A,Bag,3\n2025-01-02,A,Bag,0';
    const csvRows=Papa.parse<Record<string,unknown>>(csv,{header:true,skipEmptyLines:true}).data;
    const mapping={stockCode:'Product ID',description:'Product Name',quantity:'Quantity',date:'Order Date'};
    const csvData=processTransactionRows(csvRows,mapping,{id:'csv',name:'csv',source:'uploaded',sourceLabel:'CSV'});
    expect(csvData.products[0].records).toEqual([{quantity:0,frequency:1},{quantity:3,frequency:1}]);
    const workbook=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook,XLSX.utils.json_to_sheet([{Date:'2025-01-01',SKU:'B',Name:'Cup',Qty:4}]),'Sales');
    for(const bookType of ['xlsx','biff8'] as const){
      const bytes=XLSX.write(workbook,{type:'buffer',bookType});
      const parsed=XLSX.read(bytes,{type:'buffer',cellDates:true});
      const rows=XLSX.utils.sheet_to_json<Record<string,unknown>>(parsed.Sheets.Sales!,{raw:true,defval:null});
      const data=processTransactionRows(rows,{stockCode:'SKU',description:'Name',quantity:'Qty',date:'Date'},{id:bookType,name:bookType,source:'uploaded',sourceLabel:bookType});
      expect(data.products[0].records).toEqual([{quantity:4,frequency:1}]);
    }
  });

  it('adds saved manual days to the selected history without filling unknown gaps',()=>{
    const rows=mergeDailySales([['2025-01-01',10],['2025-01-02',0]],[
      {date:'2025-01-02',quantity:12},
      {date:'2025-01-04',quantity:16}
    ]);
    expect(rows).toEqual([['2025-01-01',10],['2025-01-02',12],['2025-01-04',16]]);
    const distribution=aggregateDailyDemand(rows,rows.length);
    expect(calculateExpectedValue(distribution)).toBeCloseTo(12.6667,4);
    expect(Math.ceil(calculateExpectedValue(distribution))).toBe(13);
    expect(calculateRecommendedStock(distribution,.9)).toBe(16);
  });

  it('keeps uploaded category and validated image URL metadata with the product',()=>{
    const result=processTransactionRows([{Date:'2025-02-01',SKU:'PAN001',Name:'Pan',Qty:5,Category:'Kitchen',Image:'https://example.com/pan.jpg'}],
      {stockCode:'SKU',description:'Name',quantity:'Qty',date:'Date',category:'Category',imageUrl:'Image'},
      {id:'daily',name:'daily',source:'uploaded',sourceLabel:'Daily upload',format:'daily'});
    expect(result.meta.format).toBe('daily');
    expect(result.products[0]).toMatchObject({id:'PAN001',name:'Pan',category:'Kitchen',imageUrl:'https://example.com/pan.jpg'});
    expect(result.products[0].records).toEqual([{quantity:5,frequency:1}]);
  });
});
