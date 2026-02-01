import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductFilter, ProductSort } from '../models/product.model';

@Component({
  selector: 'lib-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4"
    >
      <!-- Search -->
      <div class="flex-1">
        <input
          type="text"
          [ngModel]="filter.search"
          (ngModelChange)="searchChange.emit($event)"
          placeholder="🔍 Search products..."
          class="w-full min-w-[200px] max-w-[300px] rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <!-- Category Select -->
      <select
        [ngModel]="filter.category || ''"
        (ngModelChange)="onFilterChange('category', $event || null)"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">All Categories</option>
        <option value="Game">🎮 Games</option>
        <option value="AI Agent">🤖 AI Agents</option>
        <option value="Online Course">📚 Courses</option>
        <option value="SaaS Application">💻 SaaS</option>
        <option value="Mobile App">📱 Mobile</option>
        <option value="Web Application">🌐 Web Apps</option>
      </select>

      <!-- Relationship Select -->
      <select
        [ngModel]="filter.relationship || ''"
        (ngModelChange)="onFilterChange('relationship', $event || null)"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">All Relations</option>
        <option value="Our Product">🚀 Our Products</option>
        <option value="Competitor">⚔️ Competitors</option>
        <option value="Reference">📚 Reference</option>
        <option value="Inspiration">💡 Inspiration</option>
      </select>

      <!-- Status Select -->
      <select
        [ngModel]="filter.status || ''"
        (ngModelChange)="onFilterChange('status', $event || null)"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">All Statuses</option>
        <option value="Growing">🚀 Growing</option>
        <option value="Mature">✅ Mature</option>
        <option value="Beta">🧪 Beta</option>
        <option value="In Development">🔧 In Development</option>
        <option value="Concept">💡 Concept</option>
        <option value="Launched">🎉 Launched</option>
      </select>

      <!-- Sort Select -->
      <select
        [ngModel]="filter.sort"
        (ngModelChange)="sortChange.emit($event)"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        <option value="priority-desc">Priority ↓</option>
        <option value="priority-asc">Priority ↑</option>
        <option value="name-asc">Name A-Z</option>
        <option value="name-desc">Name Z-A</option>
        <option value="users-desc">Users ↓</option>
        <option value="revenue-desc">Revenue ↓</option>
      </select>

      <!-- Toggle Buttons -->
      <div class="flex items-center gap-2">
        <button
          (click)="recommendedToggle.emit()"
          [class]="getToggleClass(filter.recommendedOnly)"
          title="Recommended Only"
        >
          ⭐
        </button>
        <button
          (click)="freeTierToggle.emit()"
          [class]="getToggleClass(filter.hasFreeTier)"
          title="Has Free Tier"
        >
          🆓
        </button>
      </div>

      <!-- Clear Button -->
      <button
        (click)="clearAll.emit()"
        class="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
        title="Clear All Filters"
      >
        🗑️
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class FilterBarComponent {
  @Input() filter!: ProductFilter;
  @Output() filterChange = new EventEmitter<Partial<ProductFilter>>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<ProductSort>();
  @Output() recommendedToggle = new EventEmitter<void>();
  @Output() freeTierToggle = new EventEmitter<void>();
  @Output() clearAll = new EventEmitter<void>();

  onFilterChange(key: keyof ProductFilter, value: unknown) {
    this.filterChange.emit({ [key]: value });
  }

  getToggleClass(active: boolean): string {
    const base =
      'flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all';
    if (active) {
      return `${base} bg-primary text-primary-foreground`;
    }
    return `${base} border border-border bg-background hover:bg-muted`;
  }
}
