import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appPositiveNumbers]'
})
export class PositiveNumbersDirective {
  
  @Input() allowZero: boolean = false;  // Flag to allow or disallow 0

  constructor() { }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: any) {
    const reg = this.allowZero 
      ? /^(0|[1-9]\d*)(\.\d{0,2})?$/g   // Allow 0 if flag is true
      : /^([1-9]\d*)(\.\d{0,2})?$/g;     // Do not allow 0 if flag is false

    let input = event.target['value'] + String.fromCharCode(event.charCode);
    
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }
}
