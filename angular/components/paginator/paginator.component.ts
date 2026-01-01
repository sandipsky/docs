import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
})
export class PaginatorComponent {
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0;
  @Input() length: number = 0;

  @Output() pageChange: EventEmitter<{ pageIndex: number, pageSize: number, length: number }> = new EventEmitter();

  visiblePages: number[] = [];

  isOpen: boolean = false
  openTop = false;

  ngOnChanges() {
    this.updateVisiblePages();
  }

  onPageChange(): void {
    this.pageChange.emit({ pageIndex: this.pageIndex, pageSize: this.pageSize, length: this.length });
  }

  onchangePageOption(page: number) {
    this.pageSize = page;
    this.updateVisiblePages();
    this.onPageChange();
  }

  onPrevAndNext(direction: string) {
    direction == 'prev' ? this.pageIndex -= 1 : this.pageIndex += 1;
    this.updateVisiblePages();
    this.onPageChange();
  }

  goFirstPage() {
    this.pageIndex = 0;
    this.updateVisiblePages();
    this.onPageChange();
  }

  goLastpage() {
    this.pageIndex = this.calculateTotalPages() - 1;
    this.updateVisiblePages();
    this.onPageChange();
  }

  updateVisiblePages() {
    const totalPages = this.calculateTotalPages();
    const current = this.pageIndex + 1;

    let start = Math.max(current - 2, 1);
    let end = start + 4;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - 4, 1);
    }

    this.visiblePages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(index: number) {
    this.pageIndex = index;
    this.updateVisiblePages();
    this.onPageChange();
  }

  calculateTotalPages(): number {
    return this.length > 0 ? Math.ceil(this.length / this.pageSize) : 1;
  }
}
