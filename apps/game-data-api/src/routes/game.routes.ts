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
   * @openapi
   * /api/games:
   *   get:
   *     tags:
   *       - Games
   *     summary: Get all games
   *     description: Retrieve a paginated list of games with optional filtering
   *     parameters:
   *       - in: query
   *         name: filter
   *         schema:
   *           type: string
   *         description: Text search filter for game name
   *       - in: query
   *         name: genre
   *         schema:
   *           type: string
   *         description: Filter by genre
   *       - in: query
   *         name: monetizationModel
   *         schema:
   *           type: string
   *         description: Filter by monetization model
   *       - in: query
   *         name: minPriorityScore
   *         schema:
   *           type: number
   *         description: Minimum priority score filter
   *       - in: query
   *         name: recommendedOnly
   *         schema:
   *           type: boolean
   *         description: Only return recommended games
   *       - in: query
   *         name: tags
   *         schema:
   *           type: string
   *         description: Comma-separated list of tags
   *       - in: query
   *         name: skipCount
   *         schema:
   *           type: number
   *           default: 0
   *         description: Number of items to skip (pagination)
   *       - in: query
   *         name: maxResultCount
   *         schema:
   *           type: number
   *           default: 10
   *         description: Maximum number of items to return
   *       - in: query
   *         name: sorting
   *         schema:
   *           type: string
   *         description: Sorting field (e.g., 'name', 'priorityScore desc')
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PagedResult'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
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
          : 100, // Default to 100 to show all games
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
   * @openapi
   * /api/games/{id}:
   *   get:
   *     tags:
   *       - Games
   *     summary: Get a game by ID
   *     description: Retrieve a single game by its unique identifier
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Game ID
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Game'
   *       404:
   *         description: Game not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
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
   * @openapi
   * /api/games:
   *   post:
   *     tags:
   *       - Games
   *     summary: Create a new game
   *     description: Add a new game to the database
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateGame'
   *     responses:
   *       201:
   *         description: Game created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Game'
   *       500:
   *         description: Internal server error
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
   * @openapi
   * /api/games/{id}:
   *   put:
   *     tags:
   *       - Games
   *     summary: Update a game
   *     description: Update an existing game's properties
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Game ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateGame'
   *     responses:
   *       200:
   *         description: Game updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Game'
   *       404:
   *         description: Game not found
   *       500:
   *         description: Internal server error
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
   * @openapi
   * /api/games/{id}:
   *   delete:
   *     tags:
   *       - Games
   *     summary: Delete a game
   *     description: Remove a game from the database
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Game ID
   *     responses:
   *       204:
   *         description: Game deleted successfully
   *       404:
   *         description: Game not found
   *       500:
   *         description: Internal server error
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
   * @openapi
   * /api/games/{id}/features:
   *   post:
   *     tags:
   *       - Features
   *     summary: Add a feature to a game
   *     description: Create a new feature for an existing game
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Game ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               category:
   *                 type: string
   *               importance:
   *                 type: string
   *                 enum: [Critical, High, Medium, Low]
   *               implementationComplexity:
   *                 type: string
   *                 enum: [Easy, Medium, Hard, Expert]
   *               userEngagementImpact:
   *                 type: number
   *               monetizationPotential:
   *                 type: number
   *               technicalNotes:
   *                 type: string
   *     responses:
   *       201:
   *         description: Feature created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Feature'
   *       404:
   *         description: Game not found
   *       500:
   *         description: Internal server error
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
   * @openapi
   * /api/games/{id}/metrics:
   *   put:
   *     tags:
   *       - Metrics
   *     summary: Update success metrics
   *     description: Update the success metrics for a game
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Game ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SuccessMetric'
   *     responses:
   *       200:
   *         description: Metrics updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Game'
   *       404:
   *         description: Game not found
   *       500:
   *         description: Internal server error
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
