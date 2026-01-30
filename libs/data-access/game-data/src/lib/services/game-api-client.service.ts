import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  GameDto,
  CreateGameDto,
  UpdateGameDto,
  GetGamesFilterDto,
  PagedResultDto,
  GameFeatureDto,
} from '../models/game.model';

@Injectable({
  providedIn: 'root',
})
export class GameApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3333/api';

  /**
   * Get all games with optional filtering
   */
  getGames(filter?: GetGamesFilterDto): Observable<PagedResultDto<GameDto>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.filter) params = params.set('filter', filter.filter);
      if (filter.genre) params = params.set('genre', filter.genre);
      if (filter.platform) params = params.set('platform', filter.platform);
      if (filter.ownership) params = params.set('ownership', filter.ownership);
      if (filter.ageGroup) params = params.set('ageGroup', filter.ageGroup);
      if (filter.monetizationModel)
        params = params.set('monetizationModel', filter.monetizationModel);
      if (filter.minPriorityScore)
        params = params.set(
          'minPriorityScore',
          filter.minPriorityScore.toString(),
        );
      if (filter.recommendedOnly)
        params = params.set('recommendedOnly', 'true');

      // Feature flag filters
      if (filter.hasCollectionSystem !== undefined)
        params = params.set(
          'hasCollectionSystem',
          filter.hasCollectionSystem.toString(),
        );
      if (filter.hasTradingSystem !== undefined)
        params = params.set(
          'hasTradingSystem',
          filter.hasTradingSystem.toString(),
        );
      if (filter.hasProgressionSystem !== undefined)
        params = params.set(
          'hasProgressionSystem',
          filter.hasProgressionSystem.toString(),
        );
      if (filter.hasMultiplayer !== undefined)
        params = params.set('hasMultiplayer', filter.hasMultiplayer.toString());
      if (filter.hasGachaSystem !== undefined)
        params = params.set('hasGachaSystem', filter.hasGachaSystem.toString());

      // Pagination
      if (filter.skipCount !== undefined)
        params = params.set('skipCount', filter.skipCount.toString());
      if (filter.maxResultCount !== undefined)
        params = params.set('maxResultCount', filter.maxResultCount.toString());
      if (filter.sorting) params = params.set('sorting', filter.sorting);
    }

    return this.http.get<PagedResultDto<GameDto>>(`${this.baseUrl}/games`, {
      params,
    });
  }

  /**
   * Get a single game by ID
   */
  getGame(id: string): Observable<GameDto> {
    return this.http.get<GameDto>(`${this.baseUrl}/games/${id}`);
  }

  /**
   * Create a new game
   */
  createGame(game: CreateGameDto): Observable<GameDto> {
    return this.http.post<GameDto>(`${this.baseUrl}/games`, game);
  }

  /**
   * Update an existing game
   */
  updateGame(id: string, game: UpdateGameDto): Observable<GameDto> {
    return this.http.put<GameDto>(`${this.baseUrl}/games/${id}`, game);
  }

  /**
   * Delete a game
   */
  deleteGame(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/games/${id}`);
  }

  /**
   * Add a feature to a game
   */
  addFeature(
    gameId: string,
    feature: Partial<GameFeatureDto>,
  ): Observable<GameDto> {
    return this.http.post<GameDto>(
      `${this.baseUrl}/games/${gameId}/features`,
      feature,
    );
  }

  /**
   * Update game success metrics
   */
  updateMetrics(
    gameId: string,
    metrics: Partial<GameDto['successMetrics']>,
  ): Observable<GameDto> {
    return this.http.put<GameDto>(
      `${this.baseUrl}/games/${gameId}/metrics`,
      metrics,
    );
  }

  /**
   * Health check
   */
  healthCheck(): Observable<{ status: string; timestamp: string }> {
    return this.http.get<{ status: string; timestamp: string }>(
      `${this.baseUrl}/health`,
    );
  }
}
