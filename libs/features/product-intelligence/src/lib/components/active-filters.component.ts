import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductFilter } from '../models/product.model';

interface FilterTag {
  label: string;
  key: keyof ProductFilter;
}

@Component({
  selector: 'lib-active-filters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3"
    >
      <span class="text-sm text-muted-foreground">
        Showing {{ visibleCount }} of {{ totalCount }} products
      </span>
      <span class="text-muted-foreground">|</span>

      @for (filter of filters; track filter.key) {
        <span
          class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
        >
          {{ filter.label }}
          <button
            (click)="removeFilter.emit(filter.key)"
            class="ml-1 hover:text-primary/70"
          >
            ×
          </button>
        </span>
      }

      <button
        (click)="clearAll.emit()"
        class="ml-2 text-sm text-muted-foreground underline hover:text-foreground"
      >
        Clear all
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ActiveFiltersComponent {
  @Input() filters: FilterTag[] = [];
  @Input() visibleCount = 0;
  @Input() totalCount = 0;
  @Output() removeFilter = new EventEmitter<keyof ProductFilter>();
  @Output() clearAll = new EventEmitter<void>();
}
