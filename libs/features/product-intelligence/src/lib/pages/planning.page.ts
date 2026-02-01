import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-planning-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <div class="border-b border-border bg-card">
        <div class="container mx-auto px-6 py-6">
          <h1 class="text-2xl font-bold text-foreground">Planning</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Roadmap, feature planning, and strategic initiatives
          </p>
        </div>
      </div>

      <!-- Content -->
      <div class="container mx-auto px-6 py-6">
        <div class="rounded-xl border border-border bg-card p-12 text-center">
          <p class="text-4xl">📋</p>
          <h2 class="mt-4 text-xl font-semibold text-foreground">
            Product Planning
          </h2>
          <p class="mt-2 text-muted-foreground">
            Strategic planning tools coming soon
          </p>
        </div>

        <!-- Planning Sections -->
        <div class="mt-8 grid gap-6 lg:grid-cols-2">
          <div class="rounded-xl border border-border bg-card p-6">
            <h3 class="text-lg font-semibold text-foreground">
              🎯 Q1 Objectives
            </h3>
            <ul class="mt-4 space-y-3">
              <li class="flex items-center gap-3">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-600"
                  >✓</span
                >
                <span class="text-foreground">Launch Dragon Legends v2.0</span>
              </li>
              <li class="flex items-center gap-3">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-600"
                  >◐</span
                >
                <span class="text-foreground"
                  >Complete AI Course Platform MVP</span
                >
              </li>
              <li class="flex items-center gap-3">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  >○</span
                >
                <span class="text-muted-foreground"
                  >Expand to mobile platforms</span
                >
              </li>
            </ul>
          </div>
          <div class="rounded-xl border border-border bg-card p-6">
            <h3 class="text-lg font-semibold text-foreground">
              📊 Key Metrics to Track
            </h3>
            <ul class="mt-4 space-y-3">
              <li class="flex items-center justify-between">
                <span class="text-muted-foreground">Monthly Active Users</span>
                <span class="font-medium text-foreground">Target: 100K</span>
              </li>
              <li class="flex items-center justify-between">
                <span class="text-muted-foreground">Revenue Growth</span>
                <span class="font-medium text-foreground">Target: +25%</span>
              </li>
              <li class="flex items-center justify-between">
                <span class="text-muted-foreground">Product Launches</span>
                <span class="font-medium text-foreground">Target: 3</span>
              </li>
            </ul>
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
export class PlanningPage {}
