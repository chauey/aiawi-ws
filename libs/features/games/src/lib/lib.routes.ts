import { Route } from '@angular/router';
import { Games } from './games/games';
import { TicTacToe } from './tic-tac-toe/tic-tac-toe';

export const gamesRoutes: Route[] = [
  { path: '', component: Games },
  { path: 'tic-tac-toe', component: TicTacToe }
];
