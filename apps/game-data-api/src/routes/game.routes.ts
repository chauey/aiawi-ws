import express from 'express';
import { GameRepository } from '../repositories/game.repository';
import {
  CreateGameDto,
  UpdateGameDto,
  GameFilterDto,
} from '../shared/dtos/game.dto';

export function createGameRouter(repository: GameRepository): express.Router {
  const router = express.Router();

  /**
   * GET /api/games
   * Get all games with filtering and paging
   */
  router.get('/', (req, res) => {
    try {
      const filter: GameFilterDto = {
        filter: req.query.filter as string,
        genre: req.query.genre as any,
        monetizationModel: req.query.monetizationModel as any,
        minPriorityScore: req.query.minPriorityScore
          ? Number(req.query.minPriorityScore)
          : undefined,
        recommendedOnly: req.query.recommendedOnly === 'true',
        tags: req.query.tags
          ? (req.query.tags as string).split(',')
          : undefined,
        skipCount: req.query.skipCount ? Number(req.query.skipCount) : 0,
        maxResultCount: req.query.maxResultCount
          ? Number(req.query.maxResultCount)
          : 10,
        sorting: req.query.sorting as string,
      };

      const result = repository.getList(filter);
      res.json(result);
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /api/games/:id
   * Get a single game by ID
   */
  router.get('/:id', (req, res) => {
    try {
      const game = repository.getById(req.params.id);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      res.json(game);
    } catch (error) {
      console.error('Error fetching game:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /api/games
   * Create a new game
   */
  router.post('/', (req, res) => {
    try {
      const dto: CreateGameDto = {
        ...req.body,
        releaseDate: new Date(req.body.releaseDate),
      };

      const game = repository.create(dto);
      res.status(201).json(game);
    } catch (error) {
      console.error('Error creating game:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * PUT /api/games/:id
   * Update a game
   */
  router.put('/:id', (req, res) => {
    try {
      const dto: UpdateGameDto = {
        ...req.body,
        releaseDate: req.body.releaseDate
          ? new Date(req.body.releaseDate)
          : undefined,
      };

      const game = repository.update(req.params.id, dto);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      res.json(game);
    } catch (error) {
      console.error('Error updating game:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * DELETE /api/games/:id
   * Delete a game
   */
  router.delete('/:id', (req, res) => {
    try {
      const success = repository.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Game not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting game:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /api/games/:id/features
   * Add a feature to a game
   */
  router.post('/:id/features', (req, res) => {
    try {
      const game = repository.getById(req.params.id);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      const feature = repository.addFeature(req.params.id, req.body);
      res.status(201).json(feature);
    } catch (error) {
      console.error('Error adding feature:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * PUT /api/games/:id/metrics
   * Update success metrics for a game
   */
  router.put('/:id/metrics', (req, res) => {
    try {
      const game = repository.getById(req.params.id);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      repository.updateSuccessMetrics(req.params.id, req.body);
      const updatedGame = repository.getById(req.params.id);
      res.json(updatedGame);
    } catch (error) {
      console.error('Error updating metrics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
