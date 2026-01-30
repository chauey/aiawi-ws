// Dragon Legends - Daily Rewards System (Server)
// 7-day escalating rewards with streak bonuses

import { Players, ReplicatedStorage } from '@rbxts/services';
import { GAME_CONFIG } from '../shared/config';
import {
  getPlayerData,
  updatePlayerData,
  addCoins,
  addGems,
} from './dataStore';

// Get current date string (YYYY-MM-DD)
function getDateString(): string {
  const date = os.date('!*t') as { year: number; month: number; day: number };
  return `${date.year}-${string.format('%02d', date.month)}-${string.format('%02d', date.day)}`;
}

// Check and claim daily reward
export function claimDailyReward(player: Player): {
  success: boolean;
  reward?: { coins: number; gems: number; streak: number };
  error?: string;
} {
  const playerData = getPlayerData(player);
  if (!playerData) {
    return { success: false, error: 'Player data not found' };
  }

  const today = getDateString();

  // Check if already claimed today
  if (playerData.lastLoginDate === today) {
    return { success: false, error: 'Already claimed today!' };
  }

  // Calculate streak
  const yesterday = os.time() - 86400; // 24 hours ago
  const yesterdayDate = os.date('!*t', yesterday) as {
    year: number;
    month: number;
    day: number;
  };
  const yesterdayString = `${yesterdayDate.year}-${string.format('%02d', yesterdayDate.month)}-${string.format('%02d', yesterdayDate.day)}`;

  if (playerData.lastLoginDate === yesterdayString) {
    // Continuing streak
    playerData.loginStreak++;
  } else {
    // Streak broken, reset to 1
    playerData.loginStreak = 1;
  }

  // Cap streak at 7 for rewards
  const rewardDay = ((playerData.loginStreak - 1) % 7) + 1;
  const rewardIndex = rewardDay - 1;

  // Get coin reward
  const coinReward = GAME_CONFIG.DAILY_REWARDS[rewardIndex] || 50;

  // Bonus gems on day 7
  const gemReward = rewardDay === 7 ? 10 : 0;

  // Apply rewards
  addCoins(player, coinReward);
  if (gemReward > 0) {
    addGems(player, gemReward);
  }

  // Update last login
  playerData.lastLoginDate = today;
  updatePlayerData(player, playerData);

  print(
    `📅 ${player.Name} claimed Day ${rewardDay} reward: ${coinReward} coins${gemReward > 0 ? ` + ${gemReward} gems` : ''}! Streak: ${playerData.loginStreak}`,
  );

  return {
    success: true,
    reward: {
      coins: coinReward,
      gems: gemReward,
      streak: playerData.loginStreak,
    },
  };
}

// Get daily reward status
export function getDailyRewardStatus(player: Player): {
  canClaim: boolean;
  streak: number;
  nextReward: number;
  daysUntilReset: number;
} {
  const playerData = getPlayerData(player);
  if (!playerData) {
    return {
      canClaim: true,
      streak: 0,
      nextReward: GAME_CONFIG.DAILY_REWARDS[0],
      daysUntilReset: 0,
    };
  }

  const today = getDateString();
  const canClaim = playerData.lastLoginDate !== today;

  const nextDay = canClaim
    ? playerData.loginStreak
    : playerData.loginStreak + 1;
  const rewardIndex = nextDay % 7;
  const nextReward = GAME_CONFIG.DAILY_REWARDS[rewardIndex] || 50;

  return {
    canClaim,
    streak: playerData.loginStreak,
    nextReward,
    daysUntilReset: 7 - (playerData.loginStreak % 7),
  };
}

// Setup daily rewards system
export function setupDailyRewards(): void {
  const remotes =
    (ReplicatedStorage.FindFirstChild('DragonRemotes') as Folder) ||
    new Instance('Folder');
  remotes.Name = 'DragonRemotes';
  remotes.Parent = ReplicatedStorage;

  const claimDailyRemote = new Instance('RemoteFunction');
  claimDailyRemote.Name = 'ClaimDailyReward';
  claimDailyRemote.Parent = remotes;

  const getDailyStatusRemote = new Instance('RemoteFunction');
  getDailyStatusRemote.Name = 'GetDailyRewardStatus';
  getDailyStatusRemote.Parent = remotes;

  claimDailyRemote.OnServerInvoke = (player) => {
    return claimDailyReward(player);
  };

  getDailyStatusRemote.OnServerInvoke = (player) => {
    return getDailyRewardStatus(player);
  };

  print('📅 Daily Rewards System initialized!');
}
