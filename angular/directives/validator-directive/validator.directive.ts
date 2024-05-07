import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appPositiveNumbers]'
})
export class PositiveNumbersDirective {

  constructor() { }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: any) {
    const reg = /^\d*\.?\d{0,2}$/g;
    let input = event.target['value'] + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

}
