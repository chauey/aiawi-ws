import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickView } from '../models/product.model';

interface QuickViewCounts {
  all: number;
  ourProducts: number;
  competitors: number;
  recommended: number;
}

@Component({
  selector: 'lib-quick-view-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-4 flex flex-wrap gap-2">
      <button (click)="viewChange.emit('all')" [class]="getButtonClass('all')">
        All
        <span [class]="getBadgeClass('all')">{{ counts.all }}</span>
      </button>
      <button
        (click)="viewChange.emit('our-products')"
        [class]="getButtonClass('our-products')"
      >
        🚀 Our Products
        <span [class]="getBadgeClass('our-products')">{{
          counts.ourProducts
        }}</span>
      </button>
      <button
        (click)="viewChange.emit('competitors')"
        [class]="getButtonClass('competitors')"
      >
        ⚔️ Competitors
        <span [class]="getBadgeClass('competitors')">{{
          counts.competitors
        }}</span>
      </button>
      <button
        (click)="viewChange.emit('recommended')"
        [class]="getButtonClass('recommended')"
      >
        ⭐ Recommended
        <span [class]="getBadgeClass('recommended')">{{
          counts.recommended
        }}</span>
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class QuickViewBarComponent {
  @Input() activeView: QuickView = 'all';
  @Input() counts: QuickViewCounts = {
    all: 0,
    ourProducts: 0,
    competitors: 0,
    recommended: 0,
  };
  @Output() viewChange = new EventEmitter<QuickView>();

  getButtonClass(view: QuickView): string {
    const base =
      'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all';
    if (this.activeView === view) {
      return `${base} bg-primary text-primary-foreground`;
    }
    return `${base} border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground`;
  }

  getBadgeClass(view: QuickView): string {
    const base =
      'inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold';
    if (this.activeView === view) {
      return `${base} bg-primary-foreground/20`;
    }
    return `${base} bg-muted text-muted-foreground`;
  }
}
