import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'amount'
})
export class AmountPipe implements PipeTransform {
  transform(value: any, showComma: boolean = true): unknown {
    if (typeof value !== 'number') {
      return '0.00';
    }
    const roundedValue = Number(value.toFixed(2));
    const formatOptions: Intl.NumberFormatOptions = {
      style: 'decimal',
      useGrouping: showComma,  
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
    const formattedValue = new Intl.NumberFormat('en-IN', formatOptions).format(roundedValue);
    return formattedValue;
  }
}
