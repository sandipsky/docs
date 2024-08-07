import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appDateInput]'
})
export class DateInputDirective {
  @Input('appDateInput') dateFormat: string = 'yyyy-mm-dd';

  constructor() { }
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!/[0-9]/.test(event.key) && event.key !== 'Backspace') {
      event.preventDefault();
      return;
    }

    //FOrmat start
    if (this.dateFormat == 'mm/yyyy' || this.dateFormat == 'mm-yyyy') {
      if (value.length === 0 && (event.key !== '0' && event.key !== '1')) {
        event.preventDefault();
        return;
      }

      if (value.length === 1) {
        if (value === '0' && !/[1-9]/.test(event.key) && event.key !== 'Backspace') {
          event.preventDefault();
          return;
        }
        if (value === '1' && !/[0-2]/.test(event.key) && event.key !== 'Backspace') {
          event.preventDefault();
          return;
        }
      }

      if (value.length === 1 && event.key !== 'Backspace') {
        setTimeout(() => {
          this.dateFormat == 'mm/yyyy' ? input.value = value + event.key + '/' : input.value = value + event.key + '-';
          event.preventDefault();
        }, 0);
      }

      if (value.length >= 7 && event.key !== 'Backspace') {
        event.preventDefault();
        return;
      }
    }
    //FOrmat end 

    //FOrmat start
    if (this.dateFormat == 'dd/mm/yyyy' || this.dateFormat == 'dd-mm-yyyy') {
      if (value.length === 0 && (event.key !== '0' && event.key !== '1' && event.key !== '2' && event.key !== '3')) {
        event.preventDefault();
        return;
      }

      if (value.length === 1) {
        if ((value === '0' || value === '1' || value === '2') && !/[0-9]/.test(event.key) && event.key !== 'Backspace') {
          event.preventDefault();
          return;
        }
        if (value === '3' && !/[0-2]/.test(event.key) && event.key !== 'Backspace') {
          event.preventDefault();
          return;
        }
      }

      if (value.length === 1 && event.key !== 'Backspace') {
        setTimeout(() => {
          this.dateFormat == 'dd/mm/yyyy' ? input.value = value + event.key + '/' : input.value = value + event.key + '-';
          event.preventDefault();
        }, 0);
      }

      if (value.length === 3 && (event.key !== '0' && event.key !== '1' && event.key !== 'Backspace')) {
        event.preventDefault();
        return;
      }

      if (value.length === 4) {
        if (value[3] === '0' && !/[1-9]/.test(event.key) && event.key !== 'Backspace') {
          event.preventDefault();
          return;
        }
        if (value[3] === '1' && !/[0-2]/.test(event.key) && event.key !== 'Backspace') {
          event.preventDefault();
          return;
        }
      }

      if (value.length === 4 && event.key !== 'Backspace') {
        setTimeout(() => {
          this.dateFormat == 'dd/mm/yyyy' ? input.value = value + event.key + '/' : input.value = value + event.key + '-';
          event.preventDefault();
        }, 0);
      }



      if (value.length >= 10 && event.key !== 'Backspace') {
        event.preventDefault();
        return;
      }
    }
    //FOrmat end 

    //FOrmat start
    if (this.dateFormat == 'yyyy/mm/dd' || this.dateFormat == 'yyyy-mm-dd') {
      //separator 
      if (value.length === 3 && event.key !== 'Backspace') {
        setTimeout(() => {
          this.dateFormat == 'yyyy/mm/dd' ? input.value = value + event.key + '/' : input.value = value + event.key + '-';
          event.preventDefault();
        }, 0);
      }
      //separator 

      //month start
      if (value.length === 5 && (event.key !== '0' && event.key !== '1' && event.key !== 'Backspace')) {
        event.preventDefault();
        return;
      }

      if (value.length === 6) {
        if (value[5] === '0' && !/[1-9]/.test(event.key) && event.key !== 'Backspace') {
          event.preventDefault();
          return;
        }
        if (value[5] === '1' && !/[0-2]/.test(event.key) && event.key !== 'Backspace') {
          event.preventDefault();
          return;
        }
      }
      //month end

      //separator 
      if (value.length === 6 && event.key !== 'Backspace') {
        setTimeout(() => {
          this.dateFormat == 'yyyy/mm/dd' ? input.value = value + event.key + '/' : input.value = value + event.key + '-';
          event.preventDefault();
        }, 0);
      }
      //separator 

      //day
      if (value.length === 8 && (event.key !== '0' && event.key !== '1' && event.key !== '2' && event.key !== '3')) {
        event.preventDefault();
        return;
      }

      if (value.length === 9) {
        if ((value[8] === '0' || value === '1' || value === '2') && !/[0-9]/.test(event.key) && event.key !== 'Backspace') {
          event.preventDefault();
          return;
        }
        if (value[8] === '3' && !/[0-2]/.test(event.key) && event.key !== 'Backspace') {
          event.preventDefault();
          return;
        }
      }
      //day

      if (value.length >= 10 && event.key !== 'Backspace') {
        event.preventDefault();
        return;
      }
    }
    //FOrmat end 
  }
}
