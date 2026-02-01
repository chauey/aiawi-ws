import express, { Router, Request, Response } from 'express';
import {
  topRobloxGames,
  featureImportanceMatrix,
  strategicRecommendations,
  seedRobloxGameIntelligence,
} from '../database/seed-roblox-games';
import { getStorage } from '../database/storage';

const router: Router = express.Router();
const storage = getStorage();

/**
 * GAME INTELLIGENCE API
 *
 * Holistic view of:
 * - What games are popular and WHY
 * - What features are best and WHY
 * - What games we should make and WHY
 * - Planning and next steps
 */

/**
 * GET /api/intelligence/overview
 *
 * Complete strategic overview for humans AND AI
 * This is the "one endpoint to rule them all" for understanding the market
 */
router.get('/overview', (_req: Request, res: Response) => {
  const games = topRobloxGames;

  // Sort games by study priority
  const topGamesToStudy = [...games]
    .sort((a, b) => b.studyPriority - a.studyPriority)
    .slice(0, 5);

  // Aggregate all WHY reasons
  const allWhyReasons: Record<string, number> = {};
  games.forEach((game) => {
    game.whyPopular.forEach((reason) => {
      allWhyReasons[reason] = (allWhyReasons[reason] || 0) + 1;
    });
  });

  // Sort by frequency
  const topWhyReasons = Object.entries(allWhyReasons)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([reason, count]) => ({ reason, gamesWithThis: count }));

  // Aggregate all features
  const allFeatures: Record<string, { count: number; importance: string[] }> =
    {};
  games.forEach((game) => {
    game.keyFeatures.forEach((feature) => {
      if (!allFeatures[feature.category]) {
        allFeatures[feature.category] = { count: 0, importance: [] };
      }
      allFeatures[feature.category].count++;
      allFeatures[feature.category].importance.push(feature.importance);
    });
  });

  res.json({
    summary: {
      title: '🎮 Roblox Market Intelligence Overview',
      lastUpdated: new Date().toISOString(),
      gamesAnalyzed: games.length,
      insight:
        'Collection + Trading + Daily Rewards = Core formula for successful Roblox games',
    },

    topGamesToStudy: topGamesToStudy.map((g) => ({
      name: g.name,
      genre: g.genre,
      monthlyRevenue: `$${(g.estimatedMonthlyRevenue / 1000000).toFixed(1)}M`,
      players: `${(g.concurrentPlayers / 1000).toFixed(0)}K concurrent`,
      whyItWorks: g.whyPopular.slice(0, 3),
      studyPriority: g.studyPriority,
    })),

    whyGamesSucceed: topWhyReasons,

    featureImportance: featureImportanceMatrix,

    recommendation: strategicRecommendations,

    actionItems: [
      '1. Study Pet Simulator X egg hatching and trading systems',
      '2. Implement core collection loop (items with rarity tiers)',
      '3. Add trading early - it multiplies retention',
      '4. Plan weekly events from launch',
      '5. Set up promo code system for marketing',
    ],
  });
});

/**
 * GET /api/intelligence/games
 *
 * All analyzed games with full details
 */
router.get('/games', (_req: Request, res: Response) => {
  res.json({
    items: topRobloxGames,
    totalCount: topRobloxGames.length,
  });
});

/**
 * GET /api/intelligence/games/:name
 *
 * Single game deep dive
 */
router.get('/games/:name', (req: Request, res: Response) => {
  const game = topRobloxGames.find(
    (g) =>
      g.name.toLowerCase().replace(/\s+/g, '-') ===
      req.params.name.toLowerCase(),
  );

  if (!game) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  res.json({
    game,

    // AI-friendly summary
    summary: `
# ${game.name} Analysis

## Why It's Popular
${game.whyPopular.map((r) => `- ${r}`).join('\n')}

## Core Loop
${game.coreLoop}

## Key Features to Study
${game.keyFeatures.map((f) => `- **${f.name}** (${f.importance}): ${f.whyItWorks}`).join('\n')}

## What to Copy
${game.featuresToCopy.map((f) => `- ${f}`).join('\n')}

## Mistakes to Avoid
${game.mistakesToAvoid.map((m) => `- ${m}`).join('\n')}
    `.trim(),
  });
});

/**
 * GET /api/intelligence/features
 *
 * Feature analysis - what features matter and why
 */
router.get('/features', (_req: Request, res: Response) => {
  // Collect all features across games
  const featuresByCategory: Record<string, any[]> = {};

  topRobloxGames.forEach((game) => {
    game.keyFeatures.forEach((feature) => {
      if (!featuresByCategory[feature.category]) {
        featuresByCategory[feature.category] = [];
      }
      featuresByCategory[feature.category].push({
        name: feature.name,
        game: game.name,
        importance: feature.importance,
        whyItWorks: feature.whyItWorks,
        implementationNotes: feature.implementationNotes,
      });
    });
  });

  res.json({
    summary:
      'Features ranked by how often they appear in top games and their importance',

    mustHaveFeatures: [
      {
        name: 'Collection System',
        reason: 'Every top game has collectibles',
        examples: ['Pets', 'Knives', 'Fruits'],
      },
      {
        name: 'Trading',
        reason: 'Creates economy + social bonds',
        examples: ['Pet trading', 'Knife trading'],
      },
      {
        name: 'Daily Rewards',
        reason: 'Low effort, high retention',
        examples: ['Login calendar', 'Daily bonus'],
      },
      {
        name: 'Rarity Tiers',
        reason: 'Drives motivation and spending',
        examples: ['Common/Rare/Legendary', 'Gold/Rainbow/Dark Matter'],
      },
    ],

    featuresByCategory,
    featureImportance: featureImportanceMatrix,
  });
});

/**
 * GET /api/intelligence/what-to-build
 *
 * Strategic recommendation for what game to make
 */
router.get('/what-to-build', (_req: Request, res: Response) => {
  res.json({
    recommendation: {
      genre: 'Simulator with Collection',
      confidence: '85%',
      reason: 'Highest revenue potential, proven formula, replicable mechanics',

      suggestedThemes: [
        {
          theme: 'Dragon Collector',
          uniqueness: 'High',
          risk: 'Low',
          market: 'Dragons are evergreen popular',
        },
        {
          theme: 'Fishing Simulator',
          uniqueness: 'Medium',
          risk: 'Low',
          market: 'Relaxing gameplay, collection hooks',
        },
        {
          theme: 'Monster Collector',
          uniqueness: 'Medium',
          risk: 'Medium',
          market: 'Pokemon-like appeal',
        },
        {
          theme: 'Robot Factory',
          uniqueness: 'High',
          risk: 'Medium',
          market: 'Tech/building appeal',
        },
      ],

      mvpFeatures: [
        { feature: 'Core Collection (eggs/items)', weeks: 2, priority: 1 },
        { feature: '3 Starter Areas', weeks: 1, priority: 2 },
        { feature: 'Basic Progression', weeks: 1, priority: 3 },
        { feature: 'Rarity System', weeks: 1, priority: 4 },
        { feature: 'Trading System', weeks: 2, priority: 5 },
        { feature: 'Daily Rewards', weeks: 0.5, priority: 6 },
        { feature: 'Promo Codes', weeks: 0.5, priority: 7 },
      ],

      totalMVPTime: '8 weeks for core, then launch soft',

      postLaunchPriorities: [
        'Weekly content updates',
        'YouTuber outreach (codes)',
        'First event (week 2)',
        'Rebirth system (week 4)',
        'Guilds (month 2)',
      ],
    },

    differentiators: [
      'Better animations than competitors',
      'Unique theme not yet done',
      'Better new player tutorial',
      'Story/lore integration',
      'More satisfying hatching effects',
    ],

    antiPatterns: [
      'Dont launch without trading - it 10x retention',
      'Dont skip daily rewards - free retention',
      'Dont make it pay-to-win - kills organic growth',
      'Dont update less than weekly after launch',
    ],
  });
});

/**
 * GET /api/intelligence/rice-calculator
 *
 * Calculate RICE score for a feature
 */
router.get('/rice-calculator', (req: Request, res: Response) => {
  const reach = parseInt(req.query.reach as string) || 0;
  const impact = parseInt(req.query.impact as string) || 0;
  const confidence = parseInt(req.query.confidence as string) || 0;
  const effort = parseInt(req.query.effort as string) || 1;

  const riceScore = (reach * impact * (confidence / 100)) / effort;

  res.json({
    input: { reach, impact, confidence, effort },
    riceScore: Math.round(riceScore * 100) / 100,
    interpretation:
      riceScore > 100
        ? 'High Priority'
        : riceScore > 50
          ? 'Medium Priority'
          : 'Low Priority',
    formula: 'RICE = (Reach × Impact × Confidence%) / Effort',
    tips: {
      reach: 'How many players affected? (1-10, where 10 = all players)',
      impact: 'How much value? (1-10, where 10 = game changing)',
      confidence: 'How sure are you? (1-100%)',
      effort: 'Dev weeks required',
    },
  });
});

/**
 * POST /api/intelligence/rice-score
 *
 * Calculate RICE for a feature and save it
 */
router.post('/rice-score', (req: Request, res: Response) => {
  const {
    featureName,
    reach,
    impact,
    confidence,
    effort,
    description,
    category,
  } = req.body;

  const riceScore = (reach * impact * (confidence / 100)) / effort;

  const feature = {
    id: Date.now().toString(),
    featureName,
    description,
    category,
    reach,
    impact,
    confidence,
    effort,
    riceScore: Math.round(riceScore * 100) / 100,
    priority: riceScore > 100 ? 'High' : riceScore > 50 ? 'Medium' : 'Low',
    createdAt: new Date().toISOString(),
  };

  res.status(201).json(feature);
});

/**
 * GET /api/intelligence/roadmap
 *
 * Suggested development roadmap
 */
router.get('/roadmap', (_req: Request, res: Response) => {
  res.json({
    title: '🚀 Recommended Game Development Roadmap',

    phases: [
      {
        phase: 'Phase 1: MVP',
        duration: '4-6 weeks',
        goal: 'Playable core loop',
        tasks: [
          { task: 'Core collection mechanic', days: 7, status: 'pending' },
          { task: 'Egg/item hatching', days: 5, status: 'pending' },
          { task: '3 starter areas', days: 5, status: 'pending' },
          { task: 'Rarity system (5 tiers)', days: 3, status: 'pending' },
          { task: 'Basic UI/UX', days: 5, status: 'pending' },
          { task: 'Currency system', days: 2, status: 'pending' },
        ],
      },
      {
        phase: 'Phase 2: Retention',
        duration: '2-3 weeks',
        goal: 'Keep players coming back',
        tasks: [
          { task: 'Trading system', days: 7, status: 'pending' },
          { task: 'Daily rewards', days: 2, status: 'pending' },
          { task: 'Promo code system', days: 2, status: 'pending' },
          { task: 'Leaderboards', days: 3, status: 'pending' },
          { task: 'Group rewards', days: 2, status: 'pending' },
        ],
      },
      {
        phase: 'Phase 3: Soft Launch',
        duration: '2 weeks',
        goal: 'Test with real players',
        tasks: [
          { task: 'Bug fixing', days: 5, status: 'pending' },
          { task: 'Balance adjustments', days: 3, status: 'pending' },
          { task: 'First event', days: 4, status: 'pending' },
          { task: 'YouTuber outreach', days: 2, status: 'pending' },
        ],
      },
      {
        phase: 'Phase 4: Growth',
        duration: 'Ongoing',
        goal: 'Scale and monetize',
        tasks: [
          { task: 'Weekly updates', days: 'ongoing', status: 'pending' },
          { task: 'Rebirth system', days: 5, status: 'pending' },
          { task: 'Premium gamepasses', days: 3, status: 'pending' },
          { task: 'Season pass', days: 5, status: 'pending' },
          { task: 'Guilds', days: 7, status: 'pending' },
        ],
      },
    ],

    keyMilestones: [
      { milestone: '100 concurrent players', target: 'Week 2 after launch' },
      { milestone: '1000 concurrent players', target: 'Month 1' },
      { milestone: '$1000/month revenue', target: 'Month 1' },
      { milestone: '10000 concurrent players', target: 'Month 3' },
      { milestone: '$10000/month revenue', target: 'Month 3' },
    ],
  });
});

/**
 * POST /api/intelligence/seed
 *
 * Seed the Roblox game intelligence data
 */
router.post('/seed', (_req: Request, res: Response) => {
  seedRobloxGameIntelligence(storage);
  res.json({ success: true, message: 'Seeded Roblox game intelligence data' });
});

/**
 * GET /api/intelligence/ai-context
 *
 * AI-friendly context for feeding to LLMs
 */
router.get('/ai-context', (_req: Request, res: Response) => {
  const context = `
# Roblox Game Market Intelligence

## Top Games Analyzed
${topRobloxGames.map((g) => `- **${g.name}** (${g.genre}): $${(g.estimatedMonthlyRevenue / 1000000).toFixed(1)}M/mo, ${(g.concurrentPlayers / 1000).toFixed(0)}K players`).join('\n')}

## Why Games Succeed
The most successful Roblox games share these traits:
${Object.entries(featureImportanceMatrix)
  .map(
    ([feature, data]: [string, any]) =>
      `- **${feature}** (${data.importance}): ${data.reason}`,
  )
  .join('\n')}

## Recommended Strategy
**Best Genre**: ${strategicRecommendations.bestGenreToMake.genre}
**Reason**: ${strategicRecommendations.bestGenreToMake.reason}

## Must-Have Features for Launch
${strategicRecommendations.mustHaveFeatures.map((f) => `${f.priority}. ${f.feature}: ${f.reason}`).join('\n')}

## Development Timeline
${strategicRecommendations.launchStrategy.map((s) => `- ${s.phase}: ${s.action}`).join('\n')}

## Key Learnings from Top Games
${topRobloxGames
  .flatMap((g) => g.lessonsLearned.slice(0, 2))
  .map((l) => `- ${l}`)
  .join('\n')}

## Use This Context For
- Deciding what game to build
- Planning features and priorities
- Understanding what works and why
- Making development decisions
`;

  res.type('text/plain').send(context.trim());
});

export default router;
