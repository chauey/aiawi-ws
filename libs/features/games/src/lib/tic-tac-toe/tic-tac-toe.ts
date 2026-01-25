import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideRotateCcw, lucideArrowLeft, lucideTrophy } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

type Player = 'X' | 'O' | null;
type Board = Player[];

interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  winningLine: number[] | null;
}

@Component({
  selector: 'lib-tic-tac-toe',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgIconComponent,
    HlmButton,
    ...HlmCardImports
  ],
  providers: [
    provideIcons({
      lucideRotateCcw,
      lucideArrowLeft,
      lucideTrophy
    })
  ],
  templateUrl: './tic-tac-toe.html',
  styleUrl: './tic-tac-toe.scss'
})
export class TicTacToe {
  private readonly WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  board = signal<Board>(Array(9).fill(null));
  currentPlayer = signal<Player>('X');
  winner = signal<Player | 'draw' | null>(null);
  winningLine = signal<number[] | null>(null);
  
  xScore = signal(0);
  oScore = signal(0);
  draws = signal(0);

  isGameOver = computed(() => this.winner() !== null);

  makeMove(index: number): void {
    if (this.board()[index] || this.winner()) {
      return;
    }

    const newBoard = [...this.board()];
    newBoard[index] = this.currentPlayer();
    this.board.set(newBoard);

    const result = this.checkWinner(newBoard);
    if (result.winner) {
      this.winner.set(result.winner);
      this.winningLine.set(result.line);
      if (result.winner === 'X') {
        this.xScore.update(s => s + 1);
      } else if (result.winner === 'O') {
        this.oScore.update(s => s + 1);
      }
    } else if (newBoard.every(cell => cell !== null)) {
      this.winner.set('draw');
      this.draws.update(d => d + 1);
    } else {
      this.currentPlayer.update(p => p === 'X' ? 'O' : 'X');
    }
  }

  private checkWinner(board: Board): { winner: Player | null; line: number[] | null } {
    for (const combo of this.WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: combo };
      }
    }
    return { winner: null, line: null };
  }

  resetGame(): void {
    this.board.set(Array(9).fill(null));
    this.currentPlayer.set('X');
    this.winner.set(null);
    this.winningLine.set(null);
  }

  resetScores(): void {
    this.resetGame();
    this.xScore.set(0);
    this.oScore.set(0);
    this.draws.set(0);
  }

  isWinningCell(index: number): boolean {
    return this.winningLine()?.includes(index) ?? false;
  }

  getCellClass(index: number): string {
    const cell = this.board()[index];
    const isWinning = this.isWinningCell(index);
    
    let classes = 'aspect-square flex items-center justify-center text-4xl md:text-5xl font-bold rounded-lg transition-all duration-200 cursor-pointer ';
    
    if (cell === null && !this.winner()) {
      classes += 'bg-muted/50 hover:bg-muted hover:scale-105 ';
    } else if (isWinning) {
      classes += 'bg-green-500/20 text-green-500 scale-105 ';
    } else if (cell === 'X') {
      classes += 'bg-blue-500/10 text-blue-500 ';
    } else if (cell === 'O') {
      classes += 'bg-rose-500/10 text-rose-500 ';
    } else {
      classes += 'bg-muted/50 ';
    }
    
    return classes;
  }
}
