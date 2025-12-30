import { BiomeState, ResourceId, Automation, AutomationType, SkillId, BiomeId } from '../types/game.types';
import { AUTOMATIONS } from '../game/config/automations';
import { calculateProductionRate } from './calculations';
import { getEffectivePowerCellBonus, countInstalledPowerCells, getSkillTreeBonus } from '../game/config/skillTree';
import { getMasteryBonus } from '../game/config/achievements';
import { AchievementId } from '../types/game.types';

export interface BiomeProductionContext {
  unlockedSkills?: SkillId[];
  unlockedAchievements?: AchievementId[];
  allBiomes?: Record<BiomeId, BiomeState>;
}

/**
 * Calculate production and consumption rates for all resources in a biome
 */
export function calculateBiomeProductionRates(
  biome: BiomeState,
  context?: BiomeProductionContext
): {
  production: Partial<Record<ResourceId, number>>;
  consumption: Partial<Record<ResourceId, number>>;
} {
  const production: Partial<Record<ResourceId, number>> = {};
  const consumption: Partial<Record<ResourceId, number>> = {};

  // Get skill bonuses if context provided
  const unlockedSkills = context?.unlockedSkills || [];
  const productionSpeedBonus = getSkillTreeBonus(unlockedSkills, 'production_speed');

  // Get mastery bonus
  const masteryBonus = getMasteryBonus(context?.unlockedAchievements || []);

  // Count total installed power cells for resonance
  const totalInstalledCells = context?.allBiomes
    ? countInstalledPowerCells(context.allBiomes)
    : countInstalledPowerCells({ current: biome });

  biome.automations.forEach(automation => {
    const config = AUTOMATIONS[automation.type];
    if (!config) return;

    // Skip paused automations
    if (automation.paused) return;

    // Calculate effective power cell bonus (handles null/undefined and skill bonuses)
    const basePowerCellBonus = automation.powerCell?.bonus || 0;
    const effectivePowerCellBonus = getEffectivePowerCellBonus(
      basePowerCellBonus,
      totalInstalledCells,
      unlockedSkills
    );

    // Calculate effective production rate with level scaling, skills, mastery, and power cell
    const effectiveRate = calculateProductionRate(
      config.baseProductionRate,
      automation.level,
      productionSpeedBonus + masteryBonus.productionBonus,
      effectivePowerCellBonus
    );

    // Track what this automation produces
    config.produces.forEach(produce => {
      const key = produce.resourceId;
      const amount = produce.amount * effectiveRate;
      production[key] = (production[key] || 0) + amount;
    });

    // Track what this automation consumes
    if (config.consumes) {
      config.consumes.forEach(consume => {
        const key = consume.resourceId;
        consumption[key] = (consumption[key] || 0) + consume.amount;
      });
    }
  });

  return { production, consumption };
}

/**
 * Calculate how efficiently an automation can run based on available inputs
 * Returns 0.0 to 1.0 (0% to 100% efficiency)
 */
export function getAutomationEfficiency(
  automation: Automation,
  biomeProductionRates: Partial<Record<ResourceId, number>>,
  context?: BiomeProductionContext
): number {
  const config = AUTOMATIONS[automation.type];
  if (!config) return 0;

  // Gatherers don't need inputs - always run at 100%
  if (!config.consumes || config.consumes.length === 0) {
    return 1.0;
  }

  // Get skill bonuses
  const unlockedSkills = context?.unlockedSkills || [];
  const productionSpeedBonus = getSkillTreeBonus(unlockedSkills, 'production_speed');
  const masteryBonus = getMasteryBonus(context?.unlockedAchievements || []);

  // Count installed power cells for resonance
  const totalInstalledCells = context?.allBiomes
    ? countInstalledPowerCells(context.allBiomes)
    : 0;

  // Calculate effective power cell bonus
  const basePowerCellBonus = automation.powerCell?.bonus || 0;
  const effectivePowerCellBonus = getEffectivePowerCellBonus(
    basePowerCellBonus,
    totalInstalledCells,
    unlockedSkills
  );

  const effectiveRate = calculateProductionRate(
    config.baseProductionRate,
    automation.level,
    productionSpeedBonus + masteryBonus.productionBonus,
    effectivePowerCellBonus
  );

  let minEfficiency = 1.0;

  // Check each required input
  config.consumes.forEach(consume => {
    const needed = consume.amount * effectiveRate;
    const available = biomeProductionRates[consume.resourceId] || 0;

    if (needed === 0) return;

    const efficiency = available / needed;
    minEfficiency = Math.min(minEfficiency, efficiency);
  });

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1.0, minEfficiency));
}

/**
 * Check if a new automation can be supported by current production
 */
export function canSupportAutomation(
  automationType: AutomationType,
  level: number,
  biome: BiomeState
): { canSupport: boolean; missingResources: ResourceId[] } {
  const config = AUTOMATIONS[automationType];
  if (!config) {
    return { canSupport: false, missingResources: [] };
  }

  // Gatherers don't need inputs
  if (!config.consumes || config.consumes.length === 0) {
    return { canSupport: true, missingResources: [] };
  }

  const { production } = calculateBiomeProductionRates(biome);
  const rate = calculateProductionRate(config.baseProductionRate, level);
  const missing: ResourceId[] = [];

  config.consumes.forEach(consume => {
    const needed = consume.amount * rate;
    const available = production[consume.resourceId] || 0;
    if (available < needed) {
      missing.push(consume.resourceId);
    }
  });

  return {
    canSupport: missing.length === 0,
    missingResources: missing
  };
}
