import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  exportExcel(exportName: string, headers: any[], data: any[], filterheaders?: any[], filterData?: any[], totalRow?: any[]) {
    const mid: number = Math.floor(headers.length / 2) - 1;
    const emptyRow: string[] = Array(mid).fill('');
    const companyDetails: any = {};

    const allData: any[] = [
      [...emptyRow,
      {
        v: companyDetails.companyName,
        s: { font: { bold: true, sz: 24 }, alignment: { horizontal: 'center' } },
      },
      ],
      [...emptyRow,
      {
        v: 'Registration No.',
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }, {
        v: companyDetails.companyReg,
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }],
      [...emptyRow,
      {
        v: 'Address',
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }, {
        v: companyDetails.companyAddress,
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }],
      [...emptyRow,
      {
        v: 'Contact',
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }, {
        v: companyDetails.companyContact,
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }],
      [''],
      [''],
      [''],
      [...emptyRow,
      {
        v: exportName,
        s: { font: { bold: true, sz: 24 }, alignment: { horizontal: 'center' } },
      }],
      [''],
      filterheaders != undefined ? [{
        v: "Filter", s: {
          font: { bold: true }, fill: { fgColor: { rgb: "f5f5f5" } }, border: { 
            top: { style: 'thin', color: { rgb: "d5d5d5" } },
            bottom: { style: 'thin', color: { rgb: "d5d5d5" } },
            left: { style: 'thin', color: { rgb: "d5d5d5" } },
            right: { style: 'thin', color: { rgb: "d5d5d5" } }
          }
        }
      }, ...filterheaders.map((header: any) => ({
        v: header, s: {
          font: { bold: true }, fill: { fgColor: { rgb: "f5f5f5" } }, border: { 
            top: { style: 'thin', color: { rgb: "d5d5d5" } },
            bottom: { style: 'thin', color: { rgb: "d5d5d5" } },
            left: { style: 'thin', color: { rgb: "d5d5d5" } },
            right: { style: 'thin', color: { rgb: "d5d5d5" } }
          }
        }
      }))] : [''],
      filterData != undefined ? ['', ...filterData] : [''],
      [''],
      headers.map((header: any) => ({
        v: header, s: {
          font: { bold: true }, fill: { fgColor: { rgb: "f5f5f5" } }, border: { 
            top: { style: 'thin', color: { rgb: "d5d5d5" } },
            bottom: { style: 'thin', color: { rgb: "d5d5d5" } },
            left: { style: 'thin', color: { rgb: "d5d5d5" } },
            right: { style: 'thin', color: { rgb: "d5d5d5" } }
          }
        }
      })),
      ...data,
      totalRow != undefined ? [...totalRow.map((header: any) => ({
        v: header, s: {
          font: { bold: true }, alignment: { horizontal: "right" }, fill: { fgColor: { rgb: "f5f5f5" } }, border: { 
            top: { style: 'thin', color: { rgb: "d5d5d5" } },
            bottom: { style: 'thin', color: { rgb: "d5d5d5" } },
            left: { style: 'thin', color: { rgb: "d5d5d5" } },
            right: { style: 'thin', color: { rgb: "d5d5d5" } }
          }
        }
      })),] : [''],
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(allData);

    //Merge Cells
    const merge = [{ s: { r: 0, c: mid }, e: { r: 0, c: mid + 2 } },
    { s: { r: 1, c: mid + 1 }, e: { r: 1, c: mid + 2 } },
    { s: { r: 2, c: mid + 1 }, e: { r: 2, c: mid + 2 } },
    { s: { r: 3, c: mid + 1 }, e: { r: 3, c: mid + 2 } },
    { s: { r: 7, c: mid }, e: { r: 7, c: mid + 2 } }];
    ws['!merges'] = merge;

    // Set column widths
    const colWidths = allData.slice(1).reduce((acc, row) => {
      row.forEach((cell: any, colIndex: any) => {
        acc[colIndex] = Math.max(acc[colIndex] || 0, String(cell).length);
      });
      return acc;
    }, []);
    ws['!cols'] = colWidths.map((width: any) => ({ width: width + 2 }));
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${exportName}.xlsx`);
  }
}
