import {
  Component,
  OnInit,
  signal,
  effect,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideHome,
  lucideGamepad2,
  lucideMoon,
  lucideSun,
  lucideMonitor,
  lucideMenu,
  lucideX,
  lucideChevronRight,
  lucideChevronDown,
  lucideLightbulb,
  lucidePackage,
  lucideBuilding2,
  lucideBarChart3,
  lucideClipboardList,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';

type ThemeMode = 'light' | 'dark' | 'system';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent, HlmButton],
  providers: [
    provideIcons({
      lucideHome,
      lucideGamepad2,
      lucideMoon,
      lucideSun,
      lucideMonitor,
      lucideMenu,
      lucideX,
      lucideChevronRight,
      lucideChevronDown,
      lucideLightbulb,
      lucidePackage,
      lucideBuilding2,
      lucideBarChart3,
      lucideClipboardList,
    }),
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit {
  private platformId = inject(PLATFORM_ID);

  themeMode = signal<ThemeMode>('system');
  isDark = signal(false);
  isMobileMenuOpen = signal(false);
  isSidebarCollapsed = signal(false);
  expandedItems = signal<string[]>([]);

  navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'lucideHome' },
    { label: 'Games', path: '/games', icon: 'lucideGamepad2' },
    {
      label: 'Product Intel',
      path: '/product-intelligence',
      icon: 'lucideLightbulb',
      children: [
        {
          label: 'Products',
          path: '/product-intelligence/products',
          icon: 'lucidePackage',
        },
        {
          label: 'Comparison',
          path: '/product-intelligence/comparison',
          icon: 'lucideTable',
        },
        {
          label: 'Companies',
          path: '/product-intelligence/companies',
          icon: 'lucideBuilding2',
        },
        {
          label: 'Features',
          path: '/product-intelligence/features',
          icon: 'lucideBarChart3',
        },
        {
          label: 'Market',
          path: '/product-intelligence/market',
          icon: 'lucideBarChart3',
        },
        {
          label: 'Planning',
          path: '/product-intelligence/planning',
          icon: 'lucideClipboardList',
        },
      ],
    },
  ];

  constructor() {
    effect(() => {
      const mode = this.themeMode();
      if (isPlatformBrowser(this.platformId)) {
        this.applyTheme(mode);
        localStorage.setItem('theme-mode', mode);
      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null;
      if (savedMode) {
        this.themeMode.set(savedMode);
      }
      this.applyTheme(this.themeMode());

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.themeMode() === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }

  private applyTheme(mode: ThemeMode) {
    if (!isPlatformBrowser(this.platformId)) return;

    let isDark: boolean;
    if (mode === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = mode === 'dark';
    }

    this.isDark.set(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }

  setTheme(mode: ThemeMode) {
    this.themeMode.set(mode);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  toggleSidebar() {
    this.isSidebarCollapsed.update((v) => !v);
  }

  toggleExpanded(path: string) {
    this.expandedItems.update((items) =>
      items.includes(path) ? items.filter((p) => p !== path) : [...items, path],
    );
  }

  isExpanded(path: string): boolean {
    return this.expandedItems().includes(path);
  }
}
