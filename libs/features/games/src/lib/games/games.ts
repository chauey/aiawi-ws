import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideGamepad2,
  lucideUsers,
  lucideStar,
  lucidePlay,
  lucideSearch,
  lucideFilter
} from '@ng-icons/lucide';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmBadge } from '@spartan-ng/helm/badge';

interface Game {
  id: number;
  name: string;
  description: string;
  players: string;
  category: string;
  rating: number;
  image: string;
  featured: boolean;
  route: string | null;
}

@Component({
  selector: 'lib-games',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgIconComponent,
    HlmIcon,
    ...HlmCardImports,
    HlmButton,
    HlmInput,
    HlmBadge
  ],
  providers: [
    provideIcons({
      lucideGamepad2,
      lucideUsers,
      lucideStar,
      lucidePlay,
      lucideSearch,
      lucideFilter
    })
  ],
  templateUrl: './games.html',
  styleUrl: './games.scss',
})
export class Games {
  searchQuery = '';
  selectedCategory = 'all';

  categories = [
    { id: 'all', label: 'All Games' },
    { id: 'puzzle', label: 'Puzzle' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'arcade', label: 'Arcade' },
    { id: 'card', label: 'Card Games' }
  ];

  games: Game[] = [
    {
      id: 1,
      name: 'Tic Tac Toe',
      description: 'Classic game of X\'s and O\'s. Challenge a friend or play against AI.',
      players: '2 Players',
      category: 'strategy',
      rating: 4.5,
      image: '🎮',
      featured: true,
      route: 'tic-tac-toe'
    },
    {
      id: 2,
      name: 'Chess',
      description: 'The ultimate strategy game. Master the board and checkmate your opponent.',
      players: '2 Players',
      category: 'strategy',
      rating: 4.8,
      image: '♟️',
      featured: true,
      route: null
    },
    {
      id: 3,
      name: 'Sudoku',
      description: 'Fill the grid with numbers. A relaxing puzzle for solo play.',
      players: '1 Player',
      category: 'puzzle',
      rating: 4.3,
      image: '🔢',
      featured: false,
      route: null
    },
    {
      id: 4,
      name: 'Memory Match',
      description: 'Test your memory by matching pairs of cards before time runs out.',
      players: '1-2 Players',
      category: 'puzzle',
      rating: 4.2,
      image: '🃏',
      featured: false,
      route: null
    },
    {
      id: 5,
      name: 'Snake',
      description: 'Classic arcade game. Eat food and grow longer without hitting walls.',
      players: '1 Player',
      category: 'arcade',
      rating: 4.0,
      image: '🐍',
      featured: false,
      route: null
    },
    {
      id: 6,
      name: 'Blackjack',
      description: 'Try to beat the dealer by getting as close to 21 as possible.',
      players: '1 Player',
      category: 'card',
      rating: 4.4,
      image: '🂡',
      featured: true,
      route: null
    }
  ];

  get filteredGames(): Game[] {
    return this.games.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           game.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.selectedCategory === 'all' || game.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  get featuredGames(): Game[] {
    return this.games.filter(g => g.featured);
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
  }

  get selectedCategoryLabel(): string {
    return this.categories.find(c => c.id === this.selectedCategory)?.label || '';
  }
}
