import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule]
})
export class DropdownMenuComponent {
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  isOpen: boolean = false

  constructor(private el: ElementRef) { }

  toggleDropdown() {
    this.isOpen = !this.isOpen
  }

  closeDropdown() {
    console.log(true);
    this.isOpen = false;
  }
}
