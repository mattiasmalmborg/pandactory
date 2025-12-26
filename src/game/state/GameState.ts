import { GameState, GameAction, ResourceId, FoodId, BiomeId } from '../../types/game.types';
import { AUTOMATIONS } from '../config/automations';
import { EXPEDITION_TIERS } from '../config/expeditions';
import { SKILL_TREE } from '../config/skillTree';
import { RESOURCES } from '../config/resources';
import { BIOMES } from '../config/biomes';

export const INITIAL_GAME_STATE: GameState = {
  player: {
    name: 'Dr. Redd Pawston III',
    currentBiome: 'lush_forest',
  },
  panda: {
    status: 'home',
    expedition: null,
  },
  biomes: {
    lush_forest: {
      id: 'lush_forest',
      resources: {} as Record<ResourceId, number>, // Start with no resources - must gather!
      automations: [],
      discovered: true,
      activated: true,
      discoveredResources: ['wood', 'stone'], // Core resources visible from start
    },
    misty_lake: {
      id: 'misty_lake',
      resources: {} as Record<ResourceId, number>,
      automations: [],
      discovered: false,
      activated: false,
      discoveredResources: [],
    },
    arid_desert: {
      id: 'arid_desert',
      resources: {} as Record<ResourceId, number>,
      automations: [],
      discovered: false,
      activated: false,
      discoveredResources: [],
    },
    frozen_tundra: {
      id: 'frozen_tundra',
      resources: {} as Record<ResourceId, number>,
      automations: [],
      discovered: false,
      activated: false,
      discoveredResources: [],
    },
    volcanic_isle: {
      id: 'volcanic_isle',
      resources: {} as Record<ResourceId, number>,
      automations: [],
      discovered: false,
      activated: false,
      discoveredResources: [],
    },
    crystal_caverns: {
      id: 'crystal_caverns',
      resources: {} as Record<ResourceId, number>,
      automations: [],
      discovered: false,
      activated: false,
      discoveredResources: [],
    },
  },
  food: {
    berries: 0, // No starter food - must produce with berry_picker!
    cactus_juice: 0,
    smoked_fish: 0,
    greenhouse_veggies: 0,
  },
  powerCellInventory: [],
  unlockedBiomes: ['lush_forest'],
  expeditionCount: 0,
  expeditionPityCounter: 0,
  discoveredProducedResources: [], // Intermediate resources discovered via production
  pendingResourceDiscoveries: [], // Queue for popup display
  discoveredProducedFoods: [], // Foods discovered via automation production
  pendingFoodDiscoveries: [], // Queue for food popup display
  prestige: {
    cosmicBambooShards: 0,
    totalPrestiges: 0,
    unlockedSkills: [],
  },
  lastTick: Date.now(),
  lastSave: Date.now(),
  version: '1.1.0',
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  // Debug logging for food changes
  if (action.type !== 'TICK' && action.type !== 'SAVE_GAME') {
    console.log('🔧 Action dispatched:', action.type, {
      currentBerries: state.food?.berries,
      action: action
    });
  }

  switch (action.type) {
    case 'GATHER_RESOURCE': {
      const { biomeId, resourceId, amount } = action.payload;

      // Auto-discover resource when produced (positive amount) for the first time
      const existingDiscovered = state.biomes[biomeId].discoveredResources || [];
      const shouldDiscover = amount > 0 && !existingDiscovered.includes(resourceId);
      const newDiscovered = shouldDiscover
        ? [...existingDiscovered, resourceId]
        : existingDiscovered;

      return {
        ...state,
        biomes: {
          ...state.biomes,
          [biomeId]: {
            ...state.biomes[biomeId],
            resources: {
              ...state.biomes[biomeId].resources,
              [resourceId]: (state.biomes[biomeId].resources[resourceId] || 0) + amount,
            },
            discoveredResources: newDiscovered,
          },
        },
      };
    }

    case 'BUILD_AUTOMATION': {
      const { biomeId, automationType } = action.payload;
      const config = AUTOMATIONS[automationType];
      if (!config) {
        console.warn(`BUILD_AUTOMATION failed: Unknown automation type "${automationType}"`);
        return state;
      }
      const newAutomation = {
        id: `${automationType}_${Date.now()}`,
        type: automationType,
        level: 1,
        biomeId,
        powerCell: null,
        baseProductionRate: config.baseProductionRate,
        upgradeSlots: config.upgradeSlots,
      };

      return {
        ...state,
        biomes: {
          ...state.biomes,
          [biomeId]: {
            ...state.biomes[biomeId],
            automations: [...state.biomes[biomeId].automations, newAutomation],
          },
        },
      };
    }

    case 'UPGRADE_AUTOMATION': {
      const { biomeId, automationId } = action.payload;
      return {
        ...state,
        biomes: {
          ...state.biomes,
          [biomeId]: {
            ...state.biomes[biomeId],
            automations: state.biomes[biomeId].automations.map((auto) =>
              auto.id === automationId ? { ...auto, level: auto.level + 1 } : auto
            ),
          },
        },
      };
    }

    case 'TOGGLE_AUTOMATION_PAUSE': {
      const { biomeId, automationId } = action.payload;
      return {
        ...state,
        biomes: {
          ...state.biomes,
          [biomeId]: {
            ...state.biomes[biomeId],
            automations: state.biomes[biomeId].automations.map((auto) =>
              auto.id === automationId ? { ...auto, paused: !auto.paused } : auto
            ),
          },
        },
      };
    }

    case 'INSTALL_POWER_CELL': {
      const { biomeId, automationId, powerCell } = action.payload;
      // Remove the first matching power cell from inventory
      const cellIndex = state.powerCellInventory.findIndex(pc => pc.tier === powerCell.tier);
      const newInventory = cellIndex !== -1
        ? [...state.powerCellInventory.slice(0, cellIndex), ...state.powerCellInventory.slice(cellIndex + 1)]
        : state.powerCellInventory;

      return {
        ...state,
        powerCellInventory: newInventory,
        biomes: {
          ...state.biomes,
          [biomeId]: {
            ...state.biomes[biomeId],
            automations: state.biomes[biomeId].automations.map((auto) =>
              auto.id === automationId
                ? { ...auto, powerCell }
                : auto
            ),
          },
        },
      };
    }

    case 'REMOVE_POWER_CELL': {
      const { biomeId, automationId } = action.payload;
      // Find the automation to get its power cell
      const automation = state.biomes[biomeId].automations.find(a => a.id === automationId);
      const removedCell = automation?.powerCell;

      return {
        ...state,
        // Return the power cell to inventory if it exists
        powerCellInventory: removedCell
          ? [...state.powerCellInventory, { tier: removedCell.tier, bonus: removedCell.bonus }]
          : state.powerCellInventory,
        biomes: {
          ...state.biomes,
          [biomeId]: {
            ...state.biomes[biomeId],
            automations: state.biomes[biomeId].automations.map((auto) =>
              auto.id === automationId ? { ...auto, powerCell: null } : auto
            ),
          },
        },
      };
    }

    case 'GATHER_FOOD': {
      const { foodId, amount } = action.payload;
      return {
        ...state,
        food: {
          ...state.food,
          [foodId]: (state.food[foodId] || 0) + amount,
        },
      };
    }

    case 'START_EXPEDITION': {
      const { tier, foodConsumed } = action.payload;
      const config = EXPEDITION_TIERS[tier];

      // Deduct food
      const newFood = { ...state.food };
      foodConsumed.forEach(({ id, amount }) => {
        newFood[id] = (newFood[id] || 0) - amount;
      });

      return {
        ...state,
        panda: {
          status: 'expedition',
          expedition: {
            tier,
            startTime: Date.now(),
            durationMs: config.durationMinutes * 60 * 1000,
            foodConsumed,
            completed: false,
            collectedAt: null,
          },
        },
        food: newFood,
        expeditionCount: state.expeditionCount + 1,
      };
    }

    case 'COLLECT_EXPEDITION': {
      const { rewards, powerCells, newBiome, newResources } = action.payload;
      const newState = { ...state };

      // Add rewards - check if food or resource
      const currentBiome = state.player.currentBiome;
      Object.entries(rewards).forEach(([resourceId, amount]) => {
        const resource = RESOURCES[resourceId as ResourceId];

        // If it's food, add to state.food instead of biome.resources
        if (resource?.category === 'food') {
          const foodId = resourceId as FoodId;
          newState.food = {
            ...newState.food,
            [foodId]: (newState.food[foodId] || 0) + amount,
          };
        } else {
          // Regular resource - add to current biome
          newState.biomes[currentBiome].resources = {
            ...newState.biomes[currentBiome].resources,
            [resourceId as ResourceId]: (newState.biomes[currentBiome].resources[resourceId as ResourceId] || 0) + amount,
          };
        }
      });

      // Add power cells to inventory
      newState.powerCellInventory = [...state.powerCellInventory, ...powerCells];

      // Unlock new biome if discovered - reset pity counter
      if (newBiome) {
        newState.biomes[newBiome].discovered = true;
        if (!newState.unlockedBiomes.includes(newBiome)) {
          newState.unlockedBiomes.push(newBiome);
        }
        // Reset pity counter on successful discovery
        newState.expeditionPityCounter = 0;
      } else {
        // Increment pity counter on failed discovery (only if there are biomes left to discover)
        const allBiomesDiscovered = newState.unlockedBiomes.length >= 6;
        if (!allBiomesDiscovered) {
          newState.expeditionPityCounter = (state.expeditionPityCounter || 0) + 1;
        }
      }

      // Add newly discovered resources to current biome's discoveredResources
      // Note: The actual resource amounts come from the rewards (added above), not here
      if (newResources && newResources.length > 0) {
        const existingDiscovered = newState.biomes[currentBiome].discoveredResources || [];
        const updatedDiscovered = [...existingDiscovered];

        newResources.forEach(resourceId => {
          // Add to discoveredResources if not already there
          if (!existingDiscovered.includes(resourceId)) {
            updatedDiscovered.push(resourceId);
          }
        });

        // Update the biome state with new discovered resources
        newState.biomes[currentBiome] = {
          ...newState.biomes[currentBiome],
          discoveredResources: updatedDiscovered,
        };
      }

      // Reset panda state
      newState.panda = {
        status: 'home',
        expedition: null,
      };

      return newState;
    }

    case 'RECALL_EXPEDITION': {
      const { partialRewards } = action.payload;
      const newState = { ...state };

      // Add partial rewards - check if food or resource
      const currentBiome = state.player.currentBiome;
      Object.entries(partialRewards).forEach(([resourceId, amount]) => {
        const resource = RESOURCES[resourceId as ResourceId];

        // If it's food, add to state.food instead of biome.resources
        if (resource?.category === 'food') {
          const foodId = resourceId as FoodId;
          newState.food = {
            ...newState.food,
            [foodId]: (newState.food[foodId] || 0) + amount,
          };
        } else {
          // Regular resource - add to current biome
          newState.biomes[currentBiome].resources = {
            ...newState.biomes[currentBiome].resources,
            [resourceId as ResourceId]: (newState.biomes[currentBiome].resources[resourceId as ResourceId] || 0) + amount,
          };
        }
      });

      // Reset panda state
      newState.panda = {
        status: 'home',
        expedition: null,
      };

      return newState;
    }

    case 'SWITCH_BIOME': {
      const { biomeId } = action.payload;
      return {
        ...state,
        player: {
          ...state.player,
          currentBiome: biomeId,
        },
      };
    }

    case 'UNLOCK_BIOME': {
      const { biomeId } = action.payload;
      return {
        ...state,
        biomes: {
          ...state.biomes,
          [biomeId]: {
            ...state.biomes[biomeId],
            discovered: true,
          },
        },
        unlockedBiomes: state.unlockedBiomes.includes(biomeId)
          ? state.unlockedBiomes
          : [...state.unlockedBiomes, biomeId],
      };
    }

    case 'ACTIVATE_BIOME': {
      const { biomeId } = action.payload;
      const biomeConfig = BIOMES[biomeId];

      // When activating a biome, auto-discover its primary resources
      const existingDiscovered = state.biomes[biomeId].discoveredResources || [];
      const primaryResources = (biomeConfig?.primaryResources || []) as ResourceId[];
      const newDiscovered = [...existingDiscovered];

      primaryResources.forEach(resourceId => {
        if (!newDiscovered.includes(resourceId)) {
          newDiscovered.push(resourceId);
        }
      });

      return {
        ...state,
        biomes: {
          ...state.biomes,
          [biomeId]: {
            ...state.biomes[biomeId],
            activated: true,
            discoveredResources: newDiscovered,
          },
        },
      };
    }

    case 'UNLOCK_SKILL': {
      const { skillId } = action.payload;
      const skill = SKILL_TREE[skillId];

      return {
        ...state,
        prestige: {
          ...state.prestige,
          cosmicBambooShards: state.prestige.cosmicBambooShards - skill.cost,
          unlockedSkills: [...state.prestige.unlockedSkills, skillId],
        },
      };
    }

    case 'PRESTIGE': {
      const { shardsEarned } = action.payload;

      // Reset everything except prestige data
      return {
        ...INITIAL_GAME_STATE,
        prestige: {
          cosmicBambooShards: state.prestige.cosmicBambooShards + shardsEarned,
          totalPrestiges: state.prestige.totalPrestiges + 1,
          unlockedSkills: state.prestige.unlockedSkills, // Skills persist!
        },
      };
    }

    case 'TICK': {
      // This will be handled by the game loop
      return {
        ...state,
        lastTick: Date.now(),
      };
    }

    case 'QUEUE_RESOURCE_DISCOVERY': {
      const { resourceId } = action.payload;
      const discovered = state.discoveredProducedResources || [];
      const pending = state.pendingResourceDiscoveries || [];
      // Only queue if not already discovered and not already pending
      if (discovered.includes(resourceId) || pending.includes(resourceId)) {
        return state;
      }
      return {
        ...state,
        pendingResourceDiscoveries: [...pending, resourceId],
      };
    }

    case 'ACKNOWLEDGE_RESOURCE_DISCOVERY': {
      const { resourceId } = action.payload;
      const discovered = state.discoveredProducedResources || [];
      const pending = state.pendingResourceDiscoveries || [];
      return {
        ...state,
        // Add to discovered list
        discoveredProducedResources: discovered.includes(resourceId)
          ? discovered
          : [...discovered, resourceId],
        // Remove from pending queue
        pendingResourceDiscoveries: pending.filter(id => id !== resourceId),
      };
    }

    case 'QUEUE_FOOD_DISCOVERY': {
      const { foodId } = action.payload;
      const discovered = state.discoveredProducedFoods || [];
      const pending = state.pendingFoodDiscoveries || [];
      // Don't queue if already discovered or already pending
      if (discovered.includes(foodId) || pending.includes(foodId)) {
        return state;
      }
      return {
        ...state,
        pendingFoodDiscoveries: [...pending, foodId],
      };
    }

    case 'ACKNOWLEDGE_FOOD_DISCOVERY': {
      const { foodId } = action.payload;
      const discovered = state.discoveredProducedFoods || [];
      const pending = state.pendingFoodDiscoveries || [];
      return {
        ...state,
        // Add to discovered list
        discoveredProducedFoods: discovered.includes(foodId)
          ? discovered
          : [...discovered, foodId],
        // Remove from pending queue
        pendingFoodDiscoveries: pending.filter(id => id !== foodId),
      };
    }

    case 'SAVE_GAME': {
      const now = Date.now();
      return {
        ...state,
        lastSave: now,
        lastTick: now, // Update lastTick so offline progress is calculated correctly
      };
    }

    case 'LOAD_GAME': {
      const loadedState = action.payload.gameState;

      // Migration: Rebuild unlockedBiomes from biomes.discovered for old saves
      // This ensures scaled expedition costs work correctly
      const migratedUnlockedBiomes: BiomeId[] = [];
      (Object.keys(loadedState.biomes) as BiomeId[]).forEach((biomeId) => {
        if (loadedState.biomes[biomeId].discovered) {
          migratedUnlockedBiomes.push(biomeId);
        }
      });

      // If migration found more biomes than currently tracked, use the migrated list
      const currentUnlocked = loadedState.unlockedBiomes || ['lush_forest'];
      const finalUnlockedBiomes = migratedUnlockedBiomes.length > currentUnlocked.length
        ? migratedUnlockedBiomes
        : currentUnlocked;

      return {
        ...loadedState,
        unlockedBiomes: finalUnlockedBiomes,
        lastTick: Date.now(),
        version: INITIAL_GAME_STATE.version, // Always use current version
      };
    }

    case 'RESET_GAME': {
      return INITIAL_GAME_STATE;
    }

    default:
      return state;
  }
}
