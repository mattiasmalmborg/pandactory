import { useEffect, useRef } from 'react';
import { useGame } from '../game/state/GameContext';
import { AUTOMATIONS } from '../game/config/automations';
import { RESOURCES } from '../game/config/resources';
import { BIOMES } from '../game/config/biomes';
import { FOOD_ITEMS } from '../game/config/food';
import { BiomeId } from '../types/game.types';
import { createProductionContext, getAutomationProductionRate } from '../utils/calculations';
import { calculateBiomeProductionRates, getAutomationEfficiency } from '../utils/allocation';
import { hasArtifactEffect, getActiveSetBonuses } from '../game/config/artifacts';
import { STORAGE_KEYS } from '../config/storage';

const TICK_INTERVAL = 1000; // 1 second
const SAVE_INTERVAL = 5000; // 5 seconds (reduced from 30s for better save reliability)

// Artifact passive effect intervals (in ms)
const OVERGROWTH_INTERVAL = 30_000;   // 30 seconds
const DRIP_FEED_INTERVAL = 300_000;   // 5 minutes
const SOLAR_FLARE_INTERVAL = 600_000; // 10 minutes
const HEARTBEAT_INTERVAL = 47_000;    // 47 seconds

export function useGameLoop() {
  const { state, dispatch } = useGame();
  const lastTickRef = useRef<number>(Date.now());
  const lastSaveRef = useRef<number>(Date.now());

  // Artifact passive effect timers
  const lastOvergrowthRef = useRef<number>(Date.now());
  const lastDripFeedRef = useRef<number>(Date.now());
  const lastSolarFlareRef = useRef<number>(Date.now());
  const lastHeartbeatRef = useRef<number>(Date.now());

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

      // Context for production calculations
      const productionContext = createProductionContext(currentState);

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

          // Calculate production rate with all bonuses (pass artifacts for thermal_vent)
          const productionRate = getAutomationProductionRate(automation, productionContext, currentState.artifacts?.inventory);

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

      // === Artifact Passive Effects ===
      const inventory = currentState.artifacts?.inventory || [];
      const setBonuses = getActiveSetBonuses(inventory);

      // Overgrowth: auto-gather in current biome every 30s (20s with Forest Set 2/3)
      const forestSet = setBonuses.get('lush_forest') || 0;
      const overgrowthInterval = forestSet >= 2 ? OVERGROWTH_INTERVAL * 2 / 3 : OVERGROWTH_INTERVAL;
      if (hasArtifactEffect(inventory, 'overgrowth') && now - lastOvergrowthRef.current >= overgrowthInterval) {
        lastOvergrowthRef.current = now;
        // Gather from current biome's primary resources (or ALL biomes with Forest Set 3/3)
        const targetBiomes = forestSet >= 3
          ? currentState.unlockedBiomes
          : [currentState.player.currentBiome];

        for (const bId of targetBiomes) {
          const biomeConfig = BIOMES[bId];
          if (!biomeConfig) continue;
          for (const resourceId of biomeConfig.primaryResources) {
            // Food items (e.g. berries) go to state.food, not biome resources
            if (resourceId in FOOD_ITEMS) {
              dispatchRef.current({
                type: 'GATHER_FOOD',
                payload: { foodId: resourceId as string as import('../types/game.types').FoodId, amount: 1 },
              });
            } else {
              dispatchRef.current({
                type: 'GATHER_RESOURCE',
                payload: { biomeId: bId, resourceId, amount: 1 },
              });
            }
          }
        }
      }

      // Drip Feed: +1 Research Data every 5 minutes
      if (hasArtifactEffect(inventory, 'drip_feed') && now - lastDripFeedRef.current >= DRIP_FEED_INTERVAL) {
        lastDripFeedRef.current = now;
        // Lake Set 2/3: +50% Research Data (rounds to 1 or 2)
        const lakeSet = setBonuses.get('misty_lake') || 0;
        const rdAmount = lakeSet >= 2 ? 2 : 1;
        dispatchRef.current({
          type: 'UPDATE_CONTRACTS',
          payload: {
            contracts: {
              ...currentState.contracts,
              researchData: currentState.contracts.researchData + rdAmount,
              totalResearchDataEarned: currentState.contracts.totalResearchDataEarned + rdAmount,
            },
          },
        });
      }

      // Solar Flare: every 10 min (or 5 min with Desert Set 3/3), random automation 5x burst
      const desertSet = setBonuses.get('arid_desert') || 0;
      const solarFlareInterval = desertSet >= 3 ? SOLAR_FLARE_INTERVAL / 2 : SOLAR_FLARE_INTERVAL;
      if (hasArtifactEffect(inventory, 'solar_flare') && now - lastSolarFlareRef.current >= solarFlareInterval) {
        lastSolarFlareRef.current = now;
        // Pick a random active automation from any biome
        const allAutomations: { biomeId: BiomeId; automation: typeof currentBiomes[BiomeId]['automations'][0] }[] = [];
        for (const [bId, bState] of Object.entries(currentBiomes)) {
          if (!bState.activated) continue;
          for (const auto of bState.automations) {
            if (!auto.paused) allAutomations.push({ biomeId: bId as BiomeId, automation: auto });
          }
        }
        if (allAutomations.length > 0) {
          const pick = allAutomations[Math.floor(Math.random() * allAutomations.length)];
          const autoConfig = AUTOMATIONS[pick.automation.type];
          if (autoConfig) {
            const rate = getAutomationProductionRate(pick.automation, productionContext, inventory);
            // 5x burst = 5 minutes worth of production
            const burstMinutes = 5;
            autoConfig.produces.forEach(produce => {
              dispatchRef.current({
                type: 'GATHER_RESOURCE',
                payload: {
                  biomeId: pick.biomeId,
                  resourceId: produce.resourceId,
                  amount: produce.amount * rate * burstMinutes,
                },
              });
            });
            if (autoConfig.producesFood) {
              autoConfig.producesFood.forEach(fp => {
                dispatchRef.current({
                  type: 'GATHER_FOOD',
                  payload: { foodId: fp.foodId, amount: fp.amount * rate * burstMinutes },
                });
              });
            }
          }
        }
      }

      // Heartbeat: bonus production tick every 47s (or 30s with Cavern Set 3/3)
      const cavernSet = setBonuses.get('crystal_caverns') || 0;
      const heartbeatInterval = cavernSet >= 3 ? 30_000 : HEARTBEAT_INTERVAL;
      if (hasArtifactEffect(inventory, 'heartbeat') && now - lastHeartbeatRef.current >= heartbeatInterval) {
        lastHeartbeatRef.current = now;
        // Trigger one full minute of production across ALL biomes
        Object.keys(currentBiomes).forEach((biomeKey) => {
          const bId = biomeKey as BiomeId;
          const biome = currentBiomes[bId];
          if (!biome.activated || biome.automations.length === 0) return;

          biome.automations.forEach((automation) => {
            const config = AUTOMATIONS[automation.type];
            if (!config || automation.paused) return;

            const rate = getAutomationProductionRate(automation, productionContext, inventory);
            const eff = getAutomationEfficiency(automation, globalProduction, productionContext);
            const effectiveRate = rate * eff;

            // Produce 1 minute worth
            config.produces.forEach(produce => {
              dispatchRef.current({
                type: 'GATHER_RESOURCE',
                payload: { biomeId: bId, resourceId: produce.resourceId, amount: produce.amount * effectiveRate },
              });
            });
            if (config.producesFood) {
              config.producesFood.forEach(fp => {
                dispatchRef.current({
                  type: 'GATHER_FOOD',
                  payload: { foodId: fp.foodId, amount: fp.amount * effectiveRate },
                });
              });
            }
          });
        });
      }

      // Auto-save every 5 seconds
      if (now - lastSaveRef.current >= SAVE_INTERVAL) {
        // Save to localStorage with quota handling
        try {
          localStorage.setItem(STORAGE_KEYS.save, JSON.stringify(stateRef.current));
        } catch (e: unknown) {
          const error = e as { name?: string };
          if (error.name === 'QuotaExceededError') {
            // Try to clean up old saves or non-essential data
            try {
              // Remove any non-essential keys
              const keysToRemove: string[] = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key !== STORAGE_KEYS.save && key !== STORAGE_KEYS.currentView) {
                  keysToRemove.push(key);
                }
              }
              keysToRemove.forEach(key => localStorage.removeItem(key));

              // Try saving again
              localStorage.setItem(STORAGE_KEYS.save, JSON.stringify(stateRef.current));
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
        localStorage.setItem(STORAGE_KEYS.save, JSON.stringify(state));
      } catch {
        // Failed to save on unload - ignore
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

  // Note: Offline progress calculation is handled in GameContext.tsx getInitialState
}
