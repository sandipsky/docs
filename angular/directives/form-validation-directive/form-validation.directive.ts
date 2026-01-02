import { Directive, ElementRef, HostBinding, OnInit, Renderer2, Self, Optional, OnDestroy, DoCheck, Input } from '@angular/core';
import { AbstractControl, NgControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[formControlName], [validationControl]', 
  standalone: true
})
export class FormValidationDirective implements OnInit, OnDestroy, DoCheck {
  @Input() useValidation: boolean = true;
  @Input() errorMessage: string = 'This field is required.';
  @Input() validationControl?: AbstractControl | null; // For manual components like ne-datepicker

  private statusSub?: Subscription;
  private errorDiv?: HTMLElement;
  private wasInvalid = false;

  constructor(
    @Self() @Optional() private control: NgControl,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    if (!this.useValidation) return;

    // Determine which control to use (Directive instance or Input)
    const activeControl = this.control?.control || this.validationControl;
    if (!activeControl) return;

    this.addAsteriskIfRequired(activeControl);
    this.createErrorElement();

    this.statusSub = activeControl.statusChanges?.subscribe(() => this.updateUI(activeControl));
  }

  ngDoCheck() {
    const activeControl = this.control?.control || this.validationControl;
    if (this.useValidation && activeControl) {
      this.updateUI(activeControl);
    }
  }

  private updateUI(control: AbstractControl) {
    const isInvalid = control.invalid && (control.dirty || control.touched) && control.errors?.['required'];

    if (isInvalid !== this.wasInvalid) {
      this.wasInvalid = isInvalid;
      if (isInvalid) {
        this.renderer.addClass(this.el.nativeElement, 'error');
        if (this.errorDiv) this.renderer.setStyle(this.errorDiv, 'display', 'block');
      } else {
        this.renderer.removeClass(this.el.nativeElement, 'error');
        if (this.errorDiv) this.renderer.setStyle(this.errorDiv, 'display', 'none');
      }
    }
  }

  private addAsteriskIfRequired(control: AbstractControl) {
    if (control.hasValidator(Validators.required)) {
      const parent = this.el.nativeElement.closest('.form-group');
      const label = parent?.querySelector('label');
      // Only add if not already there (prevents duplicates)
      if (label && !label.querySelector('.required-star')) {
        const star = this.renderer.createElement('span');
        this.renderer.setProperty(star, 'innerHTML', ' *');
        this.renderer.addClass(star, 'text-danger');
        this.renderer.addClass(star, 'required-star');
        this.renderer.appendChild(label, star);
      }
    }
  }

  private createErrorElement() {
    this.errorDiv = this.renderer.createElement('div');
    this.renderer.addClass(this.errorDiv, 'alert');
    this.renderer.addClass(this.errorDiv, 'error');
    this.renderer.setProperty(this.errorDiv, 'innerText', this.errorMessage);
    this.renderer.setStyle(this.errorDiv, 'display', 'none');
    
    const parent = this.el.nativeElement.parentNode;
    this.renderer.appendChild(parent, this.errorDiv);
  }

  ngOnDestroy() {
    this.statusSub?.unsubscribe();
    if (this.errorDiv) this.errorDiv.remove();
  }
}