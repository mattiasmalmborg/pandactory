import { ResourceCost, AchievementId, BiomeId, BiomeState, SkillId, Automation, ResearchId, ResearchState, Artifact, ArtifactState } from '../types/game.types';
import { getMasteryBonus } from '../game/config/achievements';
import { getSkillTreeBonus, countInstalledPowerCells, getEffectivePowerCellBonus } from '../game/config/skillTree';
import { getResearchBonus } from '../game/config/research';
import { getArtifactBonus } from '../game/config/artifacts';
import { AUTOMATIONS } from '../game/config/automations';
import { BiomeProductionContext } from './allocation';

/**
 * Gather all resources from ALL biomes into a single record.
 * Used for cross-biome affordability checks.
 */
export function getAllBiomeResources(biomes: Record<BiomeId, BiomeState>): Record<string, number> {
  const allResources: Record<string, number> = {};
  Object.values(biomes).forEach(b => {
    Object.entries(b.resources).forEach(([resId, amount]) => {
      allResources[resId] = (allResources[resId] || 0) + amount;
    });
  });
  return allResources;
}

/**
 * Create the production context needed for production rate calculations.
 * Eliminates duplication of this pattern across components.
 */
export function createProductionContext(state: {
  prestige: { unlockedSkills: SkillId[] };
  achievements?: { unlocked: AchievementId[] };
  biomes: Record<BiomeId, BiomeState>;
  research?: ResearchState;
  artifacts?: ArtifactState;
}): BiomeProductionContext {
  return {
    unlockedSkills: state.prestige.unlockedSkills,
    unlockedAchievements: state.achievements?.unlocked || [],
    allBiomes: state.biomes,
    researchLevels: state.research?.levels || {},
    artifactInventory: state.artifacts?.inventory || [],
  };
}

/**
 * Calculate the effective production rate for a single automation,
 * including skill bonuses, mastery bonus, and power cell bonus.
 * Eliminates duplication of this calculation across 4+ files.
 */
export function getAutomationProductionRate(
  automation: Automation,
  context: BiomeProductionContext
): number {
  const config = AUTOMATIONS[automation.type];
  if (!config) return 0;

  const unlockedSkills = context.unlockedSkills || [];
  const productionSpeedBonus = getSkillTreeBonus(unlockedSkills, 'production_speed');
  const researchProductionBonus = getResearchBonus(context.researchLevels || {}, 'production');
  const artifactProductionBonus = getArtifactBonus(context.artifactInventory || [], 'production');
  const masteryBonus = getMasteryBonus(context.unlockedAchievements || []);

  const totalInstalledCells = context.allBiomes
    ? countInstalledPowerCells(context.allBiomes)
    : 0;

  const basePowerCellBonus = automation.powerCell?.bonus || 0;
  const effectivePowerCellBonus = getEffectivePowerCellBonus(
    basePowerCellBonus,
    totalInstalledCells,
    unlockedSkills
  );

  return calculateProductionRate(
    config.baseProductionRate,
    automation.level,
    productionSpeedBonus + masteryBonus.productionBonus + researchProductionBonus + artifactProductionBonus,
    effectivePowerCellBonus
  );
}

// Apply cost reduction from mastery bonus and research
export function applyCostReduction(
  costs: ResourceCost[],
  unlockedAchievements: AchievementId[],
  researchLevels?: Partial<Record<ResearchId, number>>,
  costType?: 'build' | 'upgrade',
  artifactInventory?: Artifact[],
): ResourceCost[] {
  const masteryBonus = getMasteryBonus(unlockedAchievements);

  // Research cost reduction (build or upgrade)
  let researchReduction = 0;
  if (researchLevels && costType === 'build') {
    researchReduction = getResearchBonus(researchLevels, 'build_cost');
  } else if (researchLevels && costType === 'upgrade') {
    researchReduction = getResearchBonus(researchLevels, 'upgrade_cost');
  }

  // Artifact cost reduction
  let artifactReduction = 0;
  if (artifactInventory && costType === 'build') {
    artifactReduction = getArtifactBonus(artifactInventory, 'build_cost');
  } else if (artifactInventory && costType === 'upgrade') {
    artifactReduction = getArtifactBonus(artifactInventory, 'upgrade_cost');
  }

  const totalReduction = masteryBonus.costReduction + researchReduction + artifactReduction;
  if (totalReduction === 0) {
    return costs;
  }

  // Cap at 80% reduction to keep some cost
  const clampedReduction = Math.min(totalReduction, 0.8);
  return costs.map(cost => ({
    ...cost,
    amount: Math.ceil(cost.amount * (1 - clampedReduction)),
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
