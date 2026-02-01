import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductIntelligenceStore } from '../store/product-intelligence.store';

@Component({
  selector: 'lib-companies-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <div class="border-b border-border bg-card">
        <div class="container mx-auto px-6 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-foreground">Companies</h1>
              <p class="mt-1 text-sm text-muted-foreground">
                Track companies and their product portfolios
              </p>
            </div>
            <button
              class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span>+</span> Add Company
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="container mx-auto px-6 py-6">
        @if (store.loading()) {
          <div
            class="flex h-64 items-center justify-center rounded-xl border border-border bg-card"
          >
            <div class="text-center">
              <div
                class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
              ></div>
              <p class="mt-4 text-muted-foreground">Loading companies...</p>
            </div>
          </div>
        } @else {
          <!-- Companies Grid -->
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @for (company of store.companies(); track company.id) {
              <div
                class="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md"
              >
                <div class="flex items-start justify-between">
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl"
                  >
                    🏢
                  </div>
                  @if (company.productCount) {
                    <span
                      class="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {{ company.productCount }} products
                    </span>
                  }
                </div>
                <h3 class="mt-4 text-lg font-semibold text-foreground">
                  {{ company.name }}
                </h3>
                @if (company.description) {
                  <p class="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {{ company.description }}
                  </p>
                }
                <div class="mt-4 flex flex-wrap gap-2">
                  @if (company.industry) {
                    <span
                      class="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600"
                    >
                      {{ company.industry }}
                    </span>
                  }
                  @if (company.size) {
                    <span
                      class="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {{ company.size }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class CompaniesPage implements OnInit {
  readonly store = inject(ProductIntelligenceStore);

  ngOnInit() {
    if (!this.store.isLoaded()) {
      this.store.loadData();
    }
  }
}
