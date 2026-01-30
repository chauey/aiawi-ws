import { Component, signal, effect } from '@angular/core';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  selector: 'app-root',
  template: `
    <div class="app-container" [class.dark]="isDark()">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <button class="menu-toggle" (click)="toggleSidebar()">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 class="logo">🎮 Game Manager</h1>
        </div>

        <div class="header-right">
          <!-- Theme Toggle -->
          <button
            class="theme-toggle"
            (click)="toggleTheme()"
            [title]="isDark() ? 'Switch to Light' : 'Switch to Dark'"
          >
            @if (isDark()) {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            } @else {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                ></path>
              </svg>
            }
          </button>

          <span class="api-status" [class.connected]="apiConnected()">
            {{ apiConnected() ? '🟢 API Connected' : '🔴 API Offline' }}
          </span>
        </div>
      </header>

      <!-- Layout -->
      <div class="layout">
        <!-- Sidebar -->
        <aside class="sidebar" [class.open]="sidebarOpen()">
          <nav class="nav">
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              class="nav-item"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Dashboard</span>
            </a>

            <a routerLink="/games" routerLinkActive="active" class="nav-item">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <circle cx="8" cy="12" r="2"></circle>
                <circle cx="16" cy="12" r="2"></circle>
              </svg>
              <span>Games</span>
            </a>

            <a
              routerLink="/competitors"
              routerLinkActive="active"
              class="nav-item"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Competitors</span>
            </a>

            <a
              routerLink="/features"
              routerLinkActive="active"
              class="nav-item"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span>Features</span>
            </a>

            <a
              routerLink="/analytics"
              routerLinkActive="active"
              class="nav-item"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <span>Analytics</span>
            </a>

            <div class="nav-divider"></div>

            <a
              routerLink="/settings"
              routerLinkActive="active"
              class="nav-item"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                ></path>
              </svg>
              <span>Settings</span>
            </a>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Overlay -->
      @if (sidebarOpen()) {
        <div class="overlay" (click)="toggleSidebar()"></div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }

    .app-container {
      --bg-primary: oklch(0.98 0.01 260);
      --bg-secondary: oklch(0.95 0.01 260);
      --bg-tertiary: oklch(0.92 0.01 260);
      --text-primary: oklch(0.15 0.02 260);
      --text-secondary: oklch(0.4 0.02 260);
      --border-color: oklch(0.85 0.01 260);
      --accent: oklch(0.6 0.2 260);
      --accent-hover: oklch(0.55 0.22 260);
      --success: oklch(0.65 0.2 145);
      --danger: oklch(0.6 0.25 25);

      height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
      color: var(--text-primary);
      transition: all 0.3s ease;
    }

    .app-container.dark {
      --bg-primary: oklch(0.12 0.02 260);
      --bg-secondary: oklch(0.16 0.02 260);
      --bg-tertiary: oklch(0.2 0.02 260);
      --text-primary: oklch(0.95 0.01 260);
      --text-secondary: oklch(0.7 0.02 260);
      --border-color: oklch(0.25 0.02 260);
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-toggle {
      display: none;
      padding: 0.5rem;
      background: transparent;
      border: none;
      color: var(--text-primary);
      cursor: pointer;
      border-radius: 0.5rem;
    }

    .menu-toggle:hover {
      background: var(--bg-tertiary);
    }

    @media (max-width: 768px) {
      .menu-toggle {
        display: flex;
      }
    }

    .logo {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, var(--accent), oklch(0.7 0.18 180));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .theme-toggle {
      padding: 0.5rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .theme-toggle:hover {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }

    .api-status {
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
      background: var(--bg-tertiary);
    }

    .api-status.connected {
      background: oklch(0.65 0.2 145 / 0.15);
      color: var(--success);
    }

    /* Layout */
    .layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* Sidebar */
    .sidebar {
      width: 240px;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      overflow-y: auto;
      transition: transform 0.3s ease;
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 57px;
        left: 0;
        bottom: 0;
        z-index: 90;
        transform: translateX(-100%);
      }

      .sidebar.open {
        transform: translateX(0);
      }
    }

    .nav {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: var(--accent);
      color: white;
    }

    .nav-divider {
      height: 1px;
      background: var(--border-color);
      margin: 0.5rem 0;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      background: var(--bg-primary);
    }

    /* Overlay */
    .overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 80;
    }

    @media (max-width: 768px) {
      .overlay {
        display: block;
      }
    }
  `,
})
export class App {
  isDark = signal(true);
  sidebarOpen = signal(false);
  apiConnected = signal(false);

  constructor() {
    // Check API health on load
    this.checkApiHealth();

    // Apply dark mode to document
    effect(() => {
      document.documentElement.classList.toggle('dark', this.isDark());
    });
  }

  toggleTheme() {
    this.isDark.update((v) => !v);
  }

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  async checkApiHealth() {
    try {
      const response = await fetch('http://localhost:3333/api/health');
      this.apiConnected.set(response.ok);
    } catch {
      this.apiConnected.set(false);
    }
  }
}
