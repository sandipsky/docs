import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss']
})
export class DropdownMenuComponent {

  @Input() mode: 'left' | 'right' = 'left';
  @Input() closeOnItemClick = true;
  @Input() modalMode = false;
  @ViewChild('content') content!: ElementRef<HTMLElement>;

  isOpen = false;
  openTop = false;

  constructor(private host: ElementRef) { }

  toggle(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      setTimeout(() => this.calculatePosition());
    }
  }

  private calculatePosition(): void {
    if (!this.content) return;

    const rect = this.content.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;

    this.openTop = spaceBelow < 120;
  }

  close(): void {
    this.isOpen = false;
    this.openTop = false;
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}
