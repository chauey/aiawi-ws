import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product.model';

@Component({
  selector: 'lib-product-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <table class="w-full">
        <thead class="border-b border-border bg-muted/50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Product
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Category
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Relationship
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Status
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Priority
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          @for (product of products; track product.id) {
            <tr
              (click)="selectProduct.emit(product)"
              class="cursor-pointer transition-colors hover:bg-muted/50"
              [class.bg-primary/5]="selectedProduct?.id === product.id"
            >
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg"
                  >
                    {{ getCategoryIcon(product.category) }}
                  </div>
                  <div>
                    <div class="font-medium text-foreground">
                      {{ product.name }}
                      @if (product.recommendedForStudy) {
                        <span class="ml-1">⭐</span>
                      }
                    </div>
                    @if (product.description) {
                      <div
                        class="max-w-xs truncate text-sm text-muted-foreground"
                      >
                        {{ product.description }}
                      </div>
                    }
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span
                  class="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"
                >
                  {{ getCategoryIcon(product.category) }}
                  {{ product.category }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span [class]="getRelationshipClass(product.relationship)">
                  {{ product.relationship }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span [class]="getStatusClass(product.status)">
                  {{ product.status }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center gap-2">
                  <div
                    class="h-2 w-16 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      class="h-full bg-primary"
                      [style.width.%]="(product.priorityScore || 0) * 10"
                    ></div>
                  </div>
                  <span class="text-sm text-muted-foreground">
                    {{ product.priorityScore || 0 }}
                  </span>
                </div>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right">
                <button
                  class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="View details"
                >
                  👁️
                </button>
                <button
                  class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Edit"
                >
                  ✏️
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ProductTableComponent {
  @Input() products: Product[] = [];
  @Input() selectedProduct: Product | null = null;
  @Output() selectProduct = new EventEmitter<Product>();

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      Game: '🎮',
      'AI Agent': '🤖',
      'Online Course': '📚',
      'SaaS Application': '💻',
      'Mobile App': '📱',
      'Web Application': '🌐',
      'Family App': '👨‍👩‍👧‍👦',
    };
    return icons[category] || '📦';
  }

  getRelationshipClass(relationship: string): string {
    const base =
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
    switch (relationship) {
      case 'Our Product':
        return `${base} bg-green-500/10 text-green-600`;
      case 'Competitor':
        return `${base} bg-orange-500/10 text-orange-600`;
      case 'Reference':
        return `${base} bg-blue-500/10 text-blue-600`;
      case 'Inspiration':
        return `${base} bg-purple-500/10 text-purple-600`;
      default:
        return `${base} bg-muted text-muted-foreground`;
    }
  }

  getStatusClass(status: string): string {
    const base =
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
    switch (status) {
      case 'Growing':
        return `${base} bg-green-500/10 text-green-600`;
      case 'Mature':
        return `${base} bg-blue-500/10 text-blue-600`;
      case 'Beta':
        return `${base} bg-yellow-500/10 text-yellow-600`;
      case 'In Development':
        return `${base} bg-orange-500/10 text-orange-600`;
      case 'Concept':
        return `${base} bg-purple-500/10 text-purple-600`;
      case 'Launched':
        return `${base} bg-teal-500/10 text-teal-600`;
      default:
        return `${base} bg-muted text-muted-foreground`;
    }
  }
}
