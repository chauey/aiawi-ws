import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-market-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <div class="border-b border-border bg-card">
        <div class="container mx-auto px-6 py-6">
          <h1 class="text-2xl font-bold text-foreground">Market Analysis</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Analyze market trends, competitor performance, and opportunities
          </p>
        </div>
      </div>

      <!-- Content -->
      <div class="container mx-auto px-6 py-6">
        <div class="rounded-xl border border-border bg-card p-12 text-center">
          <p class="text-4xl">📈</p>
          <h2 class="mt-4 text-xl font-semibold text-foreground">
            Market Analysis
          </h2>
          <p class="mt-2 text-muted-foreground">
            Advanced market analysis features coming soon
          </p>
        </div>

        <!-- Quick Stats Grid -->
        <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl border border-border bg-card p-6">
            <p class="text-sm font-medium text-muted-foreground">Market Size</p>
            <p class="mt-2 text-2xl font-bold text-foreground">$24.5B</p>
            <p class="mt-1 text-sm text-green-600">+12.3% YoY</p>
          </div>
          <div class="rounded-xl border border-border bg-card p-6">
            <p class="text-sm font-medium text-muted-foreground">
              Active Players
            </p>
            <p class="mt-2 text-2xl font-bold text-foreground">1,234</p>
            <p class="mt-1 text-sm text-green-600">+5.2% MoM</p>
          </div>
          <div class="rounded-xl border border-border bg-card p-6">
            <p class="text-sm font-medium text-muted-foreground">
              Avg. Revenue
            </p>
            <p class="mt-2 text-2xl font-bold text-foreground">$450K</p>
            <p class="mt-1 text-sm text-muted-foreground">Per product</p>
          </div>
          <div class="rounded-xl border border-border bg-card p-6">
            <p class="text-sm font-medium text-muted-foreground">
              Growth Trend
            </p>
            <p class="mt-2 text-2xl font-bold text-foreground">↗️ Up</p>
            <p class="mt-1 text-sm text-green-600">Strong momentum</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class MarketPage {}
