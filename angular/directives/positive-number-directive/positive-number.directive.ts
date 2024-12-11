import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appPositiveNumbers]'
})
export class PositiveNumbersDirective {
  @Input() allowZero: boolean = true;
  @Input() maxDecimals: number = 2;

  constructor() { }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: any) {
    const char = String.fromCharCode(event.charCode);
    const inputValue = event.target.value;

    const decimalPart = this.maxDecimals > 0 ? `\\.\\d{0,${this.maxDecimals}}` : '';
    const regExpString = this.allowZero
      ? `^([0-9]\\d*)(?:${decimalPart})?$`
      : `^([1-9]\\d*)(?:${decimalPart})?$`;
    const reg = new RegExp(regExpString);
    const newValue = inputValue + char;

    if (!reg.test(newValue)) {
      event.preventDefault();
    }
  }
}
