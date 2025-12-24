import { BiomeState, ResourceId, Automation, AutomationType } from '../types/game.types';
import { AUTOMATIONS } from '../game/config/automations';
import { calculateProductionRate } from './calculations';

/**
 * Calculate production and consumption rates for all resources in a biome
 */
export function calculateBiomeProductionRates(biome: BiomeState): {
  production: Partial<Record<ResourceId, number>>;
  consumption: Partial<Record<ResourceId, number>>;
} {
  const production: Partial<Record<ResourceId, number>> = {};
  const consumption: Partial<Record<ResourceId, number>> = {};

  biome.automations.forEach(automation => {
    const config = AUTOMATIONS[automation.type];
    if (!config) return;

    // Calculate effective production rate with level scaling and power cell
    const rate = calculateProductionRate(
      config.baseProductionRate,
      automation.level
    );
    const multiplier = automation.powerCell?.bonus ?? 1;
    const effectiveRate = rate * multiplier;

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
        const amount = consume.amount * effectiveRate;
        consumption[key] = (consumption[key] || 0) + amount;
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
  biomeProductionRates: Partial<Record<ResourceId, number>>
): number {
  const config = AUTOMATIONS[automation.type];
  if (!config) return 0;

  // Gatherers don't need inputs - always run at 100%
  if (!config.consumes || config.consumes.length === 0) {
    return 1.0;
  }

  const rate = calculateProductionRate(
    config.baseProductionRate,
    automation.level
  );
  const multiplier = automation.powerCell?.bonus ?? 1;
  const effectiveRate = rate * multiplier;

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
