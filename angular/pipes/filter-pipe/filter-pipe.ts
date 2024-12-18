import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, fieldNames: string[]): any[] {
    if (!items) return [];
    if (!searchText) return items;
    if (!fieldNames || fieldNames.length === 0) return items;

    searchText = searchText.toLowerCase();

    return items.filter(item =>
      fieldNames.some(field =>
        item[field]?.toString().toLowerCase().includes(searchText)
      )
    );
  }
}