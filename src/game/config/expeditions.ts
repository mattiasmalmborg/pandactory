import { ExpeditionTier, ExpeditionTierConfig } from '../../types/game.types';

export const EXPEDITION_TIERS: Record<ExpeditionTier, ExpeditionTierConfig> = {
  quick_dash: {
    id: 'quick_dash',
    name: 'Swift Forage',
    description: 'A hasty scavenge nearby. Barely counts as leaving home, but hey—something is better than nothing.',
    durationMinutes: 10,
    foodCost: 500,
    resourceMultiplier: 0.5,
    powerCellChance: 0.05, // 5%
    biomeDiscoveryChance: 0.03, // 3%
    resourceDiscoveryChance: 0.10, // 10% per undiscovered resource
  },
  quick_scout: {
    id: 'quick_scout',
    name: 'Local Expedition',
    description: 'A proper look around the area. You might actually find something useful this time.',
    durationMinutes: 30,
    foodCost: 1500,
    resourceMultiplier: 1.0,
    powerCellChance: 0.10, // 10%
    biomeDiscoveryChance: 0.10, // 10%
    resourceDiscoveryChance: 0.20, // 20% per undiscovered resource
  },
  standard_expedition: {
    id: 'standard_expedition',
    name: 'Standard Expedition',
    description: 'A proper expedition. Pack a lunch.',
    durationMinutes: 60,
    foodCost: 3500,
    resourceMultiplier: 1.5,
    powerCellChance: 0.15, // 15%
    biomeDiscoveryChance: 0.20, // 20%
    resourceDiscoveryChance: 0.30, // 30% per undiscovered resource
  },
  deep_exploration: {
    id: 'deep_exploration',
    name: 'Deep Exploration',
    description: 'Venture into the unknown. Bring snacks. Lots of snacks.',
    durationMinutes: 120,
    foodCost: 8000,
    resourceMultiplier: 2.5,
    powerCellChance: 0.25, // 25%
    biomeDiscoveryChance: 0.35, // 35%
    resourceDiscoveryChance: 0.45, // 45% per undiscovered resource
  },
  epic_journey: {
    id: 'epic_journey',
    name: 'Epic Journey',
    description: 'A legendary expedition to the far reaches. Hope you like walking.',
    durationMinutes: 240,
    foodCost: 18000,
    resourceMultiplier: 4.0,
    powerCellChance: 0.35, // 35%
    biomeDiscoveryChance: 0.50, // 50%
    resourceDiscoveryChance: 0.60, // 60% per undiscovered resource
  },
};

export function calculateExpeditionBonus(expedition: {
  startTime: number;
  durationMs: number;
  collectedAt: number | null;
}): number {
  const now = Date.now();
  const completionTime = expedition.startTime + expedition.durationMs;

  let bonus = 0;

  // Check if expedition is completed
  if (now < completionTime) {
    return 0; // Not completed yet
  }

  // PATIENCE BONUS: +15% if timer fully completes before collecting
  if (expedition.collectedAt === null || expedition.collectedAt >= completionTime) {
    bonus += 0.15;
  }

  // OVERTIME BONUS: +5% per 30 minutes after completion (max +50%)
  if (expedition.collectedAt) {
    const overtimeMs = expedition.collectedAt - completionTime;
    if (overtimeMs > 0) {
      const overtimeMinutes = overtimeMs / (1000 * 60);
      const overtimeSlots = Math.floor(overtimeMinutes / 30);
      const overtimeBonus = Math.min(overtimeSlots * 0.05, 0.50);
      bonus += overtimeBonus;
    }
  } else {
    // Currently waiting - calculate potential overtime bonus
    const overtimeMs = now - completionTime;
    if (overtimeMs > 0) {
      const overtimeMinutes = overtimeMs / (1000 * 60);
      const overtimeSlots = Math.floor(overtimeMinutes / 30);
      const overtimeBonus = Math.min(overtimeSlots * 0.05, 0.50);
      bonus += overtimeBonus;
    }
  }

  return bonus; // Max: 0.15 + 0.50 = 0.65 (65%)
}

export function getExpeditionProgress(expedition: {
  startTime: number;
  durationMs: number;
}): number {
  const now = Date.now();
  const elapsed = now - expedition.startTime;
  const progress = Math.min(elapsed / expedition.durationMs, 1.0);
  return progress;
}

export function isExpeditionComplete(expedition: {
  startTime: number;
  durationMs: number;
}): boolean {
  const now = Date.now();
  return now >= expedition.startTime + expedition.durationMs;
}
