import type {RecordRow} from '../calculations';
export type SourceKind='sample'|'uploaded'|'custom'|'indian';
export type DataClassification='VERIFIED_REAL'|'PUBLIC_DATASET'|'SIMULATED'|'MANUAL';
export type CleaningSummary={rowsRead:number;cancellations:number;returns:number;invalidDates:number;missingProductIds:number;missingDescriptions:number;zeroQuantities:number;invalidQuantities:number;duplicateImport:boolean};
export type DailyProduct={id:string;name:string;records:RecordRow[];daily:[string,number][];returnDaily:[string,number][];transactions:number;source:SourceKind;datasetId:string;grossNet:'gross'|'net';dateFrom:string|null;dateTo:string|null;category?:string;imageUrl?:string};
export type DatasetMeta={id:string;name:string;source:SourceKind;sourceLabel:string;importedAt:string;fileName?:string;fingerprint?:string;rowsRead:number;productCount:number;dateFrom:string|null;dateTo:string|null;cleaning:CleaningSummary;format:'transactions'|'daily'|'frequency';classification?:DataClassification;sourceUrl?:string;publisher?:string;license?:string};
export type ProcessedDataset={meta:DatasetMeta;products:DailyProduct[]};
export type TransactionMapping={invoiceNo?:string;stockCode:string;description?:string;quantity:string;date?:string;frequency?:string;productId?:string;category?:string;imageUrl?:string};
export type ManualDailySale={id:string;productKey:string;productId:string;productName:string;date:string;quantity:number;sellingPrice?:number|null;totalAmount?:number|null;source:string;classification?:'MANUAL';createdAt:string;updatedAt:string};
