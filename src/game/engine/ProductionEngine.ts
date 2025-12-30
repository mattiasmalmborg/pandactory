import { GameState, BiomeId, ResourceId } from '../../types/game.types';
import { AUTOMATIONS } from '../config/automations';
import { getSkillTreeBonus, countInstalledPowerCells, getEffectivePowerCellBonus } from '../config/skillTree';
import { calculateProductionRate } from '../../utils/calculations';
import { RESOURCES } from '../config/resources';
import { getMasteryBonus } from '../config/achievements';

export interface ProductionResult {
  state: GameState;
  newlyProducedResources: ResourceId[]; // Resources produced for the first time
}

export function calculateProduction(state: GameState, deltaTimeSeconds: number): ProductionResult {
  const newState = { ...state };
  const deltaTimeMinutes = deltaTimeSeconds / 60;
  const newlyProducedResources: ResourceId[] = [];

  // Get skill tree bonuses
  const productionSpeedBonus = getSkillTreeBonus(state.prestige.unlockedSkills, 'production_speed');

  // Get mastery bonus (200% production when all achievements unlocked)
  const masteryBonus = getMasteryBonus(state.achievements?.unlocked || []);

  // Count total installed power cells for resonance calculation
  const totalInstalledCells = countInstalledPowerCells(state.biomes);

  // Process each biome's automations
  Object.keys(newState.biomes).forEach((biomeId) => {
    const biome = newState.biomes[biomeId as BiomeId];
    if (!biome.activated) return;

    biome.automations.forEach((automation) => {
      const config = AUTOMATIONS[automation.type];
      if (!config) return;

      // Skip paused automations
      if (automation.paused) return;

      // Calculate production rate with level, skill bonuses, and power cell
      // Use || 0 to handle undefined bonus values from legacy power cells
      const basePowerCellBonus = automation.powerCell?.bonus || 0;
      const effectivePowerCellBonus = getEffectivePowerCellBonus(
        basePowerCellBonus,
        totalInstalledCells,
        state.prestige.unlockedSkills
      );
      const productionRate = calculateProductionRate(
        config.baseProductionRate,
        automation.level,
        productionSpeedBonus + masteryBonus.productionBonus,
        effectivePowerCellBonus
      );

      // Check if we have enough resources to consume
      let canProduce = true;
      if (config.consumes) {
        config.consumes.forEach((consume) => {
          const required = consume.amount * deltaTimeMinutes;
          const available = biome.resources[consume.resourceId] || 0;
          if (available < required) {
            canProduce = false;
          }
        });
      }

      if (!canProduce) return;

      // Consume resources
      if (config.consumes) {
        config.consumes.forEach((consume) => {
          const amountToConsume = consume.amount * deltaTimeMinutes;
          biome.resources[consume.resourceId] =
            (biome.resources[consume.resourceId] || 0) - amountToConsume;
        });
      }

      // Produce resources (only to biome, not global)
      config.produces.forEach((produce) => {
        const previousAmount = biome.resources[produce.resourceId] || 0;
        const amountToProduce = produce.amount * productionRate * deltaTimeMinutes;
        biome.resources[produce.resourceId] = previousAmount + amountToProduce;

        // Check if this is the first time producing this resource
        // Only track intermediate resources (not raw resources - those are discovered via biomes/expeditions)
        const resourceConfig = RESOURCES[produce.resourceId];
        if (
          resourceConfig?.category === 'intermediate' &&
          previousAmount < 1 &&
          biome.resources[produce.resourceId] >= 1 &&
          !state.discoveredProducedResources.includes(produce.resourceId) &&
          !newlyProducedResources.includes(produce.resourceId)
        ) {
          newlyProducedResources.push(produce.resourceId);
        }
      });
    });
  });

  return { state: newState, newlyProducedResources };
}

export function calculateOfflineProduction(state: GameState, offlineTimeSeconds: number): ProductionResult {
  // Cap offline time to prevent extreme gains (e.g., max 8 hours)
  const maxOfflineSeconds = 8 * 60 * 60;
  const cappedOfflineTime = Math.min(offlineTimeSeconds, maxOfflineSeconds);

  // Process in 1-minute chunks to handle resource consumption properly
  let currentState = state;
  const allNewlyProducedResources: ResourceId[] = [];
  const chunksCount = Math.floor(cappedOfflineTime / 60);

  for (let i = 0; i < chunksCount; i++) {
    const result = calculateProduction(currentState, 60);
    currentState = result.state;
    // Collect newly produced resources (avoid duplicates)
    result.newlyProducedResources.forEach(resId => {
      if (!allNewlyProducedResources.includes(resId)) {
        allNewlyProducedResources.push(resId);
      }
    });
  }

  // Handle remaining seconds
  const remainingSeconds = cappedOfflineTime % 60;
  if (remainingSeconds > 0) {
    const result = calculateProduction(currentState, remainingSeconds);
    currentState = result.state;
    result.newlyProducedResources.forEach(resId => {
      if (!allNewlyProducedResources.includes(resId)) {
        allNewlyProducedResources.push(resId);
      }
    });
  }

  return { state: currentState, newlyProducedResources: allNewlyProducedResources };
}
