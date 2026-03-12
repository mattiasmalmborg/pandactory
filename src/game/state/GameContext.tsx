import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GameAction, FoodId, BiomeId, ResourceId } from '../../types/game.types';
import { gameReducer, INITIAL_GAME_STATE } from './GameState';
import { applyOfflineProgress, OfflineProgressResult } from '../../utils/offlineProgress';
import { BIOMES } from '../config/biomes';
import { INITIAL_CONTRACT_STATE } from '../config/contracts';
import { INITIAL_RESEARCH_STATE } from '../config/research';
import { INITIAL_ARTIFACT_STATE } from '../config/artifacts';
import { STORAGE_KEYS } from '../../config/storage';

// Store the offline progress result globally so it can be accessed by the app
let lastOfflineProgressResult: OfflineProgressResult | null = null;

export function getLastOfflineProgressResult(): OfflineProgressResult | null {
  return lastOfflineProgressResult;
}

export function clearOfflineProgressResult(): void {
  lastOfflineProgressResult = null;
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

/**
 * Migrate old save data to ensure biome discovery resources are correct
 * - Activated biomes should have their primaryResources in discoveredResources
 * - Only discoverableResources should be discovered via expeditions
 */
function migrateGameState(state: GameState): GameState {
  let needsMigration = false;
  const migratedBiomes = { ...state.biomes };

  // For each activated biome, ensure primary resources are in discoveredResources
  Object.keys(state.biomes).forEach((biomeId) => {
    const biome = state.biomes[biomeId as BiomeId];
    const biomeConfig = BIOMES[biomeId as BiomeId];

    if (biome.activated && biomeConfig?.primaryResources) {
      const currentDiscovered = biome.discoveredResources || [];
      const primaryResources = biomeConfig.primaryResources as ResourceId[];

      // Primary resources should be discovered
      const missingPrimary = primaryResources.filter(r => !currentDiscovered.includes(r));

      if (missingPrimary.length > 0) {
        needsMigration = true;
        migratedBiomes[biomeId as BiomeId] = {
          ...biome,
          discoveredResources: [...currentDiscovered, ...missingPrimary],
        };
      }
    }
  });

  let migratedState = needsMigration ? { ...state, biomes: migratedBiomes } : state;

  // Ensure new fields exist for older saves
  if (!migratedState.discoveredProducedResources) {
    migratedState = { ...migratedState, discoveredProducedResources: [] };
  }
  if (!migratedState.pendingResourceDiscoveries) {
    migratedState = { ...migratedState, pendingResourceDiscoveries: [] };
  }
  if (!migratedState.discoveredProducedFoods) {
    migratedState = { ...migratedState, discoveredProducedFoods: [] };
  }
  if (!migratedState.pendingFoodDiscoveries) {
    migratedState = { ...migratedState, pendingFoodDiscoveries: [] };
  }

  // Migrate old food IDs to new ones
  const oldToNewFoodMapping: Record<string, FoodId> = {
    'cactus_fruit': 'cactus_juice',
  };

  // Migrate food inventory - use Record<string, number> to handle legacy food IDs
  const migratedFood: Record<string, number> = { ...migratedState.food };
  let foodMigrated = false;
  Object.entries(oldToNewFoodMapping).forEach(([oldId, newId]) => {
    if (migratedFood[oldId] !== undefined) {
      const oldAmount = migratedFood[oldId];
      migratedFood[newId] = (migratedFood[newId] || 0) + oldAmount;
      delete migratedFood[oldId];
      foodMigrated = true;
    }
  });

  // Remove deleted food items from inventory
  const deletedFoodIds = ['protein_bars', 'vegetables'];
  deletedFoodIds.forEach(deletedId => {
    if (migratedFood[deletedId] !== undefined) {
      delete migratedFood[deletedId];
      foodMigrated = true;
    }
  });

  if (foodMigrated) {
    migratedState = { ...migratedState, food: migratedFood };
    needsMigration = true;
  }

  // Remove deleted resources (algae) and old food items from biome resources
  const deletedResourceIds = ['algae', 'cactus_fruit', 'protein_bars', 'vegetables'];
  const deletedAutomationTypes = ['algae_harvester', 'algae_processor'];
  const biomesToClean = { ...migratedState.biomes };
  let biomesResourcesCleaned = false;

  Object.keys(biomesToClean).forEach(biomeKey => {
    const biome = biomesToClean[biomeKey as BiomeId];
    // Use Record<string, number> to handle legacy resource IDs not in ResourceId type
    const cleanedResources: Record<string, number> = { ...biome.resources };
    let biomeChanged = false;

    deletedResourceIds.forEach(deletedId => {
      if (cleanedResources[deletedId] !== undefined) {
        delete cleanedResources[deletedId];
        biomeChanged = true;
      }
    });

    // Also clean up discoveredResources
    const cleanedDiscovered = biome.discoveredResources?.filter(
      resId => !deletedResourceIds.includes(resId)
    ) || [];

    // Remove deleted automation instances
    const cleanedAutomations = biome.automations.filter(
      automation => !deletedAutomationTypes.includes(automation.type)
    );
    const automationsRemoved = cleanedAutomations.length !== biome.automations.length;
    if (automationsRemoved) {
      biomeChanged = true;
    }

    if (biomeChanged || cleanedDiscovered.length !== (biome.discoveredResources?.length || 0)) {
      biomesToClean[biomeKey as BiomeId] = {
        ...biome,
        resources: cleanedResources,
        discoveredResources: cleanedDiscovered,
        automations: automationsRemoved ? cleanedAutomations : biome.automations,
      };
      biomesResourcesCleaned = true;
    }
  });

  if (biomesResourcesCleaned) {
    migratedState = { ...migratedState, biomes: biomesToClean };
    needsMigration = true;
  }

  // Migrate discovered/pending food lists
  if (migratedState.discoveredProducedFoods) {
    const migratedDiscoveredFoods = migratedState.discoveredProducedFoods
      .map(foodId => oldToNewFoodMapping[foodId] || foodId)
      .filter(foodId => !deletedFoodIds.includes(foodId)) as FoodId[];
    if (JSON.stringify(migratedDiscoveredFoods) !== JSON.stringify(migratedState.discoveredProducedFoods)) {
      migratedState = { ...migratedState, discoveredProducedFoods: migratedDiscoveredFoods };
      needsMigration = true;
    }
  }

  if (migratedState.pendingFoodDiscoveries) {
    const migratedPendingFoods = migratedState.pendingFoodDiscoveries
      .map(foodId => oldToNewFoodMapping[foodId] || foodId)
      .filter(foodId => !deletedFoodIds.includes(foodId)) as FoodId[];
    if (JSON.stringify(migratedPendingFoods) !== JSON.stringify(migratedState.pendingFoodDiscoveries)) {
      migratedState = { ...migratedState, pendingFoodDiscoveries: migratedPendingFoods };
      needsMigration = true;
    }
  }

  // Migrate achievements for older saves
  if (!migratedState.achievements) {
    migratedState = {
      ...migratedState,
      achievements: {
        unlocked: [],
        pending: [],
      },
    };
  }

  // Migrate lifetimeStats for older saves
  if (!migratedState.lifetimeStats) {
    migratedState = {
      ...migratedState,
      lifetimeStats: {
        totalResourcesGathered: 0,
        totalAutomationsBuilt: 0,
        totalUpgradesPurchased: 0,
        totalExpeditionsCompleted: 0,
        expeditionsByTier: {
          quick_dash: 0,
          quick_scout: 0,
          standard_expedition: 0,
          deep_exploration: 0,
          epic_journey: 0,
        },
        totalSessions: 0,
        totalChoresCompleted: 0,
      },
    };
  }

  // Migrate gameStartTime for older saves (use lastSave as fallback)
  if (!migratedState.gameStartTime) {
    migratedState = {
      ...migratedState,
      gameStartTime: migratedState.lastSave || Date.now(),
    };
  }

  // Migrate totalSessions for older saves and increment for new session
  if (migratedState.lifetimeStats.totalSessions === undefined) {
    migratedState = {
      ...migratedState,
      lifetimeStats: {
        ...migratedState.lifetimeStats,
        totalSessions: 1,
      },
    };
  } else {
    // Increment session count for returning players
    migratedState = {
      ...migratedState,
      lifetimeStats: {
        ...migratedState.lifetimeStats,
        totalSessions: migratedState.lifetimeStats.totalSessions + 1,
      },
    };
  }

  // Migrate contracts (added in v1.5.0)
  if (!migratedState.contracts) {
    migratedState = {
      ...migratedState,
      contracts: { ...INITIAL_CONTRACT_STATE },
    };
  }

  // Migrate research (added in v1.5.0)
  if (!migratedState.research) {
    migratedState = {
      ...migratedState,
      research: { ...INITIAL_RESEARCH_STATE },
    };
  }

  // Migrate activeResearch field (added for research timers)
  if (migratedState.research && migratedState.research.activeResearch === undefined) {
    migratedState = {
      ...migratedState,
      research: {
        ...migratedState.research,
        activeResearch: null,
      },
    };
  }

  // Migrate artifacts (added in Fas 4)
  if (!migratedState.artifacts) {
    migratedState = {
      ...migratedState,
      artifacts: { ...INITIAL_ARTIFACT_STATE },
    };
  }

  // Veteran welcome bonus: give returning players Research Data based on progression
  // Triggers once when a pre-contracts save first loads the new version
  if (
    migratedState.contracts?.researchData === 0 &&
    migratedState.contracts?.totalResearchDataEarned === 0 &&
    !migratedState.pendingVeteranBonus &&
    migratedState.lifetimeStats
  ) {
    const stats = migratedState.lifetimeStats;
    const hasProgression = stats.totalAutomationsBuilt > 0 || stats.totalExpeditionsCompleted > 0;

    if (hasProgression) {
      const autoBonus = Math.min(25, stats.totalAutomationsBuilt);
      const expBonus = Math.min(30, stats.totalExpeditionsCompleted * 2);
      const upgradeBonus = Math.min(20, Math.floor(stats.totalUpgradesPurchased / 5));
      const totalBonus = 25 + autoBonus + expBonus + upgradeBonus;

      const reasons: string[] = [];
      if (stats.totalAutomationsBuilt > 0) reasons.push(`${stats.totalAutomationsBuilt} automations built`);
      if (stats.totalExpeditionsCompleted > 0) reasons.push(`${stats.totalExpeditionsCompleted} expeditions completed`);
      if (stats.totalUpgradesPurchased > 0) reasons.push(`${stats.totalUpgradesPurchased} upgrades purchased`);

      migratedState = {
        ...migratedState,
        contracts: {
          ...migratedState.contracts,
          researchData: totalBonus,
          totalResearchDataEarned: totalBonus,
        },
        pendingVeteranBonus: {
          amount: totalBonus,
          reason: reasons.join(', '),
        },
      };
    }
  }

  return migratedState;
}

// Try to load initial state from localStorage
function getInitialState(): GameState {
  try {
    // Check if we're coming back from a reset (check both localStorage and sessionStorage)
    const shouldReset = localStorage.getItem(STORAGE_KEYS.resetPending) ||
                        sessionStorage.getItem(STORAGE_KEYS.resetPending);
    if (shouldReset) {
      // Clear all flags and save data
      localStorage.removeItem(STORAGE_KEYS.resetPending);
      sessionStorage.removeItem(STORAGE_KEYS.resetPending);
      localStorage.removeItem(STORAGE_KEYS.save);
      localStorage.removeItem(STORAGE_KEYS.currentView);
      return INITIAL_GAME_STATE;
    }

    const saved = localStorage.getItem(STORAGE_KEYS.save);
    if (saved) {
      let loadedState = JSON.parse(saved);

      // Apply migrations for older saves
      loadedState = migrateGameState(loadedState);

      // Apply offline progress (max 8 hours) with error handling
      try {
        const offlineResult = applyOfflineProgress(loadedState);
        lastOfflineProgressResult = offlineResult;
        return offlineResult.state;
      } catch (offlineError) {
        // If offline progress fails, return the loaded state without offline progress
        return loadedState;
      }
    }
  } catch {
    // Failed to load - start fresh
  }
  return INITIAL_GAME_STATE;
}

// Flag to prevent auto-save during reset
let isResetting = false;

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE, getInitialState);
  const isFirstRender = React.useRef(true);

  // Expose dev-tools functions globally
  React.useEffect(() => {
    // Store dispatch and state in refs that can be accessed by the global functions
    const currentDispatch = dispatch;
    const currentState = state;
    const currentBiomeId = state.player.currentBiome;

    window.resetGame = () => {
      try {
        // Set flag to prevent auto-save from overwriting
        isResetting = true;

        // Set sessionStorage flag so getInitialState knows to reset on reload
        sessionStorage.setItem(STORAGE_KEYS.resetPending, 'true');

        // Reload - the reset will happen in getInitialState on next load
        window.location.reload();
      } catch {
        isResetting = false;
      }
    };

    window.getGameState = () => {
      return currentState;
    };

    window.addResource = (resourceId: string, amount: number) => {
      // Find the biome that owns this resource
      let targetBiome: BiomeId = currentBiomeId;
      for (const [bId, config] of Object.entries(BIOMES)) {
        const allResources = [...(config.primaryResources || []), ...(config.discoverableResources || [])];
        if (allResources.includes(resourceId as ResourceId)) {
          targetBiome = bId as BiomeId;
          break;
        }
      }
      currentDispatch({
        type: 'GATHER_RESOURCE',
        payload: { biomeId: targetBiome, resourceId: resourceId as ResourceId, amount },
      });
    };

    window.addFood = (foodId: FoodId, amount: number) => {
      currentDispatch({
        type: 'GATHER_FOOD',
        payload: { foodId, amount },
      });
    };

    return () => {
      delete window.resetGame;
      delete window.getGameState;
      delete window.addResource;
      delete window.addFood;
    };
  }, [state, dispatch]);

  // Auto-save after every action (with debouncing via useEffect)
  // Skip first render to avoid overwriting dev-tools changes
  // Skip if we're in the process of resetting
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Don't save if we're resetting - this prevents overwriting the cleared localStorage
    if (isResetting) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.save, JSON.stringify(state));
    } catch {
      // Failed to save - ignore
    }
  }, [state]);

  // Listen for localStorage changes from other tabs/windows (like dev-tools)
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.save && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          dispatch({ type: 'LOAD_GAME', payload: { gameState: newState } });
        } catch {
          // Failed to load external save - ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
