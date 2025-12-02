import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { DropdownsService } from 'src/app/services/dropdowns.service';

@Component({
  selector: 'filter-section',
  templateUrl: './filter-section.component.html',
  styleUrls: ['./filter-section.component.scss']
})
export class FilterSectionComponent {
  filterList: any[] = [];
  // selectedFilter: any = null;
  showFilterDropdown: boolean = false;
  searchText: string = '';
  searchTerm: string = '';
  isSearching: boolean = false;
  searchTimer: any;
  userList: any[] = [];

  @Input() filterColumns: any[] = [];
  @Input() searchBy: string = '';
  @Output() onFilterChange: EventEmitter<any[]> = new EventEmitter();

  constructor(private elRef: ElementRef, private dropDownService: DropdownsService,) { }

  applyFilter(filter?: any) {
    this.filterColumns.forEach(filter => {
      if (filter.value) {
        let activeFilter = {
          filterName: filter.name,
          formcontrolName: filter.formcontrolName,
          displayValue: filter.type == 'select' || filter.type == 'search-select' ? filter?.data?.find((item: any) => item?.id == filter?.value)?.name : filter.value,
          value: filter.value
        }
        this.filterList.push(activeFilter);
      }
    })

    this.showFilterDropdown = false;
    this.emitFilterList();
  }

  onSearch() {
    let activeFilter = {
      formcontrolName: this.searchBy,
      displayValue: this.searchText,
      value: this.searchText
    }
    this.showFilterDropdown = false;
    this.filterList.some(item => item.formcontrolName === this.searchBy && item.value === this.searchText) ? null : this.filterList.push(activeFilter);
    this.emitFilterList();
    this.searchText = '';
  }

  getUsers(event: any, type?: string) {
    clearTimeout(this.searchTimer);
    this.searchTerm = event.target.value.trim();
    this.isSearching = true;
    this.userList = [];
    this.searchTimer = setTimeout(() => {
      if (this.searchTerm !== '') {
        this.isSearching = true;
        this.dropDownService.getAllRepresentativeDropDown(this.searchTerm, 0, 0).subscribe((result: any) => {
          this.userList = result.filter((it: any) => it?.name?.toLowerCase()?.includes(this.searchTerm?.toLowerCase()));
          this.isSearching = false;
        });
      }
      else {
        this.isSearching = false;
      }
    }, 1000);
  }

  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  closeDropdown() {
    this.showFilterDropdown = false;
  }

  removeFilter(filter: any) {
    this.filterList = this.filterList.filter(item => item != filter);
    this.filterColumns.forEach(item => {
      if (item.name == filter.filterName) {
        item.value = null;
      }
    });
    this.emitFilterList();
  }

  removeAllFilter() {
    this.filterList = [];
    this.filterColumns.forEach(item => item.value = null);
    this.emitFilterList();
  }

  emitFilterList() {
    let finalList: any[] = [];
    this.filterList.forEach(filter => {
      finalList.push({
        field: filter.formcontrolName,
        value: filter?.value ? String(filter.value) : '',
        displayValue: filter?.displayValue
      })
    })
    console.log(finalList)
    this.onFilterChange.emit(finalList);
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.contains(target) &&
      !target.closest('.ng-dropdown-panel')) {
      this.showFilterDropdown = false;
    }
  }
}
