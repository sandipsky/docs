import { Directive, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appFormError]'
})
export class InputValidatorDirective {

  private subscription!: Subscription | null;
  private observer: MutationObserver;
  flag: boolean = true;

  constructor(private el: ElementRef) {
    this.observer = new MutationObserver(mutationsList => {
      mutationsList.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class' ) {
          if (el.nativeElement.classList.contains('is-invalid') && this.flag == true) {
            this.showError();
          } else {
            this.hideError();
          }
        }
      });
    });

    // Configure and start observing class attribute changes
    this.observer.observe(this.el.nativeElement, { attributes: true });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private showError() {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = 'This field is required';
    errorDiv.classList.add('invalid');
    this.el.nativeElement.parentNode.insertBefore(errorDiv, this.el.nativeElement.nextSibling);
    this.flag = false;
  }

  private hideError() {
    const errorMessage = this.el.nativeElement.parentNode.querySelector('.invalid');
    if (errorMessage) {
      errorMessage.remove();
    }
    this.flag = true;
  }
}
