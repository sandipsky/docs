import { Component, ElementRef, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent {
  @Input() headerName: string = 'test';
  @Input() isOpen: boolean = false;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['isOpen']) {
      this.toggleAccordian();
    }
  }

  toggleAccordian() {
    const element = this.elementRef.nativeElement.querySelector('.accordion');
    element.classList.toggle("active");
    const panel = element.nextElementSibling;
    panel.classList.toggle("active");
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  }


}
