import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <h1>Settings</h1>
        <p>Configure your Game Manager preferences</p>
      </div>

      <div class="settings-section">
        <h2>API Configuration</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>API Endpoint</h3>
            <p>Game Data API server URL</p>
          </div>
          <input
            type="text"
            value="http://localhost:3333/api"
            class="setting-input"
            readonly
          />
        </div>
      </div>

      <div class="settings-section">
        <h2>Display</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>Default Theme</h3>
            <p>Choose light or dark mode</p>
          </div>
          <select class="setting-select">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>Games Per Page</h3>
            <p>Number of games to show in lists</p>
          </div>
          <select class="setting-select">
            <option value="10">10</option>
            <option value="20" selected>20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h2>Data</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>Export Database</h3>
            <p>Download all game data as JSON</p>
          </div>
          <button class="btn-secondary" (click)="exportData()">Export</button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>Reseed Database</h3>
            <p>Reset database with sample data</p>
          </div>
          <button class="btn-danger">Reseed</button>
        </div>
      </div>

      <div class="settings-section">
        <h2>About</h2>
        <div class="about-info">
          <p><strong>Game Development Intelligence System</strong></p>
          <p>Version 1.0.0</p>
          <p>Built with Angular 19, Tailwind CSS v4, and NgRx Signals</p>
        </div>
      </div>
    </div>
  `,
  styles: `
    .settings-page {
      max-width: 800px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 2rem;
    }
    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }
    .page-header p {
      color: var(--text-secondary, #666);
      margin: 0;
    }

    .settings-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.75rem;
    }

    .settings-section h2 {
      font-size: 1.125rem;
      margin: 0 0 1.5rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color, #e0e0e0);
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
    }

    .setting-item + .setting-item {
      border-top: 1px solid var(--border-color, #e0e0e0);
    }

    .setting-info h3 {
      margin: 0;
      font-size: 0.9375rem;
      font-weight: 500;
    }
    .setting-info p {
      margin: 0.25rem 0 0 0;
      font-size: 0.8125rem;
      color: var(--text-secondary, #666);
    }

    .setting-input,
    .setting-select {
      padding: 0.5rem 0.75rem;
      background: var(--bg-tertiary, #eee);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.5rem;
      color: inherit;
      min-width: 200px;
    }

    .btn-secondary {
      padding: 0.5rem 1rem;
      background: var(--bg-tertiary, #eee);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0.5rem;
      color: inherit;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-secondary:hover {
      background: var(--border-color, #e0e0e0);
    }

    .btn-danger {
      padding: 0.5rem 1rem;
      background: oklch(0.6 0.25 25 / 0.15);
      border: 1px solid oklch(0.6 0.25 25 / 0.3);
      border-radius: 0.5rem;
      color: oklch(0.5 0.25 25);
      cursor: pointer;
      font-weight: 500;
    }

    .btn-danger:hover {
      background: oklch(0.6 0.25 25 / 0.25);
    }

    .about-info p {
      margin: 0.5rem 0;
      font-size: 0.875rem;
    }
    .about-info p:first-child {
      font-size: 1rem;
    }
  `,
})
export class SettingsPage {
  async exportData() {
    try {
      const response = await fetch('http://localhost:3333/api/games');
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'games-database-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }
}
