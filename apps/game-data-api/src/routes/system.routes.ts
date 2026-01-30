import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

interface SystemInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  sourcePath: string;
  version: string;
  status: string;
  documentation: string;
  configKeys: string[];
  linkedGames: string[];
  features: string[];
}

interface SystemsRegistry {
  systems: SystemInfo[];
}

// GET /api/systems - Get all systems
router.get('/', (_req: Request, res: Response) => {
  try {
    const dataPath = path.join(__dirname, '../../data/systems-registry.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    const registry: SystemsRegistry = JSON.parse(data);
    res.json(registry);
  } catch (error) {
    console.error('Error loading systems registry:', error);
    res.status(500).json({ error: 'Failed to load systems registry' });
  }
});

// GET /api/systems/:id - Get a specific system
router.get('/:id', (req: Request, res: Response) => {
  try {
    const dataPath = path.join(__dirname, '../../data/systems-registry.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    const registry: SystemsRegistry = JSON.parse(data);
    const system = registry.systems.find((s) => s.id === req.params.id);

    if (!system) {
      res.status(404).json({ error: 'System not found' });
      return;
    }

    res.json(system);
  } catch (error) {
    console.error('Error loading system:', error);
    res.status(500).json({ error: 'Failed to load system' });
  }
});

// GET /api/systems/by-game/:gameId - Get systems for a specific game
router.get('/by-game/:gameId', (req: Request, res: Response) => {
  try {
    const dataPath = path.join(__dirname, '../../data/systems-registry.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    const registry: SystemsRegistry = JSON.parse(data);
    const linkedSystems = registry.systems.filter((s) =>
      s.linkedGames?.includes(req.params.gameId),
    );

    res.json({ systems: linkedSystems });
  } catch (error) {
    console.error('Error loading systems for game:', error);
    res.status(500).json({ error: 'Failed to load systems for game' });
  }
});

export default router;
