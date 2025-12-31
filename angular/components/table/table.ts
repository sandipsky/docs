import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SortEvent } from '../sortable-directive/sortable-header.directive';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-table',
  imports: [CommonModule, DropdownMenuComponent, MatTooltipModule],
  templateUrl: './table.html',
  standalone: true
})
export class Table {
  @Input() tableHeaders: any[] = [];
  @Input() tableData: any[] = [];
  @Input() filterData: any = {
    pageIndex: 0,
    pageSize: 25
  };
  @Input() actions: string[] = [];
  @Input() actionMode: string = 'inline';
  @Input() hasEditPermission: boolean = true;
  @Input() hasDeletePermission: boolean = true;
  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onChange = new EventEmitter<any>();
  @Output() onStatusChange = new EventEmitter<any>();
  @Output() onView = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  onSort(event: SortEvent) {
    this.sortChange.emit(event);
  }

  getRemainingItems(items: any[], maxItems: number): string {
    return items
      .slice(maxItems)
      .map(i => i.name)
      .join(', ');
  }
}
