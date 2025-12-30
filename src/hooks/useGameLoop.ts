import { useEffect, useRef } from 'react';
import { useGame } from '../game/state/GameContext';
import { AUTOMATIONS } from '../game/config/automations';
import { RESOURCES } from '../game/config/resources';
import { BiomeId } from '../types/game.types';
import { calculateProductionRate } from '../utils/calculations';
import { calculateBiomeProductionRates, getAutomationEfficiency } from '../utils/allocation';
import { getSkillTreeBonus, countInstalledPowerCells, getEffectivePowerCellBonus } from '../game/config/skillTree';
import { getMasteryBonus } from '../game/config/achievements';

const TICK_INTERVAL = 1000; // 1 second
const SAVE_INTERVAL = 5000; // 5 seconds (reduced from 30s for better save reliability)

export function useGameLoop() {
  const { state, dispatch } = useGame();
  const lastTickRef = useRef<number>(Date.now());
  const lastSaveRef = useRef<number>(Date.now());

  // Use refs to avoid recreating interval on every state change
  const stateRef = useRef(state);
  const dispatchRef = useRef(dispatch);

  // Update refs when state/dispatch change
  useEffect(() => {
    stateRef.current = state;
    dispatchRef.current = dispatch;
  }, [state, dispatch]);

  // Game loop - runs every second
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const now = Date.now();
      const deltaTimeSeconds = (now - lastTickRef.current) / 1000;
      const deltaTimeMinutes = deltaTimeSeconds / 60;

      lastTickRef.current = now;

      // Get current state snapshot from ref
      const currentState = stateRef.current;
      const currentBiomes = currentState.biomes;
      const currentExpedition = currentState.panda.expedition;

      // Don't process if expedition is active (game paused during expedition)
      if (currentExpedition !== null) {
        return;
      }

      // Get skill tree and mastery bonuses
      const unlockedSkills = currentState.prestige.unlockedSkills;
      const productionSpeedBonus = getSkillTreeBonus(unlockedSkills, 'production_speed');
      const masteryBonus = getMasteryBonus(currentState.achievements?.unlocked || []);
      const totalInstalledCells = countInstalledPowerCells(currentBiomes);

      // Context for production calculations
      const productionContext = {
        unlockedSkills,
        unlockedAchievements: currentState.achievements?.unlocked || [],
        allBiomes: currentBiomes,
      };

      // Calculate global production rates from ALL biomes for efficiency calculation
      const globalProduction: Record<string, number> = {};
      Object.values(currentBiomes).forEach((b) => {
        const { production } = calculateBiomeProductionRates(b, productionContext);
        Object.entries(production).forEach(([resId, rate]) => {
          globalProduction[resId] = (globalProduction[resId] || 0) + rate;
        });
      });

      // Process each biome's automations
      Object.keys(currentBiomes).forEach((biomeKey) => {
        const biomeId = biomeKey as BiomeId;
        const biome = currentBiomes[biomeId];

        if (!biome.activated || biome.automations.length === 0) return;

        biome.automations.forEach((automation) => {
          const config = AUTOMATIONS[automation.type];
          if (!config) return;

          // Skip paused automations
          if (automation.paused) return;

          // Calculate effective power cell bonus with skill bonuses
          const basePowerCellBonus = automation.powerCell?.bonus || 0;
          const effectivePowerCellBonus = getEffectivePowerCellBonus(
            basePowerCellBonus,
            totalInstalledCells,
            unlockedSkills
          );

          // Calculate production rate with level scaling, skill bonuses, mastery, and power cell
          const productionRate = calculateProductionRate(
            config.baseProductionRate,
            automation.level,
            productionSpeedBonus + masteryBonus.productionBonus,
            effectivePowerCellBonus
          );

          // Calculate efficiency based on available inputs from ALL biomes (global production)
          const efficiency = getAutomationEfficiency(automation, globalProduction, productionContext);

          // Apply efficiency to production rate
          const effectiveRate = productionRate * efficiency;

          // Consume inputs from ALL biomes (cross-biome resource sharing)
          if (config.consumes && config.consumes.length > 0) {
            config.consumes.forEach((consume) => {
              const amountToConsume = consume.amount * effectiveRate * deltaTimeMinutes;

              // Try to consume from all biomes until we have enough
              let remaining = amountToConsume;
              for (const [bId, bState] of Object.entries(currentBiomes)) {
                if (remaining <= 0) break;
                const available = bState.resources[consume.resourceId] || 0;
                if (available > 0) {
                  const toDeduct = Math.min(available, remaining);
                  dispatchRef.current({
                    type: 'GATHER_RESOURCE',
                    payload: {
                      biomeId: bId as BiomeId,
                      resourceId: consume.resourceId,
                      amount: -toDeduct,
                    },
                  });
                  remaining -= toDeduct;
                }
              }
            });
          }

          // Produce resources (scaled by efficiency)
          config.produces.forEach((produce) => {
            const amountToProduce = produce.amount * effectiveRate * deltaTimeMinutes;
            const currentAmount = biome.resources[produce.resourceId] || 0;

            // Check if this is the first time we'll have >= 1 of this intermediate resource
            const resourceConfig = RESOURCES[produce.resourceId];
            if (
              resourceConfig?.category === 'intermediate' &&
              currentAmount < 1 &&
              currentAmount + amountToProduce >= 1 &&
              !stateRef.current.discoveredProducedResources?.includes(produce.resourceId) &&
              !stateRef.current.pendingResourceDiscoveries?.includes(produce.resourceId)
            ) {
              // Queue this resource for discovery popup
              dispatchRef.current({
                type: 'QUEUE_RESOURCE_DISCOVERY',
                payload: { resourceId: produce.resourceId },
              });
            }

            dispatchRef.current({
              type: 'GATHER_RESOURCE',
              payload: {
                biomeId,
                resourceId: produce.resourceId,
                amount: amountToProduce,
              },
            });
          });

          // Produce food (scaled by efficiency)
          if (config.producesFood && config.producesFood.length > 0) {
            config.producesFood.forEach((foodProduce) => {
              const amountToProduce = foodProduce.amount * effectiveRate * deltaTimeMinutes;
              const currentFoodAmount = stateRef.current.food[foodProduce.foodId] || 0;

              // Check if this is the first time we'll have >= 1 of this food
              // Only track non-primary foods (berries is a primary food, always available)
              const isPrimaryFood = foodProduce.foodId === 'berries';
              if (
                !isPrimaryFood &&
                currentFoodAmount < 1 &&
                currentFoodAmount + amountToProduce >= 1 &&
                !stateRef.current.discoveredProducedFoods?.includes(foodProduce.foodId) &&
                !stateRef.current.pendingFoodDiscoveries?.includes(foodProduce.foodId)
              ) {
                // Queue this food for discovery popup
                dispatchRef.current({
                  type: 'QUEUE_FOOD_DISCOVERY',
                  payload: { foodId: foodProduce.foodId },
                });
              }

              dispatchRef.current({
                type: 'GATHER_FOOD',
                payload: {
                  foodId: foodProduce.foodId,
                  amount: amountToProduce,
                },
              });
            });
          }
        });
      });

      // Auto-save every 5 seconds
      if (now - lastSaveRef.current >= SAVE_INTERVAL) {
        // Save to localStorage with quota handling
        try {
          localStorage.setItem('pandactory-save', JSON.stringify(stateRef.current));
        } catch (e: unknown) {
          const error = e as { name?: string };
          if (error.name === 'QuotaExceededError') {
            // Try to clean up old saves or non-essential data
            try {
              // Remove any non-essential keys
              const keysToRemove: string[] = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key !== 'pandactory-save' && key !== 'pandactory-current-view') {
                  keysToRemove.push(key);
                }
              }
              keysToRemove.forEach(key => localStorage.removeItem(key));

              // Try saving again
              localStorage.setItem('pandactory-save', JSON.stringify(stateRef.current));
            } catch {
              alert('Warning: Unable to save game due to storage limits. Consider exporting your save file.');
            }
          }
        }
        dispatchRef.current({ type: 'SAVE_GAME' });
        lastSaveRef.current = now;
      }
    }, TICK_INTERVAL);

    return () => clearInterval(gameLoop);
  }, []); // Empty deps - interval never recreates, uses refs for latest values

  // Save on page unload (F5, close tab, etc)
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem('pandactory-save', JSON.stringify(state));
      } catch {
        // Failed to save on unload - ignore
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

  // Note: Offline progress calculation is handled in GameContext.tsx getInitialState
}
