import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import { ConfigServiceService } from '../configuration/config-service/config-service.service';


@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  companyDetails: any = null;

  constructor(private configService: ConfigServiceService) { }

  exportExcel(exportName: string, headers: any[], data: any[], filterheaders?: any[], filterData?: any[], totalRow?: any[]) {
    const mid: number = Math.floor(headers.length / 2) - 1;
    const emptyRow: string[] = Array(mid).fill('');

    this.configService.companyDetails$.subscribe((c) => {
      this.companyDetails = c;
    });

    const allData: any[] = [
      [...emptyRow,
      {
        v: this.companyDetails.companyName,
        s: { font: { bold: true, sz: 24 }, alignment: { horizontal: 'center' } },
      },
      ],
      [...emptyRow,
      {
        v: 'Registration No.',
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }, {
        v: this.companyDetails.companyReg,
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }],
      [...emptyRow,
      {
        v: 'Address',
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }, {
        v: this.companyDetails.companyAddress,
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }],
      [...emptyRow,
      {
        v: 'Contact',
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }, {
        v: this.companyDetails.companyContact,
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
          font: { bold: true }, fill: { fgColor: { rgb: "f5f5f5" } }, border: { // Apply border
            top: { style: 'thin', color: { rgb: "d5d5d5" } },
            bottom: { style: 'thin', color: { rgb: "d5d5d5" } },
            left: { style: 'thin', color: { rgb: "d5d5d5" } },
            right: { style: 'thin', color: { rgb: "d5d5d5" } }
          }
        }
      }, ...filterheaders.map((header: any) => ({
        v: header, s: {
          font: { bold: true }, fill: { fgColor: { rgb: "f5f5f5" } }, border: { // Apply border
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
          font: { bold: true }, fill: { fgColor: { rgb: "f5f5f5" } }, border: { // Apply border
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
          font: { bold: true }, alignment: { horizontal: "right" }, fill: { fgColor: { rgb: "f5f5f5" } }, border: { // Apply border
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



  exportExcelIRD(exportName: string, headers: any[], data: any[], topheaders: any[], filterData?: any[], totalRow?: any[], type?:string) {
    const mid: number = Math.floor(headers.length / 2) - 1;
    const emptyRow: string[] = Array(mid).fill('');

    this.configService.companyDetails$.subscribe((c) => {
      this.companyDetails = c;
    });

    const allData: any[] = [
      [...emptyRow,
      {
        v: this.companyDetails.companyName,
        s: { font: { bold: true, sz: 24 }, alignment: { horizontal: 'center' } },
      },
      ],
      [...emptyRow,
      {
        v: 'Registration No.',
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }, {
        v: this.companyDetails.companyReg,
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }],
      [...emptyRow,
      {
        v: 'Address',
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }, {
        v: this.companyDetails.companyAddress,
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }],
      [...emptyRow,
      {
        v: 'Contact',
        s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } },
      }, {
        v: this.companyDetails.companyContact,
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
      [
        {
          v: 'Filter',
          s: {
            font: { bold: true }, fill: { fgColor: { rgb: "f5f5f5" } }, border: { // Apply border
              top: { style: 'thin', color: { rgb: "d5d5d5" } },
              bottom: { style: 'thin', color: { rgb: "d5d5d5" } },
              left: { style: 'thin', color: { rgb: "d5d5d5" } },
              right: { style: 'thin', color: { rgb: "d5d5d5" } }
            }
          },
        }, {
          v: 'Year',
          s: {
            font: { bold: true }, fill: { fgColor: { rgb: "f5f5f5" } }, border: { // Apply border
              top: { style: 'thin', color: { rgb: "d5d5d5" } },
              bottom: { style: 'thin', color: { rgb: "d5d5d5" } },
              left: { style: 'thin', color: { rgb: "d5d5d5" } },
              right: { style: 'thin', color: { rgb: "d5d5d5" } }
            }
          },
        },
        {
          v: 'Month',
          s: {
            font: { bold: true }, fill: { fgColor: { rgb: "f5f5f5" } }, border: { // Apply border
              top: { style: 'thin', color: { rgb: "d5d5d5" } },
              bottom: { style: 'thin', color: { rgb: "d5d5d5" } },
              left: { style: 'thin', color: { rgb: "d5d5d5" } },
              right: { style: 'thin', color: { rgb: "d5d5d5" } }
            }
          },
        }],

      filterData != undefined ? ['', ...filterData] : [''],
      [''],
      topheaders.map((header: any) => ({
        v: header, s: {
          font: { bold: true }, fill: { fgColor: { rgb: "f5f5f5" } }, alignment: { horizontal: 'center', vertical: 'center' }, border: { // Apply border
            top: { style: 'thin', color: { rgb: "d5d5d5" } },
            bottom: { style: 'thin', color: { rgb: "d5d5d5" } },
            left: { style: 'thin', color: { rgb: "d5d5d5" } },
            right: { style: 'thin', color: { rgb: "d5d5d5" } }
          }
        }
      })),
      headers.map((header: any) => ({
        v: header, s: {
          font: { bold: true }, fill: { fgColor: { rgb: "f5f5f5" } }, border: { // Apply border
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
          font: { bold: true }, alignment: { horizontal: "right" }, fill: { fgColor: { rgb: "f5f5f5" } }, border: { // Apply border
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

    let merge:any = [];

    if (type == 'sales') {
      merge = [{ s: { r: 0, c: mid }, e: { r: 0, c: mid + 2 } }, //company name
      { s: { r: 1, c: mid + 1 }, e: { r: 1, c: mid + 2 } }, //add
      { s: { r: 2, c: mid + 1 }, e: { r: 2, c: mid + 2 } }, //reg
      { s: { r: 3, c: mid + 1 }, e: { r: 3, c: mid + 2 } }, //contact
      { s: { r: 7, c: mid }, e: { r: 7, c: mid + 2 } },  // reportname

      //cols merge
      { s: { r: 12, c: 1 }, e: { r: 12, c: 7 } },//bill
      { s: { r: 12, c: 10 }, e: { r: 12, c: 11 } },//bill
      { s: { r: 12, c: 12 }, e: { r: 12, c: 15 } },//bill
  
      //row
      { s: { r: 12, c: 8 }, e: { r: 13, c: 8 } },//taxable
      { s: { r: 12, c: 9 }, e: { r: 13, c: 9 } },//nontaxable
      { s: { r: 12, c: 0 }, e: { r: 13, c: 0 } }];
    }
    else if (type == 'salesreturn') {
      merge = [{ s: { r: 0, c: mid }, e: { r: 0, c: mid + 2 } }, //company name
      { s: { r: 1, c: mid + 1 }, e: { r: 1, c: mid + 2 } }, //add
      { s: { r: 2, c: mid + 1 }, e: { r: 2, c: mid + 2 } }, //reg
      { s: { r: 3, c: mid + 1 }, e: { r: 3, c: mid + 2 } }, //contact
      { s: { r: 7, c: mid }, e: { r: 7, c: mid + 2 } },  // reportname
     //cols merge
     { s: { r: 12, c: 1 }, e: { r: 12, c: 7 } },//bill
     { s: { r: 12, c: 10 }, e: { r: 12, c: 11 } },//bill
     { s: { r: 12, c: 12 }, e: { r: 12, c: 15 } },//bill
      
  
     //row
     { s: { r: 12, c: 8 }, e: { r: 13, c: 8 } },//taxable
     { s: { r: 12, c: 9 }, e: { r: 13, c: 9 } },//nontaxable
     { s: { r: 12, c: 0 }, e: { r: 13, c: 0 } }];
    }
    else {
      merge = [{ s: { r: 0, c: mid }, e: { r: 0, c: mid + 2 } }, //company name
      { s: { r: 1, c: mid + 1 }, e: { r: 1, c: mid + 2 } }, //add
      { s: { r: 2, c: mid + 1 }, e: { r: 2, c: mid + 2 } }, //reg
      { s: { r: 3, c: mid + 1 }, e: { r: 3, c: mid + 2 } }, //contact
      { s: { r: 7, c: mid }, e: { r: 7, c: mid + 2 } },  // reportname
      //cols merge
      { s: { r: 12, c: 1 }, e: { r: 12, c: 8 } },//bill
      { s: { r: 12, c: 11 }, e: { r: 12, c: 12 } },//bill
      { s: { r: 12, c: 13 }, e: { r: 12, c: 14 } },//bill
      { s: { r: 12, c: 15 }, e: { r: 12, c: 16 } },//bill
  
      //row
      { s: { r: 12, c: 9 }, e: { r: 13, c: 9 } },//taxable
      { s: { r: 12, c: 10 }, e: { r: 13, c: 10 } },//nontaxable
      { s: { r: 12, c: 0 }, e: { r: 13, c: 0 } }];
    }

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
