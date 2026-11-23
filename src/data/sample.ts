import {aggregateDailyDemand,type RecordRow} from '../calculations';
export const sampleRows:RecordRow[]=[{quantity:10,frequency:2},{quantity:12,frequency:3},{quantity:14,frequency:5},{quantity:16,frequency:6},{quantity:18,frequency:7},{quantity:20,frequency:4},{quantity:22,frequency:2},{quantity:25,frequency:1}];
export const sampleProduct={id:'sample::backpack',name:'College Backpack',source:'sample' as const,classification:'SIMULATED' as const,records:sampleRows,daily:[] as [string,number][],returnDaily:[] as [string,number][],transactions:30,datasetId:'dissertation-sample',grossNet:'gross' as const,dateFrom:null,dateTo:null};
export const sampleDaily=[10,10,12,12,12,14,14,14,14,14,16,16,16,16,16,16,18,18,18,18,18,18,18,20,20,20,20,22,22,25];
