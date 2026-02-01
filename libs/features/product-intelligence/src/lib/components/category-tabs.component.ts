import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCategory } from '../models/product.model';

interface CategoryCounts {
  games: number;
  aiAgents: number;
  courses: number;
  saas: number;
  mobile: number;
}

@Component({
  selector: 'lib-category-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-4 flex flex-wrap gap-1 border-b border-border pb-3">
      <button (click)="categoryChange.emit(null)" [class]="getTabClass(null)">
        All
      </button>
      <button
        (click)="categoryChange.emit('Game')"
        [class]="getTabClass('Game')"
      >
        🎮 Games
      </button>
      <button
        (click)="categoryChange.emit('AI Agent')"
        [class]="getTabClass('AI Agent')"
      >
        🤖 AI Agents
      </button>
      <button
        (click)="categoryChange.emit('Online Course')"
        [class]="getTabClass('Online Course')"
      >
        📚 Courses
      </button>
      <button
        (click)="categoryChange.emit('SaaS Application')"
        [class]="getTabClass('SaaS Application')"
      >
        💻 SaaS
      </button>
      <button
        (click)="categoryChange.emit('Mobile App')"
        [class]="getTabClass('Mobile App')"
      >
        📱 Mobile
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class CategoryTabsComponent {
  @Input() activeCategory: ProductCategory | null = null;
  @Input() counts: CategoryCounts = {
    games: 0,
    aiAgents: 0,
    courses: 0,
    saas: 0,
    mobile: 0,
  };
  @Output() categoryChange = new EventEmitter<ProductCategory | null>();

  getTabClass(category: ProductCategory | null): string {
    const base = 'rounded-md px-3 py-1.5 text-sm font-medium transition-all';
    if (this.activeCategory === category) {
      return `${base} bg-primary text-primary-foreground`;
    }
    return `${base} text-muted-foreground hover:bg-muted hover:text-foreground`;
  }
}
