import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numberToWords'
})
export class NumberToWordsPipe implements PipeTransform {
    transform(value: number): string {
        if (isNaN(value)) {
            return 'Invalid number';
        }
        const [rupees, paisa] = value.toFixed(2).split('.').map(Number);
        let words = this.numberToWords(rupees) + ' Rupees';
        if (paisa > 0) {
            words += ' and ' + this.numberToWords(paisa) + ' Paisa';
        }
        words += ' only';
        return words;
    }

    numberToWords(number: number): string {
        if(number == 0){
            return 'Zero';
        }

        let mapData = [
            { value: 10000000, str: "Crore" },
            { value: 100000, str: "Lakh" },
            { value: 1000, str: "Thousand" },
            { value: 100, str: "Hundred" },
            { value: 90, str: "Ninety" },
            { value: 80, str: "Eighty" },
            { value: 70, str: "Seventy" },
            { value: 60, str: "Sixty" },
            { value: 50, str: "Fifty" },
            { value: 40, str: "Forty" },
            { value: 30, str: "Thirty" },
            { value: 20, str: "Twenty" },
            { value: 19, str: "Nineteen" },
            { value: 18, str: "Eighteen" },
            { value: 17, str: "Seventeen" },
            { value: 16, str: "Sixteen" },
            { value: 15, str: "Fifteen" },
            { value: 14, str: "Fourteen" },
            { value: 13, str: "Thirteen" },
            { value: 12, str: "Twelve" },
            { value: 11, str: "Eleven" },
            { value: 10, str: "Ten" },
            { value: 9, str: "Nine" },
            { value: 8, str: "Eight" },
            { value: 7, str: "Seven" },
            { value: 6, str: "Six" },
            { value: 5, str: "Five" },
            { value: 4, str: "Four" },
            { value: 3, str: "Three" },
            { value: 2, str: "Two" },
            { value: 1, str: "One" }
        ];

        let result: string = '';
        for (let n of mapData) {
            if (number >= n.value) {
                if (number <= 99) {
                    result += n.str;
                    number -= n.value;
                    if (number > 0) result += ' ';
                } else {
                    let t = Math.floor(number / n.value);
                    let d = number % n.value;
                    if (d > 0) {
                        return this.numberToWords(t) + ' ' + n.str + ' ' + this.numberToWords(d);
                    } else {
                        return this.numberToWords(t) + ' ' + n.str;
                    }
                }
            }
        }
        return result;
    }
}
