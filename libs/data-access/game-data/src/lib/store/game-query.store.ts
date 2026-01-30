import { inject, Injectable } from '@angular/core';
import {
  injectQuery,
  injectMutation,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { GameApiClient } from '../services/game-api-client.service';
import {
  CreateGameDto,
  GameDto,
  GetGamesFilterDto,
  UpdateGameDto,
} from '../models/game.model';

/**
 * TanStack Query-based Game Store
 * Provides automatic caching, refetching, and loading states
 */
@Injectable({
  providedIn: 'root',
})
export class GameQueryStore {
  private readonly apiClient = inject(GameApiClient);
  private readonly queryClient = injectQueryClient();

  /**
   * Query: Get all games with filtering
   */
  gamesQuery(filter?: GetGamesFilterDto) {
    return injectQuery(() => ({
      queryKey: ['games', filter],
      queryFn: () => lastValueFrom(this.apiClient.getGames(filter)),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }));
  }

  /**
   * Query: Get single game by ID
   */
  gameQuery(id: string) {
    return injectQuery(() => ({
      queryKey: ['game', id],
      queryFn: () => lastValueFrom(this.apiClient.getGame(id)),
      enabled: !!id,
      staleTime: 1000 * 60 * 5,
    }));
  }

  /**
   * Query: Health check
   */
  healthQuery() {
    return injectQuery(() => ({
      queryKey: ['health'],
      queryFn: () => lastValueFrom(this.apiClient.healthCheck()),
      staleTime: 1000 * 30, // 30 seconds
      refetchInterval: 1000 * 60, // Refetch every minute
    }));
  }

  /**
   * Mutation: Create game
   */
  createGameMutation() {
    return injectMutation(() => ({
      mutationFn: (game: CreateGameDto) =>
        lastValueFrom(this.apiClient.createGame(game)),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['games'] });
      },
    }));
  }

  /**
   * Mutation: Update game
   */
  updateGameMutation() {
    return injectMutation(() => ({
      mutationFn: ({ id, data }: { id: string; data: UpdateGameDto }) =>
        lastValueFrom(this.apiClient.updateGame(id, data)),
      onSuccess: (_data, variables) => {
        this.queryClient.invalidateQueries({ queryKey: ['games'] });
        this.queryClient.invalidateQueries({
          queryKey: ['game', variables.id],
        });
      },
    }));
  }

  /**
   * Mutation: Delete game
   */
  deleteGameMutation() {
    return injectMutation(() => ({
      mutationFn: (id: string) => lastValueFrom(this.apiClient.deleteGame(id)),
      onSuccess: (_data, id) => {
        this.queryClient.invalidateQueries({ queryKey: ['games'] });
        this.queryClient.removeQueries({ queryKey: ['game', id] });
      },
    }));
  }

  /**
   * Prefetch games for instant navigation
   */
  prefetchGames(filter?: GetGamesFilterDto) {
    return this.queryClient.prefetchQuery({
      queryKey: ['games', filter],
      queryFn: () => lastValueFrom(this.apiClient.getGames(filter)),
    });
  }

  /**
   * Prefetch single game
   */
  prefetchGame(id: string) {
    return this.queryClient.prefetchQuery({
      queryKey: ['game', id],
      queryFn: () => lastValueFrom(this.apiClient.getGame(id)),
    });
  }

  /**
   * Optimistically update game in cache
   */
  optimisticUpdateGame(id: string, updater: (old: GameDto) => GameDto) {
    this.queryClient.setQueryData(['game', id], (old: GameDto | undefined) =>
      old ? updater(old) : old,
    );
  }

  /**
   * Invalidate all game queries
   */
  invalidateGames() {
    this.queryClient.invalidateQueries({ queryKey: ['games'] });
  }
}
