import { Route } from '@angular/router';
import { Games } from './games/games';
import { TicTacToe } from './tic-tac-toe/tic-tac-toe';
import { FlagQuiz } from './flag-quiz/flag-quiz';

export const gamesRoutes: Route[] = [
  { path: '', component: Games },
  { path: 'tic-tac-toe', component: TicTacToe },
  { path: 'flag-quiz', component: FlagQuiz }
];
