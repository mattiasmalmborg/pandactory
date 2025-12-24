import { GameState, ResourceId, FoodId, BiomeId, AutomationType } from '../types/game.types';
import { AutomationConfig } from '../types/automation.types';
import { AUTOMATIONS } from '../game/config/automations';
import { calculateProductionRate } from './calculations';
import { getAutomationEfficiency } from './allocation';
import { calculateBiomeProductionRates } from './allocation';
import { countInstalledPowerCells, getEffectivePowerCellBonus } from '../game/config/skillTree';

// Offline production efficiency (20% of normal production)
// Most idle games use 10-25% for offline efficiency
export const OFFLINE_EFFICIENCY_MULTIPLIER = 0.20;

// Max offline time in hours
export const MAX_OFFLINE_HOURS = 8;

// Result of offline progress calculation
export interface OfflineProgressResult {
  state: GameState;
  offlineSeconds: number;
  cappedMinutes: number;
  resourcesProduced: Record<string, number>;
  foodProduced: Record<string, number>;
  wasOnExpedition: boolean;
}

/**
 * Calculate and apply offline progress to game state
 * Max 8 hours of offline progress at reduced efficiency (20%)
 */
export function applyOfflineProgress(loadedState: GameState): OfflineProgressResult {
  const now = Date.now();
  const offlineTime = now - loadedState.lastTick;
  const offlineSeconds = offlineTime / 1000;
  const offlineMinutes = offlineTime / 60000;

  // Cap offline progress to max hours
  const maxOfflineMinutes = MAX_OFFLINE_HOURS * 60;
  const minutesToProcess = Math.min(offlineMinutes, maxOfflineMinutes);

  // Track what was produced
  const resourcesProduced: Record<string, number> = {};
  const foodProduced: Record<string, number> = {};

  // Don't process if less than 1 minute offline
  if (minutesToProcess < 1) {
    console.log('⏰ Less than 1 minute offline, no offline progress');
    return {
      state: { ...loadedState, lastTick: now },
      offlineSeconds,
      cappedMinutes: 0,
      resourcesProduced,
      foodProduced,
      wasOnExpedition: false,
    };
  }

  console.log(`⏰ Processing ${minutesToProcess.toFixed(1)} minutes of offline progress at ${OFFLINE_EFFICIENCY_MULTIPLIER * 100}% efficiency`);

  // Don't process offline progress if on expedition
  if (loadedState.panda.expedition !== null) {
    console.log('🐼 On expedition, skipping offline progress');
    return {
      state: { ...loadedState, lastTick: now },
      offlineSeconds,
      cappedMinutes: minutesToProcess,
      resourcesProduced,
      foodProduced,
      wasOnExpedition: true,
    };
  }

  const newState = JSON.parse(JSON.stringify(loadedState)) as GameState;

  // Calculate global production rates for efficiency
  const globalProduction: Record<string, number> = {};
  Object.values(newState.biomes).forEach((b) => {
    const { production } = calculateBiomeProductionRates(b);
    Object.entries(production).forEach(([resId, rate]) => {
      globalProduction[resId] = (globalProduction[resId] || 0) + rate;
    });
  });

  // Count total installed power cells for resonance calculation
  const totalInstalledCells = countInstalledPowerCells(loadedState.biomes);

  // Process each biome's automations
  (Object.keys(newState.biomes) as BiomeId[]).forEach((biomeId) => {
    const biome = newState.biomes[biomeId];

    if (!biome.activated || biome.automations.length === 0) return;

    biome.automations.forEach((automation) => {
      const config = AUTOMATIONS[automation.type as AutomationType] as AutomationConfig | undefined;
      if (!config) return;

      // Calculate production rate
      let productionRate = calculateProductionRate(config.baseProductionRate, automation.level);

      // Apply power cell bonus with resonance
      const basePowerCellBonus = automation.powerCell?.bonus || 0;
      const effectivePowerCellBonus = getEffectivePowerCellBonus(
        basePowerCellBonus,
        totalInstalledCells,
        loadedState.prestige.unlockedSkills
      );
      if (effectivePowerCellBonus > 0) {
        productionRate *= (1 + effectivePowerCellBonus);
      }

      // Calculate efficiency based on resource availability
      const efficiency = getAutomationEfficiency(automation, globalProduction);

      // Apply offline efficiency multiplier (20%)
      const effectiveRate = productionRate * efficiency * OFFLINE_EFFICIENCY_MULTIPLIER;

      // Consume resources (also at reduced rate)
      if (config.consumes && config.consumes.length > 0) {
        config.consumes.forEach((consume: { resourceId: ResourceId; amount: number }) => {
          const amountToConsume = consume.amount * effectiveRate * minutesToProcess;

          // Try to consume from all biomes
          let remaining = amountToConsume;
          for (const bState of Object.values(newState.biomes)) {
            if (remaining <= 0) break;
            const available = bState.resources[consume.resourceId] || 0;
            if (available > 0) {
              const toDeduct = Math.min(available, remaining);
              bState.resources[consume.resourceId] = Math.max(0, available - toDeduct);
              remaining -= toDeduct;
            }
          }
        });
      }

      // Produce resources
      config.produces.forEach((produce: { resourceId: ResourceId; amount: number }) => {
        const amountToProduce = produce.amount * effectiveRate * minutesToProcess;
        const current = biome.resources[produce.resourceId] || 0;
        biome.resources[produce.resourceId] = current + amountToProduce;

        // Track production
        resourcesProduced[produce.resourceId] = (resourcesProduced[produce.resourceId] || 0) + amountToProduce;
      });

      // Produce food
      if (config.producesFood && config.producesFood.length > 0) {
        config.producesFood.forEach((foodProduce: { foodId: FoodId; amount: number }) => {
          const amountToProduce = foodProduce.amount * effectiveRate * minutesToProcess;
          const current = newState.food[foodProduce.foodId] || 0;
          newState.food[foodProduce.foodId] = current + amountToProduce;

          // Track food production
          foodProduced[foodProduce.foodId] = (foodProduced[foodProduce.foodId] || 0) + amountToProduce;
        });
      }
    });
  });

  newState.lastTick = now;
  console.log('✅ Offline progress applied', { resourcesProduced, foodProduced });

  return {
    state: newState,
    offlineSeconds,
    cappedMinutes: minutesToProcess,
    resourcesProduced,
    foodProduced,
    wasOnExpedition: false,
  };
}
