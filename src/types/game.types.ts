export type BiomeId = 'lush_forest' | 'misty_lake' | 'arid_desert' | 'frozen_tundra' | 'volcanic_isle' | 'crystal_caverns';

export type ResourceId =
  // Raw resources - Lush Forest
  | 'wood' | 'stone' | 'berries' | 'rubber_sap' | 'nitrogen_nodules'
  // Raw resources - Misty Lake
  | 'fresh_water' | 'fish' | 'clay'
  // Raw resources - Arid Desert
  | 'quartz_sand' | 'crude_oil' | 'cactus' | 'sulfur'
  // Raw resources - Frozen Tundra
  | 'ice' | 'rutile_ore' | 'iron_ore' | 'arctic_moss'
  // Raw resources - Volcanic Isle
  | 'nickel_cobalt_ore' | 'obsidian' | 'geothermal_energy'
  // Raw resources - Crystal Caverns
  | 'lithium_crystals' | 'copper_ore' | 'phosphorus' | 'quartz_crystals'
  // Tier 1 Intermediate
  | 'planks' | 'stone_bricks' | 'charcoal' | 'clean_water' | 'rubber' | 'ceramics'
  // Tier 2 Intermediate
  | 'glass' | 'iron_ingots' | 'aluminum_ingots'
  | 'obsidian_tools' | 'vulcanized_rubber' | 'copper_wire' | 'refined_alloy'
  | 'hydrogen' | 'oxygen' | 'kerosene' | 'ammonia' | 'silicon_ingot' | 'precision_quartz'
  | 'hull_plates' | 'tank_shell' | 'aluminum_frame' | 'cathode_powder'
  // Tier 3 Intermediate
  | 'liquid_oxygen' | 'doped_silicon' | 'graphite' | 'hydrazine' | 'insulation'
  // Tier 4 Intermediate
  | 'battery_cells' | 'solar_cells'
  // Food
  | 'cactus_juice' | 'smoked_fish'
  // Final Products
  | 'microchips' | 'rocket_fuel' | 'thrusters' | 'oxygen_tanks' | 'batteries' | 'solar_arrays' | 'titanium_hull';

export type AutomationType =
  // Lush Forest
  | 'logger' | 'quarry' | 'berry_picker' | 'nitrogen_collector' | 'rubber_tapper' | 'saw_mill' | 'stone_cutter' | 'rubber_processor' | 'charcoal_kiln'
  // Misty Lake
  | 'water_collector' | 'water_purifier' | 'fish_trap' | 'clay_digger' | 'kiln' | 'smokehouse'
  // Arid Desert
  | 'sand_collector' | 'oil_pump' | 'cactus_farm' | 'glass_furnace' | 'distillation_unit' | 'cactus_press'
  // Frozen Tundra
  | 'ice_harvester' | 'rutile_miner' | 'iron_miner' | 'moss_collector' | 'smelter' | 'greenhouse'
  // Volcanic Isle
  | 'nickel_cobalt_miner' | 'obsidian_collector' | 'geothermal_tap' | 'sulfur_collector' | 'refinery' | 'obsidian_forge'
  // Crystal Caverns
  | 'lithium_miner' | 'copper_miner' | 'phosphorus_collector' | 'quartz_miner'
  // Advanced production buildings (available in multiple biomes)
  | 'electrolyzer' | 'vulcanizer' | 'wire_mill' | 'frame_mill' | 'chemical_plant'
  | 'graphitizer' | 'precision_cutter' | 'doping_plant' | 'lithography_lab'
  | 'battery_factory' | 'pv_plant' | 'lox_plant' | 'fuel_depot' | 'thruster_plant'
  | 'tank_filling_station' | 'hull_assembly' | 'solar_array_assembly'
  // Intermediate processors (Tier 2-3)
  | 'silicon_processor' | 'aluminum_smelter' | 'insulation_plant' | 'hydrazine_plant'
  // Battery assembly
  | 'battery_assembly';

export type PowerCellTier = 'green' | 'blue' | 'orange';

export type FoodId = 'berries' | 'cactus_juice' | 'smoked_fish' | 'greenhouse_veggies';

export type ExpeditionTier = 'quick_dash' | 'quick_scout' | 'standard_expedition' | 'deep_exploration' | 'epic_journey';

export type PandaStatus = 'home' | 'expedition';

export type SkillId =
  | 'prod_1' | 'prod_2' | 'prod_3' | 'prod_4'
  | 'econ_1' | 'econ_2' | 'econ_3' | 'econ_4'
  | 'exp_1' | 'exp_2' | 'exp_3' | 'exp_4'
  | 'cell_1' | 'cell_2' | 'cell_3' | 'cell_4';

export type AchievementCategory = 'gathering' | 'automation' | 'power_cells' | 'expedition' | 'biomes' | 'crashes' | 'skills' | 'milestones' | 'secret';

export type AchievementId =
  // Gathering achievements (10)
  | 'first_gather' | 'gather_1k' | 'gather_100k' | 'gather_1m' | 'gather_10m' | 'gather_100m'
  | 'material_master' | 'culinary_explorer' | 'full_catalog' | 'self_sufficient'
  // Automation achievements (12)
  | 'first_automation' | 'automation_5' | 'automation_10' | 'automation_25' | 'automation_50' | 'all_automations'
  | 'first_production' | 'first_upgrade' | 'single_upgrade_50' | 'single_upgrade_100' | 'single_upgrade_200'
  | 'biome_specialist' | 'all_automations_100'
  // Power Cell achievements (7)
  | 'power_cell_installed' | 'green_energy_5' | 'blue_power' | 'orange_surge'
  | 'power_cells_10' | 'power_cells_20' | 'maximum_power'
  // Expedition achievements (10)
  | 'first_expedition' | 'expedition_10' | 'expedition_50' | 'expedition_100' | 'expedition_500'
  | 'swift_forage_25' | 'quick_scout_25' | 'standard_expedition_25' | 'deep_exploration_10' | 'epic_journey_5'
  // Biome achievements (7)
  | 'world_domination'
  | 'forest_resources' | 'lake_resources' | 'desert_resources' | 'tundra_resources' | 'volcano_resources' | 'caverns_resources'
  // Crash/Prestige achievements (5) - all hidden until first prestige
  | 'first_crash' | 'crash_3' | 'crash_5' | 'crash_10' | 'crash_25'
  // Skill achievements (6)
  | 'first_skill' | 'production_branch' | 'economy_branch' | 'expedition_branch' | 'power_cells_branch' | 'all_skills'
  // Milestone achievements (3)
  | 'spaceship_started' | 'spaceship_halfway' | 'spaceship_complete'
  // Secret/Fun achievements (8)
  | 'night_owl' | 'clicker_champion' | 'patient_panda' | 'speed_demon' | 'hoarder_deluxe'
  | 'perfectionist' | 'the_long_game' | 'dedicated';

export interface ResourceCost {
  resourceId: ResourceId;
  amount: number;
}

export interface GameState {
  player: {
    name: string;
    currentBiome: BiomeId;
  };
  panda: {
    status: PandaStatus;
    expedition: ExpeditionState | null;
  };
  biomes: Record<BiomeId, BiomeState>;
  food: Record<FoodId, number>;
  powerCellInventory: PowerCell[];
  unlockedBiomes: BiomeId[];
  expeditionCount: number;
  expeditionPityCounter: number; // Hidden counter for biome discovery pity system
  powerCellPityCounter: number; // Hidden counter for power cell pity system (+10% per expedition without power cell)
  discoveredProducedResources: ResourceId[]; // Resources discovered through automation production
  pendingResourceDiscoveries: ResourceId[]; // Queue of produced resources waiting to show discovery popup
  discoveredProducedFoods: FoodId[]; // Foods discovered through automation production
  pendingFoodDiscoveries: FoodId[]; // Queue of produced foods waiting to show discovery popup
  prestige: {
    cosmicBambooShards: number;
    totalPrestiges: number;
    unlockedSkills: SkillId[];
  };
  // Achievement tracking
  achievements: {
    unlocked: AchievementId[];
    pending: AchievementId[]; // Queue for toast notifications
  };
  // Lifetime stats for achievements
  lifetimeStats: {
    totalResourcesGathered: number;
    totalAutomationsBuilt: number;
    totalUpgradesPurchased: number;
    totalExpeditionsCompleted: number;
    expeditionsByTier: Record<ExpeditionTier, number>;
    totalSessions: number; // Total number of play sessions
  };
  // Session stats for secret achievements (reset on page load)
  sessionStats?: {
    sessionStartTime: number; // When this session started
    clickCount: number; // Clicks this session
    lastClickTime: number; // Time of last click (for Patient Panda)
  };
  lastTick: number;
  lastSave: number;
  gameStartTime: number; // When the save file was first created
  version: string;
}

export interface BiomeState {
  id: BiomeId;
  resources: Record<ResourceId, number>;
  automations: Automation[];
  discovered: boolean;
  activated: boolean;
  discoveredResources: ResourceId[]; // Resources that have been discovered in this biome
}

export interface Automation {
  id: string;
  type: AutomationType;
  level: number;
  biomeId: BiomeId;
  powerCell: PowerCell | null;
  baseProductionRate: number;
  upgradeSlots: number;
  paused?: boolean; // Whether this automation is paused
}

export interface PowerCell {
  tier: PowerCellTier;
  bonus: number; // 0.50 (green), 1.00 (blue), 1.50 (orange) - additive bonus
}

export interface FoodItem {
  id: FoodId;
  name: string;
  description: string;
  flavorText?: string;
  nutritionValue: number;
  icon: string;
}

export interface ExpeditionTierConfig {
  id: ExpeditionTier;
  name: string;
  description: string;
  durationMinutes: number;
  foodCost: number; // nutrition points required
  resourceMultiplier: number;
  powerCellChance: number;
  biomeDiscoveryChance: number;
  resourceDiscoveryChance: number; // Chance to discover each undiscovered resource in current biome
  bonusPowerCellChance?: number; // Optional: chance for 2-3 power cells (Epic Journey only)
}

export interface ExpeditionState {
  tier: ExpeditionTier;
  startTime: number;
  durationMs: number;
  foodConsumed: { id: FoodId; amount: number }[];
  completed: boolean;
  collectedAt: number | null; // null if not collected yet
}

export interface SkillNode {
  id: SkillId;
  name: string;
  description: string;
  cost: number; // Cosmic Bamboo Shards
  branch: 'production' | 'economy' | 'expedition' | 'storage' | 'power_cells';
  tier: number;
  requires: SkillId[];
  effect: {
    type: 'production_speed' | 'build_cost_reduction' | 'upgrade_cost_reduction' | 'all_cost_reduction'
      | 'expedition_time_reduction' | 'expedition_food_reduction' | 'expedition_resource_bonus'
      | 'instant_first_biome' | 'storage_capacity' | 'power_cell_effectiveness'
      | 'power_cell_resonance' | 'power_cell_drop_bonus';
    value: number | boolean;
  };
}

export interface Discovery {
  type: 'biome' | 'automation' | 'power_cell' | 'resource';
  id: string;
  timestamp: number;
}

export type GameAction =
  | { type: 'GATHER_RESOURCE'; payload: { biomeId: BiomeId; resourceId: ResourceId; amount: number } }
  | { type: 'GATHER_FOOD'; payload: { foodId: FoodId; amount: number } }
  | { type: 'BUILD_AUTOMATION'; payload: { biomeId: BiomeId; automationType: AutomationType } }
  | { type: 'UPGRADE_AUTOMATION'; payload: { biomeId: BiomeId; automationId: string } }
  | { type: 'TOGGLE_AUTOMATION_PAUSE'; payload: { biomeId: BiomeId; automationId: string } }
  | { type: 'INSTALL_POWER_CELL'; payload: { biomeId: BiomeId; automationId: string; powerCell: PowerCell } }
  | { type: 'REMOVE_POWER_CELL'; payload: { biomeId: BiomeId; automationId: string } }
  | { type: 'START_EXPEDITION'; payload: { tier: ExpeditionTier; foodConsumed: { id: FoodId; amount: number }[] } }
  | { type: 'COLLECT_EXPEDITION'; payload: { rewards: Record<ResourceId, number>; powerCells: PowerCell[]; newBiome: BiomeId | null; newResources: ResourceId[] } }
  | { type: 'RECALL_EXPEDITION'; payload: { partialRewards: Partial<Record<ResourceId, number>> } }
  | { type: 'SWITCH_BIOME'; payload: { biomeId: BiomeId } }
  | { type: 'UNLOCK_BIOME'; payload: { biomeId: BiomeId } }
  | { type: 'ACTIVATE_BIOME'; payload: { biomeId: BiomeId } }
  | { type: 'UNLOCK_SKILL'; payload: { skillId: SkillId } }
  | { type: 'PRESTIGE'; payload: { shardsEarned: number } }
  | { type: 'TICK'; payload: { deltaTime: number } }
  | { type: 'QUEUE_RESOURCE_DISCOVERY'; payload: { resourceId: ResourceId } }
  | { type: 'ACKNOWLEDGE_RESOURCE_DISCOVERY'; payload: { resourceId: ResourceId } }
  | { type: 'QUEUE_FOOD_DISCOVERY'; payload: { foodId: FoodId } }
  | { type: 'ACKNOWLEDGE_FOOD_DISCOVERY'; payload: { foodId: FoodId } }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: { achievementId: AchievementId } }
  | { type: 'ACKNOWLEDGE_ACHIEVEMENT'; payload: { achievementId: AchievementId } }
  | { type: 'TRACK_CLICK' }
  | { type: 'INIT_SESSION' }
  | { type: 'SAVE_GAME' }
  | { type: 'LOAD_GAME'; payload: { gameState: GameState } }
  | { type: 'RESET_GAME' };
