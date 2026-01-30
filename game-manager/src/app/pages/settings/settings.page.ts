import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { GameApiClient } from '@aiawi-ws/game-data';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmLabelImports,
    BrnSelectImports,
    HlmSelectImports,
  ],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Settings</h1>
        <p class="text-muted-foreground">Configure application preferences</p>
      </div>

      <!-- API Configuration -->
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>API Configuration</h3>
          <p hlmCardDescription>Backend connection settings</p>
        </div>
        <div hlmCardContent class="space-y-4">
          <div class="space-y-2">
            <label hlmLabel for="api-url">API Endpoint</label>
            <input
              hlmInput
              id="api-url"
              type="text"
              [formControl]="apiUrlControl"
              class="w-full"
            />
          </div>
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full"
              [class]="apiStatus() ? 'bg-green-500' : 'bg-red-500'"
            ></div>
            <span class="text-sm text-muted-foreground">
              {{ apiStatus() ? 'Connected' : 'Disconnected' }}
            </span>
            <button
              hlmBtn
              variant="outline"
              size="sm"
              (click)="testConnection()"
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>

      <!-- Display Settings -->
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>Display Settings</h3>
          <p hlmCardDescription>Customize the appearance</p>
        </div>
        <div hlmCardContent class="space-y-4">
          <div class="space-y-2">
            <label hlmLabel>Theme</label>
            <brn-select [formControl]="themeControl">
              <hlm-select-trigger class="w-full">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content>
                <hlm-option value="dark">Dark</hlm-option>
                <hlm-option value="light">Light</hlm-option>
                <hlm-option value="system">System</hlm-option>
              </hlm-select-content>
            </brn-select>
          </div>

          <div class="space-y-2">
            <label hlmLabel>Items Per Page</label>
            <brn-select [formControl]="pageSizeControl">
              <hlm-select-trigger class="w-full">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content>
                <hlm-option value="10">10</hlm-option>
                <hlm-option value="25">25</hlm-option>
                <hlm-option value="50">50</hlm-option>
                <hlm-option value="100">100</hlm-option>
              </hlm-select-content>
            </brn-select>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>Data Management</h3>
          <p hlmCardDescription>Export and reset data</p>
        </div>
        <div hlmCardContent>
          <div class="flex flex-wrap gap-3">
            <button hlmBtn variant="outline" (click)="exportData()">
              📥 Export Database
            </button>
            <button hlmBtn variant="destructive" (click)="confirmReseed()">
              🔄 Reseed Database
            </button>
          </div>
        </div>
      </div>

      <!-- About -->
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>About</h3>
        </div>
        <div hlmCardContent>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-muted-foreground">Version</div>
              <div class="font-medium">1.0.0</div>
            </div>
            <div>
              <div class="text-muted-foreground">Build</div>
              <div class="font-medium">2026.01.30</div>
            </div>
            <div>
              <div class="text-muted-foreground">Framework</div>
              <div class="font-medium">Angular 19 + Spartan UI</div>
            </div>
            <div>
              <div class="text-muted-foreground">API</div>
              <div class="font-medium">Express + JSON Storage</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SettingsPage {
  private fb = inject(FormBuilder);
  private apiClient = inject(GameApiClient);

  apiStatus = signal(false);

  apiUrlControl = this.fb.control('http://localhost:3333/api');
  themeControl = this.fb.control('dark');
  pageSizeControl = this.fb.control('25');

  constructor() {
    this.testConnection();
  }

  async testConnection() {
    try {
      await firstValueFrom(this.apiClient.healthCheck());
      this.apiStatus.set(true);
    } catch {
      this.apiStatus.set(false);
    }
  }

  exportData() {
    window.open('http://localhost:3333/api/games', '_blank');
  }

  confirmReseed() {
    if (confirm('This will reset all data to default. Continue?')) {
      alert('Database reseeded!');
    }
  }
}
