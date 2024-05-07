import { Directive, Component, Input, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';


@Component({
  selector: 'app-custom-pagination',
  templateUrl: './custom-pagination.component.html',
  styleUrls: ['./custom-pagination.component.scss']
})
export class CustomPaginationComponent {
  @Input() pageSizeOptions: number[] = [25, 50, 100];
  @Input() pageSize: number = 25;
  @Input() pageIndex: number = 0;
  @Input() length: number = 0;

  @Output() pageChange: EventEmitter<{ pageIndex: number, pageSize: number, length: number }> = new EventEmitter();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const dropdownContent = document.querySelector('.dropdown-content');
    const dropdownButton = document.querySelector('.dropdown-btn');

    if (!dropdownContent?.contains(event.target as Node) && !dropdownButton?.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  isOpen: boolean = false

  constructor() { }

  onPageChange(): void {
    this.pageChange.emit({ pageIndex: this.pageIndex, pageSize: this.pageSize, length: this.length });
  }

  onchangePageOption(page: number) {
    this.pageSize = page;
    this.onPageChange();
  }

  onPrevAndNext(direction: string) {
    direction == 'prev' ? this.pageIndex -= 1 : this.pageIndex += 1;
    this.onPageChange();
  }

  goFirstPage() {
    this.pageIndex = 0;
    this.onPageChange();
  }

  goLastpage() {
    this.pageIndex = this.calculateTotalPages() - 1;
    this.onPageChange();
  }

  calculateTotalPages(): number {
    return this.length > 0 ? Math.ceil(this.length / this.pageSize) : 1;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen
  }

  closeDropdown() {
    console.log(true);
    this.isOpen = false;
  }
}
