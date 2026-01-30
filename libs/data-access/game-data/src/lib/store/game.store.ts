import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { GameApiClient } from '../services/game-api-client.service';
import {
  GameDto,
  GetGamesFilterDto,
  CreateGameDto,
  UpdateGameDto,
} from '../models/game.model';

export interface GameState {
  games: GameDto[];
  selectedGame: GameDto | null;
  totalCount: number;
  loading: boolean;
  error: string | null;
  filter: GetGamesFilterDto;
}

const initialState: GameState = {
  games: [],
  selectedGame: null,
  totalCount: 0,
  loading: false,
  error: null,
  filter: {
    skipCount: 0,
    maxResultCount: 20,
    sorting: 'name',
  },
};

export const GameStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    // Computed: Games with collection system
    gamesWithCollection: computed(() =>
      store.games().filter((g) => g.featureFlags?.hasCollectionSystem),
    ),

    // Computed: Games with trading system
    gamesWithTrading: computed(() =>
      store.games().filter((g) => g.featureFlags?.hasTradingSystem),
    ),

    // Computed: Competitor games
    competitorGames: computed(() =>
      store.games().filter((g) => g.ownership === 'Competitor'),
    ),

    // Computed: Our games
    ourGames: computed(() =>
      store.games().filter((g) => g.ownership === 'Our Game'),
    ),

    // Computed: Top revenue games
    topRevenueGames: computed(() =>
      [...store.games()]
        .filter((g) => g.successMetrics?.revenueMonthly)
        .sort(
          (a, b) =>
            (b.successMetrics?.revenueMonthly || 0) -
            (a.successMetrics?.revenueMonthly || 0),
        )
        .slice(0, 10),
    ),

    // Computed: Genres list
    genres: computed(() =>
      [...new Set(store.games().map((g) => g.genre))].filter(Boolean).sort(),
    ),

    // Computed: Platforms list
    platforms: computed(() =>
      [...new Set(store.games().map((g) => g.platform))].filter(Boolean).sort(),
    ),

    // Computed: Has more pages
    hasMorePages: computed(() => store.games().length < store.totalCount()),

    // Computed: Is empty
    isEmpty: computed(() => !store.loading() && store.games().length === 0),
  })),

  withMethods((store, apiClient = inject(GameApiClient)) => ({
    // Load games with filtering
    loadGames: rxMethod<GetGamesFilterDto | void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((filter) => {
          const currentFilter = filter || store.filter();
          patchState(store, { filter: currentFilter as GetGamesFilterDto });

          return apiClient.getGames(currentFilter as GetGamesFilterDto).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  games: response.items,
                  totalCount: response.totalCount,
                  loading: false,
                });
              },
              error: (error: Error) => {
                patchState(store, {
                  loading: false,
                  error: error.message || 'Failed to load games',
                });
              },
            }),
          );
        }),
      ),
    ),

    // Load single game
    loadGame: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          apiClient.getGame(id).pipe(
            tapResponse({
              next: (game) => {
                patchState(store, {
                  selectedGame: game,
                  loading: false,
                });
              },
              error: (error: Error) => {
                patchState(store, {
                  loading: false,
                  error: error.message || 'Failed to load game',
                });
              },
            }),
          ),
        ),
      ),
    ),

    // Create game
    createGame: rxMethod<CreateGameDto>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((gameData) =>
          apiClient.createGame(gameData).pipe(
            tapResponse({
              next: (newGame) => {
                patchState(store, {
                  games: [...store.games(), newGame],
                  totalCount: store.totalCount() + 1,
                  loading: false,
                });
              },
              error: (error: Error) => {
                patchState(store, {
                  loading: false,
                  error: error.message || 'Failed to create game',
                });
              },
            }),
          ),
        ),
      ),
    ),

    // Update game
    updateGame: rxMethod<{ id: string; data: UpdateGameDto }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, data }) =>
          apiClient.updateGame(id, data).pipe(
            tapResponse({
              next: (updatedGame) => {
                patchState(store, {
                  games: store
                    .games()
                    .map((g) => (g.id === id ? updatedGame : g)),
                  selectedGame:
                    store.selectedGame()?.id === id
                      ? updatedGame
                      : store.selectedGame(),
                  loading: false,
                });
              },
              error: (error: Error) => {
                patchState(store, {
                  loading: false,
                  error: error.message || 'Failed to update game',
                });
              },
            }),
          ),
        ),
      ),
    ),

    // Delete game
    deleteGame: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          apiClient.deleteGame(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, {
                  games: store.games().filter((g) => g.id !== id),
                  selectedGame:
                    store.selectedGame()?.id === id
                      ? null
                      : store.selectedGame(),
                  totalCount: store.totalCount() - 1,
                  loading: false,
                });
              },
              error: (error: Error) => {
                patchState(store, {
                  loading: false,
                  error: error.message || 'Failed to delete game',
                });
              },
            }),
          ),
        ),
      ),
    ),

    // Select a game
    selectGame(game: GameDto | null) {
      patchState(store, { selectedGame: game });
    },

    // Update filter
    updateFilter(filter: Partial<GetGamesFilterDto>) {
      patchState(store, {
        filter: { ...store.filter(), ...filter },
      });
    },

    // Clear error
    clearError() {
      patchState(store, { error: null });
    },

    // Reset state
    reset() {
      patchState(store, initialState);
    },
  })),
);
