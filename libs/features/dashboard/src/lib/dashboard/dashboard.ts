import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideUsers,
  lucideGamepad2,
  lucideTrendingUp,
  lucideArrowUpRight,
  lucideArrowDownRight
} from '@ng-icons/lucide';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'lib-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    HlmIcon,
    ...HlmCardImports,
    HlmButton
  ],
  providers: [
    provideIcons({
      lucideActivity,
      lucideUsers,
      lucideGamepad2,
      lucideTrendingUp,
      lucideArrowUpRight,
      lucideArrowDownRight
    })
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  stats = [
    {
      title: 'Total Games',
      value: '24',
      change: '+12%',
      isPositive: true,
      icon: 'lucideGamepad2'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+8.2%',
      isPositive: true,
      icon: 'lucideUsers'
    },
    {
      title: 'Sessions Today',
      value: '456',
      change: '-2.1%',
      isPositive: false,
      icon: 'lucideActivity'
    },
    {
      title: 'Growth Rate',
      value: '23.5%',
      change: '+5.4%',
      isPositive: true,
      icon: 'lucideTrendingUp'
    }
  ];

  recentGames = [
    { name: 'Tic Tac Toe', players: 2, lastPlayed: '2 hours ago', status: 'active' },
    { name: 'Chess', players: 2, lastPlayed: '5 hours ago', status: 'active' },
    { name: 'Sudoku', players: 1, lastPlayed: '1 day ago', status: 'inactive' },
    { name: 'Memory Match', players: 1, lastPlayed: '2 days ago', status: 'active' }
  ];
}
