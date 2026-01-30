import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    RouterLinkActive,
    HlmButtonImports,
    HlmBadgeImports,
  ],
  template: `
    <div class="flex min-h-screen bg-background">
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen()"
      >
        <!-- Logo -->
        <div class="flex h-14 items-center border-b px-4">
          <a routerLink="/" class="flex items-center gap-2 font-bold text-lg">
            <span>🎮</span>
            <span>Game Manager</span>
          </a>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-1">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-primary text-primary-foreground"
              class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              <span>{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t">
          <div
            class="flex items-center justify-between text-xs text-muted-foreground"
          >
            <span>v1.0.0</span>
            <span hlmBadge [variant]="apiStatus() ? 'default' : 'destructive'">
              {{ apiStatus() ? '🟢 Online' : '🔴 Offline' }}
            </span>
          </div>
        </div>
      </aside>

      <!-- Overlay for mobile -->
      @if (sidebarOpen()) {
        <div
          role="button"
          tabindex="0"
          aria-label="Close sidebar"
          class="fixed inset-0 z-40 bg-black/50 lg:hidden"
          (click)="sidebarOpen.set(false)"
          (keydown.enter)="sidebarOpen.set(false)"
          (keydown.escape)="sidebarOpen.set(false)"
        ></div>
      }

      <!-- Main content -->
      <div class="flex-1 lg:ml-64">
        <!-- Header -->
        <header
          class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4"
        >
          <button
            hlmBtn
            variant="ghost"
            size="icon"
            class="lg:hidden"
            (click)="sidebarOpen.set(!sidebarOpen())"
          >
            ☰
          </button>

          <div class="flex-1"></div>

          <!-- Theme Toggle -->
          <button
            hlmBtn
            variant="ghost"
            size="icon"
            (click)="toggleTheme()"
            [attr.aria-label]="
              isDark() ? 'Switch to light mode' : 'Switch to dark mode'
            "
          >
            {{ isDark() ? '🌙' : '☀️' }}
          </button>

          <!-- API Status -->
          <span
            hlmBadge
            [variant]="apiStatus() ? 'outline' : 'destructive'"
            class="hidden sm:inline-flex"
          >
            {{ apiStatus() ? '🟢 API Connected' : '🔴 API Offline' }}
          </span>
        </header>

        <!-- Page Content -->
        <main class="p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class App implements OnInit {
  isDark = signal(true);
  apiStatus = signal(false);
  sidebarOpen = signal(false);

  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/games', label: 'Games', icon: '🎮' },
    { path: '/competitors', label: 'Competitors', icon: '🏆' },
    { path: '/features', label: 'Features', icon: '⚡' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  ngOnInit() {
    document.documentElement.classList.add('dark');
    this.checkApiStatus();
    setInterval(() => this.checkApiStatus(), 30000);
  }

  toggleTheme() {
    this.isDark.update((v) => !v);
    document.documentElement.classList.toggle('dark');
  }

  async checkApiStatus() {
    try {
      const response = await fetch('http://localhost:3333/api/health');
      this.apiStatus.set(response.ok);
    } catch {
      this.apiStatus.set(false);
    }
  }
}
