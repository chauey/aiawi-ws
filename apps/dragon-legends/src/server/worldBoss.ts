// Dragon Legends - World Boss System (Server)
// Server-wide cooperative boss battles with contribution rewards

import { Players, ReplicatedStorage, Workspace } from '@rbxts/services';
import { WorldBossState } from '../shared/types';
import { DRAGONS, Element, GAME_CONFIG } from '../shared/config';
import {
  addCoins,
  addGems,
  getPlayerData,
  updatePlayerData,
} from './dataStore';
import { createPlayerDragon } from './dragons';
import { addWarScore } from './clans';
import { GAME_THEME } from '../shared/theme';

// World boss definitions
const WORLD_BOSSES = [
  {
    id: 'ancient_fire_titan',
    name: 'Ancient Fire Titan',
    element: 'fire' as Element,
    baseHp: 1000000,
    dragonDrops: ['inferno_drake', 'solar_phoenix'],
    dropChance: 0.05, // 5% chance
  },
  {
    id: 'ice_colossus',
    name: 'Ice Colossus',
    element: 'ice' as Element,
    baseHp: 1200000,
    dragonDrops: ['blizzard_king', 'crystal_dragon'],
    dropChance: 0.05,
  },
  {
    id: 'storm_leviathan',
    name: 'Storm Leviathan',
    element: 'electric' as Element,
    baseHp: 1500000,
    dragonDrops: ['storm_emperor', 'cosmic_dragon'],
    dropChance: 0.03,
  },
  {
    id: 'void_emperor',
    name: 'Void Emperor',
    element: 'shadow' as Element,
    baseHp: 2000000,
    dragonDrops: ['void_dragon', 'chaos_lord'],
    dropChance: 0.01,
  },
];

// Current world boss state
let currentBoss: WorldBossState | undefined;
let bossModel: Model | undefined;

// Boss spawn timing
const BOSS_DURATION = 30 * 60; // 30 minutes
const BOSS_COOLDOWN = 2 * 60 * 60; // 2 hours between bosses

// Create boss model in world
function createBossModel(boss: (typeof WORLD_BOSSES)[number]): Model {
  const model = new Instance('Model');
  model.Name = `WorldBoss_${boss.id}`;

  // Giant boss body
  const body = new Instance('Part');
  body.Name = 'Body';
  body.Size = new Vector3(30, 30, 40);
  body.Position = new Vector3(0, 50, -150); // In the sky, away from spawn
  body.BrickColor =
    boss.element === 'fire'
      ? new BrickColor('Bright red')
      : boss.element === 'ice'
        ? new BrickColor('Light blue')
        : boss.element === 'electric'
          ? new BrickColor('Bright yellow')
          : new BrickColor('Really black');
  body.Material = Enum.Material.Neon;
  body.Anchored = true;
  body.CanCollide = false;
  body.Parent = model;

  // Intimidating glow
  const light = new Instance('PointLight');
  light.Color = body.BrickColor.Color;
  light.Brightness = 5;
  light.Range = 60;
  light.Parent = body;

  // Particle effects
  const particles = new Instance('ParticleEmitter');
  particles.Color = new ColorSequence(body.BrickColor.Color);
  particles.LightEmission = 1;
  particles.Size = new NumberSequence(2);
  particles.Rate = 20;
  particles.Lifetime = new NumberRange(1, 2);
  particles.Speed = new NumberRange(5, 10);
  particles.Parent = body;

  // Health bar
  const billboard = new Instance('BillboardGui');
  billboard.Size = new UDim2(0, 400, 0, 100);
  billboard.StudsOffset = new Vector3(0, 25, 0);
  billboard.AlwaysOnTop = true;

  const nameLabel = new Instance('TextLabel');
  nameLabel.Size = new UDim2(1, 0, 0.4, 0);
  nameLabel.Position = new UDim2(0, 0, 0, 0);
  nameLabel.BackgroundTransparency = 1;
  nameLabel.Text = `🐲 ${boss.name} 🐲`;
  nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
  nameLabel.TextStrokeColor3 = Color3.fromRGB(0, 0, 0);
  nameLabel.TextStrokeTransparency = 0;
  nameLabel.TextScaled = true;
  nameLabel.Font = Enum.Font.GothamBold;
  nameLabel.Parent = billboard;

  // HP bar background
  const hpBg = new Instance('Frame');
  hpBg.Size = new UDim2(1, 0, 0.3, 0);
  hpBg.Position = new UDim2(0, 0, 0.5, 0);
  hpBg.BackgroundColor3 = Color3.fromRGB(50, 50, 50);
  hpBg.BorderSizePixel = 3;
  hpBg.Parent = billboard;

  const hpBar = new Instance('Frame');
  hpBar.Name = 'HPBar';
  hpBar.Size = new UDim2(1, 0, 1, 0);
  hpBar.BackgroundColor3 = Color3.fromRGB(200, 50, 50);
  hpBar.BorderSizePixel = 0;
  hpBar.Parent = hpBg;

  const hpLabel = new Instance('TextLabel');
  hpLabel.Name = 'HPLabel';
  hpLabel.Size = new UDim2(1, 0, 1, 0);
  hpLabel.BackgroundTransparency = 1;
  hpLabel.Text = `${tostring(boss.baseHp)} / ${tostring(boss.baseHp)}`;
  hpLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
  hpLabel.TextStrokeTransparency = 0;
  hpLabel.TextScaled = true;
  hpLabel.Font = Enum.Font.GothamBold;
  hpLabel.Parent = hpBg;

  billboard.Parent = body;

  // Animation - floating and rotating
  task.spawn(() => {
    let angle = 0;
    while (model.Parent) {
      angle += 0.01;
      const bobY = math.sin(angle * 2) * 2;
      body.Position = new Vector3(0, 50 + bobY, -150);
      body.CFrame = body.CFrame.mul(CFrame.Angles(0, 0.005, 0));
      task.wait(0.03);
    }
  });

  model.PrimaryPart = body;
  model.Parent = Workspace;

  return model;
}

// Update boss health bar
function updateBossHealthBar(): void {
  if (!bossModel || !currentBoss) return;

  const body = bossModel.FindFirstChild('Body') as Part | undefined;
  if (!body) return;

  const billboard = body.FindFirstChildOfClass('BillboardGui');
  if (!billboard) return;

  const hpBg = billboard.FindFirstChild('Frame') as Frame | undefined;
  if (!hpBg) return;

  const hpBar = hpBg.FindFirstChild('HPBar') as Frame | undefined;
  const hpLabel = hpBg.FindFirstChild('HPLabel') as TextLabel | undefined;

  if (hpBar) {
    const hpPercent = currentBoss.currentHp / currentBoss.maxHp;
    hpBar.Size = new UDim2(math.max(0, hpPercent), 0, 1, 0);
  }

  if (hpLabel) {
    hpLabel.Text = `${tostring(math.floor(currentBoss.currentHp))} / ${tostring(currentBoss.maxHp)}`;
  }
}

// Spawn a world boss
function spawnWorldBoss(): void {
  // Pick random boss
  const bossConfig =
    WORLD_BOSSES[math.floor(math.random() * WORLD_BOSSES.size())];

  currentBoss = {
    bossId: bossConfig.id,
    name: bossConfig.name,
    element: bossConfig.element,
    currentHp: bossConfig.baseHp,
    maxHp: bossConfig.baseHp,
    phase: 1,
    participants: [],
    startTime: os.time(),
    isDefeated: false,
  };

  bossModel = createBossModel(bossConfig);

  // Announce to all players
  for (const player of Players.GetPlayers()) {
    // Would use remote event to show notification
    print(`🐲 WORLD BOSS SPAWNED: ${bossConfig.name}!`);
  }

  print(`🐲 World Boss ${bossConfig.name} has appeared!`);

  // Set timeout
  task.delay(BOSS_DURATION, () => {
    if (currentBoss && !currentBoss.isDefeated) {
      endBoss(false);
    }
  });
}

// Deal damage to boss
export function damageBoss(
  player: Player,
  damage: number,
): { success: boolean; bossDefeated: boolean; error?: string } {
  if (!currentBoss) {
    return { success: false, bossDefeated: false, error: 'No active boss' };
  }

  if (currentBoss.isDefeated) {
    return {
      success: false,
      bossDefeated: false,
      error: 'Boss already defeated',
    };
  }

  // Record participation
  const existing = currentBoss.participants.find(
    (p) => p.playerId === player.UserId,
  );
  if (existing) {
    existing.damage += damage;
  } else {
    currentBoss.participants.push({
      playerId: player.UserId,
      damage: damage,
    });
  }

  // Apply damage
  currentBoss.currentHp = math.max(0, currentBoss.currentHp - damage);
  updateBossHealthBar();

  // Check phases
  const hpPercent = currentBoss.currentHp / currentBoss.maxHp;
  if (hpPercent <= 0.5 && currentBoss.phase === 1) {
    currentBoss.phase = 2;
    print('🐲 World Boss entered Phase 2!');
  } else if (hpPercent <= 0.25 && currentBoss.phase === 2) {
    currentBoss.phase = 3;
    print('🐲 World Boss entered Final Phase!');
  }

  // Check if defeated
  if (currentBoss.currentHp <= 0) {
    currentBoss.isDefeated = true;
    endBoss(true);
    return { success: true, bossDefeated: true };
  }

  return { success: true, bossDefeated: false };
}

// End boss fight and distribute rewards
function endBoss(victory: boolean): void {
  if (!currentBoss) return;

  const bossConfig = WORLD_BOSSES.find((b) => b.id === currentBoss!.bossId);

  if (victory && bossConfig) {
    // Sort participants by damage
    // Sort participants by damage (bubble sort since roblox-ts sort needs boolean)
    const participantsCopy = [...currentBoss.participants];
    for (let i = 0; i < participantsCopy.size(); i++) {
      for (let j = i + 1; j < participantsCopy.size(); j++) {
        if (participantsCopy[j].damage > participantsCopy[i].damage) {
          [participantsCopy[i], participantsCopy[j]] = [
            participantsCopy[j],
            participantsCopy[i],
          ];
        }
      }
    }
    const sorted = participantsCopy;
    let totalDamage = 0;
    for (const p of sorted) {
      totalDamage += p.damage;
    }

    // Distribute rewards
    sorted.forEach((participant, rank) => {
      const player = Players.GetPlayerByUserId(participant.playerId);
      if (!player) return;

      // Calculate reward based on contribution
      const contributionPercent = participant.damage / totalDamage;
      const baseCoins = 1000;
      const coinReward = math.floor(
        baseCoins + baseCoins * contributionPercent * 10,
      );
      const gemReward = rank < 3 ? 20 - rank * 5 : 5; // Top 3 get bonus gems

      addCoins(player, coinReward);
      addGems(player, gemReward);

      // Dragon drop chance (higher for top contributors)
      const dropChance =
        bossConfig.dropChance * (rank < 10 ? 2 : 1) * (1 + contributionPercent);

      if (math.random() < dropChance) {
        const dragonId =
          bossConfig.dragonDrops[
            math.floor(math.random() * bossConfig.dragonDrops.size())
          ];
        const isShiny = math.random() < 0.1; // 10% shiny chance on boss drops
        createPlayerDragon(player, dragonId, isShiny);
        print(
          `🎉 ${player.Name} got${isShiny ? ' SHINY' : ''} ${DRAGONS[dragonId]?.name} from boss!`,
        );
      }

      // Add clan war score if in clan
      const playerData = getPlayerData(player);
      if (playerData?.clanId) {
        addWarScore(playerData.clanId, math.floor(contributionPercent * 100));
      }

      print(
        `🏆 ${player.Name} earned ${coinReward} coins, ${gemReward} gems from boss!`,
      );
    });

    print(`🎉 World Boss ${currentBoss.name} defeated!`);
  } else {
    print(`💀 World Boss ${currentBoss.name} was not defeated in time!`);
  }

  // Cleanup
  if (bossModel) {
    bossModel.Destroy();
    bossModel = undefined;
  }

  currentBoss = undefined;

  // Schedule next boss
  task.delay(BOSS_COOLDOWN, () => {
    spawnWorldBoss();
  });
}

// Get current boss state
export function getCurrentBoss(): WorldBossState | undefined {
  return currentBoss;
}

// Setup world boss system
export function setupWorldBoss(): void {
  const remotes =
    (ReplicatedStorage.FindFirstChild('DragonRemotes') as Folder) ||
    new Instance('Folder');
  remotes.Name = 'DragonRemotes';
  remotes.Parent = ReplicatedStorage;

  const attackBossRemote = new Instance('RemoteFunction');
  attackBossRemote.Name = 'AttackWorldBoss';
  attackBossRemote.Parent = remotes;

  const getBossStateRemote = new Instance('RemoteFunction');
  getBossStateRemote.Name = 'GetWorldBossState';
  getBossStateRemote.Parent = remotes;

  attackBossRemote.OnServerInvoke = (player, damage) => {
    if (!typeIs(damage, 'number') || damage <= 0) {
      return { success: false, error: 'Invalid damage' };
    }
    return damageBoss(player, damage);
  };

  getBossStateRemote.OnServerInvoke = () => {
    return getCurrentBoss();
  };

  // Spawn first boss after delay
  task.delay(60, () => {
    spawnWorldBoss();
  });

  print('🐲 World Boss System initialized!');
}
