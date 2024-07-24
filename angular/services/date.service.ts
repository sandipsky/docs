import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';

@Injectable({
    providedIn: 'root'
})
export class ExcelService {
    dateInput(event: any): void {
        const input = event.target as HTMLInputElement;
        const value = input.value;

        // Allow only numbers and '/'
        if (!/[0-9]/.test(event.key) && event.key !== 'Backspace') {
            event.preventDefault();
            return;
        }

        // Restrict first digit to 0 or 1
        if (value.length === 0 && (event.key !== '0' && event.key !== '1')) {
            event.preventDefault();
            return;
        }

        // Restrict second digit based on the first digit
        if (value.length === 1) {
            if (value === '0' && !/[1-9]/.test(event.key)) {
                event.preventDefault();
                return;
            }
            if (value === '1' && !/[0-2]/.test(event.key)) {
                event.preventDefault();
                return;
            }
        }

        // Automatically insert '/' after entering two digits for the month
        if (value.length === 1 && event.key !== 'Backspace') {
            setTimeout(() => {
                input.value = value + event.key + '/';
                event.preventDefault();
            }, 0);
        }

        // Prevent more input if the format is MM/YYYY
        if (value.length >= 7 && event.key !== 'Backspace') {
            event.preventDefault();
            return;
        }
    }

    getLastDayOfMonth(year: string | number, month: string | number) {
        const yy = Number(year);
        const mm = Number(month);
        const date = new Date(yy, mm, 0);
        return date.getDate();
    }
}
