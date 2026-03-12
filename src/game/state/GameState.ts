import { GameState, GameAction, ResourceId, FoodId, BiomeId, ResearchId } from '../../types/game.types';
import { AUTOMATIONS } from '../config/automations';
import { EXPEDITION_TIERS } from '../config/expeditions';
import { SKILL_TREE } from '../config/skillTree';
import { RESOURCES } from '../config/resources';
import { BIOMES } from '../config/biomes';
import { INITIAL_CONTRACT_STATE } from '../config/contracts';
import { INITIAL_RESEARCH_STATE, RESEARCH_NODES } from '../config/research';
import { INITIAL_ARTIFACT_STATE, ARTIFACT_TEMPLATES, hasArtifactEffect, getActiveSetBonuses } from '../config/artifacts';

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
  powerCellPityCounter: 0,
  discoveredProducedResources: [], // Intermediate resources discovered via production
  pendingResourceDiscoveries: [], // Queue for popup display
  discoveredProducedFoods: [], // Foods discovered via automation production
  pendingFoodDiscoveries: [], // Queue for food popup display
  prestige: {
    cosmicBambooShards: 0,
    totalPrestiges: 0,
    unlockedSkills: [],
  },
  achievements: {
    unlocked: [],
    pending: [],
  },
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
    totalSessions: 1,
    totalChoresCompleted: 0,
  },
  contracts: { ...INITIAL_CONTRACT_STATE },
  research: { ...INITIAL_RESEARCH_STATE },
  artifacts: { ...INITIAL_ARTIFACT_STATE },
  lastTick: Date.now(),
  lastSave: Date.now(),
  gameStartTime: Date.now(),
  version: '1.4.2',
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'GATHER_RESOURCE': {
      const { biomeId, resourceId, amount } = action.payload;

      // Auto-discover resource when produced (positive amount) for the first time
      const existingDiscovered = state.biomes[biomeId].discoveredResources || [];
      const shouldDiscover = amount > 0 && !existingDiscovered.includes(resourceId);
      const newDiscovered = shouldDiscover
        ? [...existingDiscovered, resourceId]
        : existingDiscovered;

      // Update lifetime stats (only count positive amounts)
      const gatheredAmount = amount > 0 ? amount : 0;

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
        lifetimeStats: {
          ...state.lifetimeStats,
          totalResourcesGathered: (state.lifetimeStats?.totalResourcesGathered || 0) + gatheredAmount,
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
        lifetimeStats: {
          ...state.lifetimeStats,
          totalAutomationsBuilt: (state.lifetimeStats?.totalAutomationsBuilt || 0) + 1,
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
        lifetimeStats: {
          ...state.lifetimeStats,
          totalUpgradesPurchased: (state.lifetimeStats?.totalUpgradesPurchased || 0) + 1,
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

      // Oasis artifact: Swift Forage and Local Expedition take half the time
      let durationMs = config.durationMinutes * 60 * 1000;
      if (
        (tier === 'quick_dash' || tier === 'quick_scout') &&
        hasArtifactEffect(state.artifacts?.inventory || [], 'oasis')
      ) {
        durationMs = Math.floor(durationMs / 2);
      }

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
            durationMs,
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
      const { rewards, powerCells, newBiome, newResources, artifacts: newArtifacts } = action.payload;
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

      // Power cell pity system: reset on success, increment on failure
      if (powerCells.length > 0) {
        newState.powerCellPityCounter = 0;
      } else {
        newState.powerCellPityCounter = (state.powerCellPityCounter || 0) + 1;
      }

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

      // Update lifetime stats for expedition
      const expeditionTier = state.panda.expedition?.tier;
      if (expeditionTier) {
        newState.lifetimeStats = {
          ...state.lifetimeStats,
          totalExpeditionsCompleted: (state.lifetimeStats?.totalExpeditionsCompleted || 0) + 1,
          expeditionsByTier: {
            ...state.lifetimeStats?.expeditionsByTier,
            [expeditionTier]: ((state.lifetimeStats?.expeditionsByTier?.[expeditionTier]) || 0) + 1,
          },
        };
      }

      // Add artifacts to inventory
      if (newArtifacts && newArtifacts.length > 0) {
        newState.artifacts = {
          ...(state.artifacts || INITIAL_ARTIFACT_STATE),
          inventory: [...(state.artifacts?.inventory || []), ...newArtifacts],
          totalFound: (state.artifacts?.totalFound || 0) + newArtifacts.length,
        };
      }

      // Mirage artifact: 25% chance completed expeditions refund all food cost
      const artifactInv = newState.artifacts?.inventory || state.artifacts?.inventory || [];
      if (
        hasArtifactEffect(artifactInv, 'mirage') &&
        state.panda.expedition?.foodConsumed &&
        Math.random() < 0.25
      ) {
        const refundFood = { ...newState.food };
        state.panda.expedition.foodConsumed.forEach(({ id, amount }) => {
          refundFood[id] = (refundFood[id] || 0) + amount;
        });
        newState.food = refundFood;
      }

      // Desert Cache artifact: 30% chance to award 3-8 Research Data (60% with Desert Set 2/3)
      const desertSet = getActiveSetBonuses(artifactInv).get('arid_desert') || 0;
      const desertCacheChance = desertSet >= 2 ? 0.60 : 0.30;
      if (hasArtifactEffect(artifactInv, 'desert_cache') && Math.random() < desertCacheChance) {
        // Lake Set 2/3: +50% Research Data from all sources
        const lakeSet = getActiveSetBonuses(artifactInv).get('misty_lake') || 0;
        let bonusRD = Math.floor(Math.random() * 6) + 3;
        if (lakeSet >= 2) bonusRD = Math.ceil(bonusRD * 1.5);
        newState.contracts = {
          ...newState.contracts,
          researchData: (newState.contracts?.researchData || 0) + bonusRD,
          totalResearchDataEarned: (newState.contracts?.totalResearchDataEarned || 0) + bonusRD,
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

      // Reset everything except prestige data, achievements, lifetime stats, research, and gameStartTime
      return {
        ...INITIAL_GAME_STATE,
        prestige: {
          cosmicBambooShards: state.prestige.cosmicBambooShards + shardsEarned,
          totalPrestiges: state.prestige.totalPrestiges + 1,
          unlockedSkills: state.prestige.unlockedSkills, // Skills persist!
        },
        achievements: state.achievements, // Achievements persist!
        lifetimeStats: state.lifetimeStats, // Lifetime stats persist!
        // Tundra Set 3/3: all research starts at lvl 1 after prestige
        research: (() => {
          const tundraSet = getActiveSetBonuses(state.artifacts?.inventory || []).get('frozen_tundra') || 0;
          if (tundraSet >= 3) {
            const levels: Partial<Record<ResearchId, number>> = {};
            for (const id of Object.keys(RESEARCH_NODES)) {
              levels[id as ResearchId] = 1;
            }
            return { ...INITIAL_RESEARCH_STATE, levels };
          }
          return { ...INITIAL_RESEARCH_STATE };
        })(), // Research resets on prestige!
        artifacts: state.artifacts, // Artifacts persist!
        contracts: {
          ...INITIAL_CONTRACT_STATE,
          researchData: state.contracts.researchData, // Keep unspent Research Data
          totalResearchDataEarned: state.contracts.totalResearchDataEarned,
        },
        gameStartTime: state.gameStartTime, // Keep original start time!
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

    case 'CLEAR_VETERAN_BONUS': {
      const { pendingVeteranBonus: _, ...rest } = state;
      return rest as GameState;
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

      // Migration: Always calculate lifetimeStats from existing game state
      // and use the max of calculated values vs stored values
      const existingStats = loadedState.lifetimeStats;

      // Count existing automations across all biomes
      let calculatedAutomations = 0;
      let calculatedUpgrades = 0;
      (Object.keys(loadedState.biomes) as BiomeId[]).forEach((biomeId) => {
        const biome = loadedState.biomes[biomeId];
        if (biome.automations) {
          biome.automations.forEach((auto: { level: number }) => {
            calculatedAutomations++;
            // Each automation starts at level 1, so upgrades = level - 1
            calculatedUpgrades += Math.max(0, auto.level - 1);
          });
        }
      });

      // Count total resources across all biomes
      let calculatedResources = 0;
      (Object.keys(loadedState.biomes) as BiomeId[]).forEach((biomeId) => {
        const biome = loadedState.biomes[biomeId];
        if (biome.resources) {
          Object.values(biome.resources).forEach((amount) => {
            calculatedResources += (amount as number) || 0;
          });
        }
      });

      // Use the max of calculated values vs stored values to ensure we never lose stats
      const lifetimeStats = {
        totalResourcesGathered: Math.max(existingStats?.totalResourcesGathered || 0, calculatedResources),
        totalAutomationsBuilt: Math.max(existingStats?.totalAutomationsBuilt || 0, calculatedAutomations),
        totalUpgradesPurchased: Math.max(existingStats?.totalUpgradesPurchased || 0, calculatedUpgrades),
        totalExpeditionsCompleted: existingStats?.totalExpeditionsCompleted || loadedState.expeditionCount || 0,
        expeditionsByTier: existingStats?.expeditionsByTier || {
          quick_dash: 0,
          quick_scout: 0,
          standard_expedition: 0,
          deep_exploration: 0,
          epic_journey: 0,
        },
        totalSessions: existingStats?.totalSessions || 1,
        totalChoresCompleted: existingStats?.totalChoresCompleted || 0,
      };

      // Migration: Ensure achievements structure exists
      const achievements = loadedState.achievements || {
        unlocked: [],
        pending: [],
      };

      // Migration: Ensure discoveredProducedResources and discoveredProducedFoods exist
      const discoveredProducedResources = loadedState.discoveredProducedResources || [];
      const discoveredProducedFoods = loadedState.discoveredProducedFoods || [];

      return {
        ...loadedState,
        unlockedBiomes: finalUnlockedBiomes,
        lifetimeStats,
        achievements,
        discoveredProducedResources,
        discoveredProducedFoods,
        pendingResourceDiscoveries: loadedState.pendingResourceDiscoveries || [],
        pendingFoodDiscoveries: loadedState.pendingFoodDiscoveries || [],
        lastTick: Date.now(),
        version: INITIAL_GAME_STATE.version, // Always use current version
      };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      const { achievementId } = action.payload;
      // Don't unlock if already unlocked
      if (state.achievements.unlocked.includes(achievementId)) {
        return state;
      }
      return {
        ...state,
        achievements: {
          unlocked: [...state.achievements.unlocked, achievementId],
          pending: [...state.achievements.pending, achievementId],
        },
      };
    }

    case 'ACKNOWLEDGE_ACHIEVEMENT': {
      const { achievementId } = action.payload;
      return {
        ...state,
        achievements: {
          ...state.achievements,
          pending: state.achievements.pending.filter(id => id !== achievementId),
        },
      };
    }

    case 'RESET_GAME': {
      return INITIAL_GAME_STATE;
    }

    case 'TRACK_CLICK': {
      const now = Date.now();
      const currentSession = state.sessionStats || {
        sessionStartTime: now,
        clickCount: 0,
        lastClickTime: now,
      };
      return {
        ...state,
        sessionStats: {
          ...currentSession,
          clickCount: currentSession.clickCount + 1,
          lastClickTime: now,
        },
      };
    }

    case 'INIT_SESSION': {
      const now = Date.now();
      return {
        ...state,
        sessionStats: {
          sessionStartTime: now,
          clickCount: 0,
          lastClickTime: now,
        },
      };
    }

    case 'UPDATE_CONTRACTS': {
      return {
        ...state,
        contracts: action.payload.contracts,
      };
    }

    case 'CLAIM_CONTRACT': {
      const { contractId, period } = action.payload;
      const contractList = period === 'daily' ? [...state.contracts.daily] : [...state.contracts.weekly];
      const idx = contractList.findIndex(c => c.id === contractId);
      if (idx === -1 || !contractList[idx].completed || contractList[idx].claimed) return state;

      let reward = contractList[idx].researchDataReward;
      // Lake Set 2/3: +50% Research Data from all sources
      const lakeSet = getActiveSetBonuses(state.artifacts?.inventory || []).get('misty_lake') || 0;
      if (lakeSet >= 2) {
        reward = Math.ceil(reward * 1.5);
      }
      contractList[idx] = { ...contractList[idx], claimed: true };

      return {
        ...state,
        contracts: {
          ...state.contracts,
          [period]: contractList,
          researchData: state.contracts.researchData + reward,
          totalResearchDataEarned: state.contracts.totalResearchDataEarned + reward,
        },
        lifetimeStats: {
          ...state.lifetimeStats,
          totalChoresCompleted: (state.lifetimeStats?.totalChoresCompleted || 0) + 1,
        },
      };
    }

    case 'START_RESEARCH': {
      const { researchId, cost, startTime, endTime } = action.payload;

      return {
        ...state,
        contracts: {
          ...state.contracts,
          researchData: state.contracts.researchData - cost,
        },
        research: {
          ...state.research,
          activeResearch: { researchId, startTime, endTime },
        },
      };
    }

    case 'COMPLETE_RESEARCH': {
      const { researchId } = action.payload;
      const currentLevel = state.research.levels[researchId] || 0;

      return {
        ...state,
        research: {
          ...state.research,
          levels: {
            ...state.research.levels,
            [researchId]: currentLevel + 1,
          },
          activeResearch: null,
        },
      };
    }

    case 'CANCEL_RESEARCH': {
      // Refund is not given — research data was already spent
      return {
        ...state,
        research: {
          ...state.research,
          activeResearch: null,
        },
      };
    }

    case 'START_ANALYSIS': {
      const { artifactInstanceId, templateId, cost, startTime, endTime } = action.payload;
      return {
        ...state,
        contracts: {
          ...state.contracts,
          researchData: state.contracts.researchData - cost,
        },
        artifacts: {
          ...state.artifacts,
          inventory: state.artifacts.inventory.map(a =>
            a.instanceId === artifactInstanceId ? { ...a, status: 'analyzing' as const } : a
          ),
          activeAnalysis: { artifactInstanceId, templateId, startTime, endTime },
        },
      };
    }

    case 'COMPLETE_ANALYSIS': {
      const { artifactInstanceId } = action.payload;
      return {
        ...state,
        artifacts: {
          ...state.artifacts,
          inventory: state.artifacts.inventory.map(a =>
            a.instanceId === artifactInstanceId
              ? { ...a, status: 'analyzed' as const, analyzedAt: Date.now() }
              : a
          ),
          activeAnalysis: null,
          totalAnalyzed: state.artifacts.totalAnalyzed + 1,
        },
      };
    }

    case 'CANCEL_ANALYSIS': {
      const activeAnalysis = state.artifacts.activeAnalysis;
      if (!activeAnalysis) return state;
      return {
        ...state,
        artifacts: {
          ...state.artifacts,
          inventory: state.artifacts.inventory.map(a =>
            a.instanceId === activeAnalysis.artifactInstanceId
              ? { ...a, status: 'unanalyzed' as const }
              : a
          ),
          activeAnalysis: null,
        },
      };
    }

    case 'EQUIP_ARTIFACT': {
      const { artifactInstanceId } = action.payload;
      const equippedCount = state.artifacts.inventory.filter(a => a.equipped).length;
      if (equippedCount >= state.artifacts.loadoutSlots) return state;
      return {
        ...state,
        artifacts: {
          ...state.artifacts,
          inventory: state.artifacts.inventory.map(a =>
            a.instanceId === artifactInstanceId && a.status === 'analyzed'
              ? { ...a, equipped: true }
              : a
          ),
        },
      };
    }

    case 'UNEQUIP_ARTIFACT': {
      const { artifactInstanceId } = action.payload;
      return {
        ...state,
        artifacts: {
          ...state.artifacts,
          inventory: state.artifacts.inventory.map(a =>
            a.instanceId === artifactInstanceId ? { ...a, equipped: false } : a
          ),
        },
      };
    }

    case 'SCRAP_ARTIFACT': {
      const { artifactInstanceId } = action.payload;
      const artifact = state.artifacts.inventory.find(a => a.instanceId === artifactInstanceId);
      if (!artifact) return state;
      // Refund analysis cost if analyzed (50% base, 100% with Idol's Favor)
      let refund = 0;
      if (artifact.status === 'analyzed') {
        const template = ARTIFACT_TEMPLATES[artifact.templateId];
        const hasIdolsFavor = state.artifacts.inventory.some(
          a => a.equipped && a.status === 'analyzed' && ARTIFACT_TEMPLATES[a.templateId].effect === 'idols_favor'
        );
        refund = Math.floor(template.analysisCost * (hasIdolsFavor ? 1.0 : 0.5));
      }
      return {
        ...state,
        contracts: {
          ...state.contracts,
          researchData: state.contracts.researchData + refund,
        },
        artifacts: {
          ...state.artifacts,
          inventory: state.artifacts.inventory.filter(a => a.instanceId !== artifactInstanceId),
        },
      };
    }

    default:
      return state;
  }
}
