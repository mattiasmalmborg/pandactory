import { ResourceCost, AchievementId } from '../types/game.types';
import { getMasteryBonus } from '../game/config/achievements';

// Apply cost reduction from mastery bonus (all achievements unlocked)
export function applyCostReduction(costs: ResourceCost[], unlockedAchievements: AchievementId[]): ResourceCost[] {
  const masteryBonus = getMasteryBonus(unlockedAchievements);
  if (masteryBonus.costReduction === 0) {
    return costs;
  }
  // Apply 50% cost reduction
  return costs.map(cost => ({
    ...cost,
    amount: Math.ceil(cost.amount * (1 - masteryBonus.costReduction)),
  }));
}

export function canAfford(resources: Record<string, number>, costs: ResourceCost[]): boolean {
  return costs.every((cost) => (resources[cost.resourceId] || 0) >= cost.amount);
}

export function deductResources(
  resources: Record<string, number>,
  costs: ResourceCost[]
): Record<string, number> {
  const newResources = { ...resources };
  costs.forEach((cost) => {
    newResources[cost.resourceId] = (newResources[cost.resourceId] || 0) - cost.amount;
  });
  return newResources;
}

export function calculateExpeditionBonus(durationMinutes: number, completed: boolean): number {
  let bonus = 0;

  // 5% per 30 minutes
  const halfHours = Math.floor(durationMinutes / 30);
  bonus += halfHours * 5;

  // 20% completion bonus
  if (completed) {
    bonus += 20;
  }

  return bonus;
}

export function calculateLevelUpCost(baseCost: ResourceCost[], currentLevel: number, multiplier: number): ResourceCost[] {
  // Cost for upgrading FROM currentLevel TO currentLevel+1
  // Uses exponential scaling: baseCost * (multiplier ^ currentLevel)
  // Inspired by Kittens Game's price ratio system (1.5-1.7 range)
  return baseCost.map((cost) => ({
    ...cost,
    amount: Math.ceil(cost.amount * Math.pow(multiplier, currentLevel)),
  }));
}

export function calculateProductionRate(
  baseRate: number,
  level: number,
  skillBonus: number = 0,
  powerCellBonus: number = 0
): number {
  // Base formula: baseRate * (1.25 ^ level)
  // Level 1: 1.25x, Level 2: 1.56x, Level 5: 3.05x, Level 10: 9.31x
  const levelMultiplier = Math.pow(1.25, level);

  // Apply skill tree bonus (additive, e.g., +0.05 = +5%)
  const skillMultiplier = 1 + skillBonus;

  // Apply power cell bonus (additive, e.g., +0.50 = +50%, +1.00 = +100%)
  const powerMultiplier = 1 + powerCellBonus;

  return baseRate * levelMultiplier * skillMultiplier * powerMultiplier;
}
