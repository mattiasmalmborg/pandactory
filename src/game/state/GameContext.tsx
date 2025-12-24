import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GameAction, FoodId, BiomeId, ResourceId } from '../../types/game.types';
import { gameReducer, INITIAL_GAME_STATE } from './GameState';
import { applyOfflineProgress, OfflineProgressResult } from '../../utils/offlineProgress';
import { BIOMES } from '../config/biomes';

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
      const discoverableResources = (biomeConfig.discoverableResources || []) as ResourceId[];

      // Primary resources should be discovered
      const missingPrimary = primaryResources.filter(r => !currentDiscovered.includes(r));

      // Check if any discoverable resources are incorrectly in the discovered list
      // (This could happen from old bugs or manual testing)
      // We don't remove them, but we log for debugging
      const incorrectlyDiscovered = currentDiscovered.filter(r =>
        discoverableResources.includes(r) && !state.biomes[biomeId as BiomeId].resources[r]
      );

      if (missingPrimary.length > 0) {
        needsMigration = true;
        console.log(`🔄 Migration: Adding missing primary resources to ${biomeId}:`, missingPrimary);
        migratedBiomes[biomeId as BiomeId] = {
          ...biome,
          discoveredResources: [...currentDiscovered, ...missingPrimary],
        };
      }

      if (incorrectlyDiscovered.length > 0) {
        console.log(`⚠️ Note: ${biomeId} has discoverable resources marked as discovered:`, incorrectlyDiscovered);
      }
    }
  });

  let migratedState = needsMigration ? { ...state, biomes: migratedBiomes } : state;

  // Ensure new fields exist for older saves
  if (!migratedState.discoveredProducedResources) {
    migratedState = { ...migratedState, discoveredProducedResources: [] };
    console.log('🔄 Migration: Added discoveredProducedResources field');
  }
  if (!migratedState.pendingResourceDiscoveries) {
    migratedState = { ...migratedState, pendingResourceDiscoveries: [] };
    console.log('🔄 Migration: Added pendingResourceDiscoveries field');
  }
  if (!migratedState.discoveredProducedFoods) {
    migratedState = { ...migratedState, discoveredProducedFoods: [] };
    console.log('🔄 Migration: Added discoveredProducedFoods field');
  }
  if (!migratedState.pendingFoodDiscoveries) {
    migratedState = { ...migratedState, pendingFoodDiscoveries: [] };
    console.log('🔄 Migration: Added pendingFoodDiscoveries field');
  }

  // Migrate old food IDs to new ones
  const oldToNewFoodMapping: Record<string, FoodId> = {
    'cactus_fruit': 'cactus_juice',
  };

  // Migrate food inventory
  const migratedFood = { ...migratedState.food };
  let foodMigrated = false;
  Object.entries(oldToNewFoodMapping).forEach(([oldId, newId]) => {
    if ((migratedFood as any)[oldId] !== undefined) {
      const oldAmount = (migratedFood as any)[oldId];
      migratedFood[newId] = (migratedFood[newId] || 0) + oldAmount;
      delete (migratedFood as any)[oldId];
      foodMigrated = true;
      console.log(`🔄 Migration: Converted ${oldId} (${oldAmount}) to ${newId}`);
    }
  });

  // Remove deleted food items from inventory
  const deletedFoodIds = ['protein_bars', 'vegetables'];
  deletedFoodIds.forEach(deletedId => {
    if ((migratedFood as any)[deletedId] !== undefined) {
      delete (migratedFood as any)[deletedId];
      foodMigrated = true;
      console.log(`🔄 Migration: Removed deleted food ${deletedId}`);
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
    const cleanedResources = { ...biome.resources };
    let biomeChanged = false;

    deletedResourceIds.forEach(deletedId => {
      if ((cleanedResources as any)[deletedId] !== undefined) {
        delete (cleanedResources as any)[deletedId];
        biomeChanged = true;
        console.log(`🔄 Migration: Removed deleted resource ${deletedId} from ${biomeKey}`);
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
      console.log(`🔄 Migration: Removed ${biome.automations.length - cleanedAutomations.length} deleted automation(s) from ${biomeKey}`);
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
      console.log('🔄 Migration: Updated discoveredProducedFoods');
    }
  }

  if (migratedState.pendingFoodDiscoveries) {
    const migratedPendingFoods = migratedState.pendingFoodDiscoveries
      .map(foodId => oldToNewFoodMapping[foodId] || foodId)
      .filter(foodId => !deletedFoodIds.includes(foodId)) as FoodId[];
    if (JSON.stringify(migratedPendingFoods) !== JSON.stringify(migratedState.pendingFoodDiscoveries)) {
      migratedState = { ...migratedState, pendingFoodDiscoveries: migratedPendingFoods };
      needsMigration = true;
      console.log('🔄 Migration: Updated pendingFoodDiscoveries');
    }
  }

  if (needsMigration) {
    console.log('✅ Save migration complete');
  }

  return migratedState;
}

// Try to load initial state from localStorage
function getInitialState(): GameState {
  try {
    // Check if we're coming back from a reset (check both localStorage and sessionStorage)
    const shouldReset = localStorage.getItem('pandactory-reset-pending') ||
                        sessionStorage.getItem('pandactory-reset-pending');
    if (shouldReset) {
      console.log('🔄 Reset pending - clearing localStorage and starting fresh');
      // Clear all flags and save data
      localStorage.removeItem('pandactory-reset-pending');
      sessionStorage.removeItem('pandactory-reset-pending');
      localStorage.removeItem('pandactory-save');
      localStorage.removeItem('pandactory-current-view');
      console.log('🆕 Starting new game (after reset)');
      return INITIAL_GAME_STATE;
    }

    const saved = localStorage.getItem('pandactory-save');
    if (saved) {
      let loadedState = JSON.parse(saved);
      console.log('✅ Loaded game from localStorage:', {
        wood: loadedState.biomes?.lush_forest?.resources?.wood,
        berries: loadedState.food?.berries,
        expeditionCount: loadedState.expeditionCount,
      });

      // Apply migrations for older saves
      loadedState = migrateGameState(loadedState);

      // Apply offline progress (max 8 hours)
      const offlineResult = applyOfflineProgress(loadedState);
      lastOfflineProgressResult = offlineResult;
      return offlineResult.state;
    }
  } catch (e) {
    console.error('Failed to load game from localStorage:', e);
  }
  console.log('🆕 Starting new game');
  return INITIAL_GAME_STATE;
}

// Flag to prevent auto-save during reset
let isResetting = false;

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE, getInitialState);
  const isFirstRender = React.useRef(true);

  // Expose dev-tools functions globally
  React.useEffect(() => {
    const firstSetup = !(window as any).resetGame;

    // Store dispatch and state in refs that can be accessed by the global functions
    const currentDispatch = dispatch;
    const currentState = state;
    const currentBiomeId = state.player.currentBiome;

    (window as any).resetGame = () => {
      console.log('🔄 Resetting game...');
      try {
        // Set flag to prevent auto-save from overwriting
        isResetting = true;

        // Set sessionStorage flag so getInitialState knows to reset on reload
        // This survives the page reload but not browser close
        sessionStorage.setItem('pandactory-reset-pending', 'true');
        console.log('✅ Reset flag set in sessionStorage');

        // Reload - the reset will happen in getInitialState on next load
        console.log('✅ Reloading page...');
        window.location.reload();
      } catch (e) {
        console.error('❌ Failed to reset:', e);
        isResetting = false;
      }
    };

    (window as any).getGameState = () => {
      console.log('Current game state:', currentState);
      return currentState;
    };

    (window as any).addResource = (resourceId: string, amount: number) => {
      currentDispatch({
        type: 'GATHER_RESOURCE',
        payload: { biomeId: currentBiomeId, resourceId: resourceId as any, amount },
      });
      console.log(`✅ Added ${amount} ${resourceId} to ${currentBiomeId}`);
    };

    (window as any).addFood = (foodId: FoodId, amount: number) => {
      currentDispatch({
        type: 'GATHER_FOOD',
        payload: { foodId, amount },
      });
      console.log(`✅ Added ${amount} ${foodId} food`);
    };

    // Log available functions on first setup
    if (firstSetup) {
      console.log('🛠️ Dev Tools Available:');
      console.log('  resetGame() - Reset the game and reload');
      console.log('  getGameState() - View current game state');
      console.log('  addResource(resourceId, amount) - Add resources');
      console.log('  addFood(foodId, amount) - Add food');
    }

    return () => {
      delete (window as any).resetGame;
      delete (window as any).getGameState;
      delete (window as any).addResource;
      delete (window as any).addFood;
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
      console.log('⏸️ Skipping auto-save during reset');
      return;
    }

    try {
      localStorage.setItem('pandactory-save', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  }, [state]);

  // Listen for localStorage changes from other tabs/windows (like dev-tools)
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pandactory-save' && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          console.log('🔄 Detected external save change, reloading...');
          dispatch({ type: 'LOAD_GAME', payload: { gameState: newState } });
        } catch (err) {
          console.error('Failed to load external save:', err);
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
