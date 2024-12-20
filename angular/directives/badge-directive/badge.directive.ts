import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[appBadge]'
})
export class BadgeDirective {
  @Input() badgeContent: string | number = '0';
  @Input() badgeColor: string = 'red';
  @Input() badgeWidth?: string = '20';
  @Input() badgeHeight?: string = '20';
  private badgeElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['badgeContent'] || changes['badgeColor']) {
      this.updateBadge();
    }
  }

  private updateBadge(): void {
    if (!this.badgeElement) {
      this.createBadge();
    }
    this.renderer.setProperty(this.badgeElement, 'textContent', this.badgeContent);
    this.updateBadgeColor();
  }

  private createBadge(): void {
    this.badgeElement = this.renderer.createElement('span');
    this.renderer.appendChild(this.el.nativeElement, this.badgeElement);
    this.renderer.setStyle(this.badgeElement, 'position', 'absolute');
    this.renderer.setStyle(this.badgeElement, 'top', '-10px');
    this.renderer.setStyle(this.badgeElement, 'right', '-10px');
    this.renderer.setStyle(this.badgeElement, 'border-radius', '50%');
    this.renderer.setStyle(this.badgeElement, 'display', 'flex');
    this.renderer.setStyle(this.badgeElement, 'justify-content', 'center');
    this.renderer.setStyle(this.badgeElement, 'align-items', 'center');
    this.renderer.setStyle(this.badgeElement, 'width', `${this.badgeWidth}px`);
    this.renderer.setStyle(this.badgeElement, 'height', `${this.badgeHeight}px`);
    this.renderer.setStyle(this.badgeElement, 'background-color', `${this.badgeColor}`);
    this.renderer.setStyle(this.badgeElement, 'color', 'white');
    this.renderer.setStyle(this.badgeElement, 'font-size', '12px');
    this.renderer.setStyle(this.badgeElement, 'pointer-events', 'none');
    this.renderer.setStyle(this.badgeElement, 'z-index', '10');
  }

  private updateBadgeColor(): void {
    if (this.badgeElement) {
      this.renderer.setStyle(this.badgeElement, 'background-color', `${this.badgeColor}`);
    }
  }
}
