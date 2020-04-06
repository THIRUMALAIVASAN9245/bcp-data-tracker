import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class BcpGraphExportService {
    constructor() { }
    public exportAsExcelFile(json: any[], excelFileName: string, sheetName: string): void {

        var wb = { SheetNames: [], Sheets: {} };
        const worksheet1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json[0]);
        wb.SheetNames.push(sheetName);
        wb.Sheets[sheetName] = worksheet1;

        const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }
    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    }
}