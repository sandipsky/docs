import { Injectable } from '@angular/core';
import { NepaliDatepickerService } from 'np-datepicker-angular';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  constructor(
    private dateService: NepaliDatepickerService
  ) { }

  getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${year}/${month}/${day}`;
    return this.dateService.ADToBS(formattedDate, 'yyyy-mm-dd');
  }

  getTodayEnglishDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  transformEnglish(value:string) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    const formattedDate = `${year}-${month}-${day}, ${time}`
    return formattedDate;
  }
}
