// import { Directive, EventEmitter, Input, Output } from '@angular/core';

// export type SortColumn = keyof  any | '';
// export type SortDirection = 'asc' | 'desc' | '';

// const rotate: {[key: string]: SortDirection} = {
//   asc: 'desc',
//   desc: '',
//   '' : 'asc',
// };

// export const compare = (
//   v1: string | number | boolean | Date,
//   v2: string | number | boolean | Date,
// ) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

// export interface SortEvent {
//   column : SortColumn;
//   direction: SortDirection;
// }

// @Directive({
//   selector: 'th[sortable]',
//   host: {
//     '[class.asc]': 'direction === "asc"',
//     '[class.desc]': 'direction === "desc"',
//     '(click)': 'rotate()',
//   },
// })
// export class SortableHeaderDirective {

//   constructor() {
//   }

//   @Input() sortable: SortColumn = '';
//   @Input() direction: SortDirection = '';
//   @Output() sort = new EventEmitter<SortEvent>();

//   public rotate() : void {
//     this.direction = rotate[this.direction];
//     this.sort.emit({
//       column: this.sortable,
//       direction: this.direction
//     });
//   };

// }

import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';

export type SortColumn = keyof  any | '';
export type SortDirection = 'asc' | 'desc' | '';

export const compare = (
  v1: string | number | boolean | Date,
  v2: string | number | boolean | Date,
) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

export interface SortEvent {
  column : SortColumn;
  direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
})
export class SortableHeaderDirective {
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();
  static prevSortable: SortColumn = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click') onClick() {
    if(SortableHeaderDirective.prevSortable == this.sortable)
    {
      this.toggleSortDirection();
    }
    else 
    {
      SortableHeaderDirective.prevSortable = this.sortable;
      this.direction = 'asc';
    }
    this.sortChange();
    this.updateStatus();
  }

  updateStatus() {

    const siblings = this.el.nativeElement.parentElement.querySelectorAll('th[sortable]');
    siblings.forEach((sibling:any) => {
      if (sibling !== this.el.nativeElement) {
        const caretElement = sibling.querySelector('a');
        if (caretElement) {
          ['asc', 'desc', 'none'].forEach(className => {
            this.renderer.removeClass(caretElement, className);
          });
        }
      }
    });

    const caretElement = this.el.nativeElement.querySelector('a');

    if (caretElement) {
      ['asc', 'desc', 'none'].forEach(className => {
        this.renderer.removeClass(caretElement, className);
      });

      const directionClass = this.direction === 'asc' ? 'asc' :
                             this.direction === 'desc' ? 'desc' : 'none';
      this.renderer.addClass(caretElement, directionClass);
    }
  }

  private toggleSortDirection() {
    this.direction = this.direction === 'desc' ? '' : (this.direction === 'asc' ? 'desc' : 'asc');
  }

  private sortChange() {
    this.sort.emit({
      column: this.direction != '' ? this.sortable : '',
      direction: this.direction
    });
  }

}

