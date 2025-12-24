import { AutomationConfig } from '../../types/automation.types';
import { AutomationType } from '../../types/game.types';

// BALANCE GUIDELINES (Kittens Game inspired):
// - Gatherers: 1.15x cost multiplier (easiest to upgrade, like Kittens Game)
// - Food producers: 1.15x cost multiplier (food should stay accessible)
// - Basic processors: 1.25x cost multiplier (moderate challenge)
// - Advanced processors: 1.35x cost multiplier (late-game challenge)
// - Final assemblers: 1.35x cost multiplier (end-game)
//
// Production: 1.25^level scaling (unchanged)
// This creates Kittens Game-like progression where upgrades feel rewarding

export const AUTOMATIONS: Partial<Record<AutomationType, AutomationConfig>> = {
  // ============================================================
  // === LUSH FOREST ===
  // ============================================================

  logger: {
    type: 'logger',
    name: 'Logger',
    description: 'Automatically chops wood from trees. No PhD required, just point at tree and wait.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'wood', amount: 5 },
      { resourceId: 'stone', amount: 3 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'wood', amount: 6 }], // Increased from 4 to 6
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15, // Kittens Game style
    maxInstancesPerBiome: 1,
  },

  quarry: {
    type: 'quarry',
    name: 'Quarry',
    description: 'Extracts stone automatically. The rocks never see it coming.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'wood', amount: 5 },
      { resourceId: 'stone', amount: 3 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'stone', amount: 6 }], // Increased from 4 to 6
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  berry_picker: {
    type: 'berry_picker',
    name: 'Berry Picker',
    description: 'Automatically gathers berries from bushes. Ready to eat - just rinse off the panda fur!',
    category: 'food_producer',
    baseCost: [
      { resourceId: 'wood', amount: 3 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [],
    producesFood: [{ foodId: 'berries', amount: 6.0 }], // 6.0 berries/min = 18 nutrition/min (increased 6x)
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  nitrogen_collector: {
    type: 'nitrogen_collector',
    name: 'Nitrogen Collector',
    description: 'Harvests nitrogen-fixing nodules from plant roots. Science made automatic!',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'wood', amount: 8 },
      { resourceId: 'stone', amount: 5 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'nitrogen_nodules', amount: 3 }], // Increased from 2 to 3
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  rubber_tapper: {
    type: 'rubber_tapper',
    name: 'Rubber Tapper',
    description: 'Extracts sticky sap from trees. It gets on EVERYTHING. Worth it though.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'wood', amount: 10 },
      { resourceId: 'stone', amount: 5 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'rubber_sap', amount: 3 }], // Increased from 2 to 3
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  saw_mill: {
    type: 'saw_mill',
    name: 'Sawmill',
    description: 'Cuts logs into planks. Flat wood is somehow worth more than round wood. Economics!',
    category: 'processor',
    baseCost: [
      { resourceId: 'wood', amount: 15 },
      { resourceId: 'stone', amount: 10 },
    ],
    baseProductionRate: 1,
    consumes: [{ resourceId: 'wood', amount: 4 }],
    produces: [{ resourceId: 'planks', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.25,
    maxInstancesPerBiome: 1,
  },

  stone_cutter: {
    type: 'stone_cutter',
    name: 'Stone Cutter',
    description: 'Shapes stones into bricks. Rectangular rocks are apparently superior.',
    category: 'processor',
    baseCost: [
      { resourceId: 'stone', amount: 15 },
      { resourceId: 'wood', amount: 10 },
    ],
    baseProductionRate: 1,
    consumes: [{ resourceId: 'stone', amount: 4 }],
    produces: [{ resourceId: 'stone_bricks', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.25,
    maxInstancesPerBiome: 1,
  },

  rubber_processor: {
    type: 'rubber_processor',
    name: 'Rubber Processor',
    description: 'Transforms sticky tree juice into bouncy rubber. Nature is weird but useful.',
    category: 'processor',
    baseCost: [
      { resourceId: 'wood', amount: 20 },
      { resourceId: 'stone', amount: 15 },
    ],
    baseProductionRate: 1,
    consumes: [{ resourceId: 'rubber_sap', amount: 3 }],
    produces: [{ resourceId: 'rubber', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.25,
    maxInstancesPerBiome: 1,
  },

  charcoal_kiln: {
    type: 'charcoal_kiln',
    name: 'Charcoal Kiln',
    description: 'Burns wood to make better burning wood. Fire science is counterintuitive.',
    category: 'processor',
    baseCost: [
      { resourceId: 'wood', amount: 25 },
      { resourceId: 'stone_bricks', amount: 10 },
    ],
    baseProductionRate: 1,
    consumes: [{ resourceId: 'wood', amount: 5 }],
    produces: [{ resourceId: 'charcoal', amount: 3 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.25,
    maxInstancesPerBiome: 1,
  },

  // ============================================================
  // === MISTY LAKE ===
  // ============================================================

  water_collector: {
    type: 'water_collector',
    name: 'Water Collector',
    description: 'Scoops up lake water. Sure, it has fish in it, but that\'s just extra flavor.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'wood', amount: 10 },
      { resourceId: 'stone', amount: 8 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'fresh_water', amount: 4 }], // Increased from 2 to 4
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  water_purifier: {
    type: 'water_purifier',
    name: 'Water Purifier',
    description: 'Removes the mystery particles from water. Now with 100% less weird floaty bits!',
    category: 'processor',
    baseCost: [
      { resourceId: 'stone_bricks', amount: 20 },
      { resourceId: 'planks', amount: 15 },
    ],
    baseProductionRate: 1,
    consumes: [{ resourceId: 'fresh_water', amount: 3 }],
    produces: [{ resourceId: 'clean_water', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.25,
    maxInstancesPerBiome: 1,
  },

  fish_trap: {
    type: 'fish_trap',
    name: 'Fish Trap',
    description: 'Catches fish automatically. They seem suspiciously compliant about being trapped.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'wood', amount: 10 },
      { resourceId: 'rubber', amount: 5 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'fish', amount: 3 }], // Increased from 2 to 3
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  clay_digger: {
    type: 'clay_digger',
    name: 'Clay Digger',
    description: 'Excavates wet clay from the lakebed. Messy work, but someone\'s gotta do it.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'wood', amount: 8 },
      { resourceId: 'stone', amount: 6 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'clay', amount: 3 }], // Increased from 2 to 3
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  kiln: {
    type: 'kiln',
    name: 'Kiln',
    description: 'Bakes squishy mud into useful mud. Very zen pottery vibes.',
    category: 'processor',
    baseCost: [
      { resourceId: 'stone_bricks', amount: 30 },
      { resourceId: 'clay', amount: 20 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'clay', amount: 4 },
      { resourceId: 'charcoal', amount: 2 },
    ],
    produces: [{ resourceId: 'ceramics', amount: 3 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  smokehouse: {
    type: 'smokehouse',
    name: 'Smokehouse',
    description: 'Preserves fish with smoke. Tastes like campfire memories and survival.',
    category: 'food_producer',
    baseCost: [
      { resourceId: 'planks', amount: 25 },
      { resourceId: 'stone_bricks', amount: 20 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'fish', amount: 3 },
      { resourceId: 'charcoal', amount: 2 },
    ],
    produces: [],
    producesFood: [{ foodId: 'smoked_fish', amount: 3.0 }], // 45 nutrition/min (increased 6x)
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  // ============================================================
  // === ARID DESERT ===
  // ============================================================

  sand_collector: {
    type: 'sand_collector',
    name: 'Sand Collector',
    description: 'Gathers fancy sand. It gets everywhere. Your fur will never be the same.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'planks', amount: 15 },
      { resourceId: 'rubber', amount: 10 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'quartz_sand', amount: 4 }], // Increased from 3 to 4
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  oil_pump: {
    type: 'oil_pump',
    name: 'Oil Pump',
    description: 'Extracts ancient dinosaur juice. They died for your fuel. Don\'t waste it.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'stone_bricks', amount: 30 },
      { resourceId: 'ceramics', amount: 15 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'crude_oil', amount: 3 }], // Increased from 2 to 3
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  cactus_farm: {
    type: 'cactus_farm',
    name: 'Cactus Farm',
    description: 'Farms spiky water storage units that actively don\'t want to be touched. Relatable.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'wood', amount: 20 },
      { resourceId: 'clean_water', amount: 10 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'cactus', amount: 3 }], // Increased from 2 to 3
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  glass_furnace: {
    type: 'glass_furnace',
    name: 'Glass Furnace',
    description: 'Heats sand until it becomes see-through. The original extreme makeover.',
    category: 'processor',
    baseCost: [
      { resourceId: 'stone_bricks', amount: 40 },
      { resourceId: 'ceramics', amount: 25 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'quartz_sand', amount: 5 },
      { resourceId: 'charcoal', amount: 3 },
    ],
    produces: [{ resourceId: 'glass', amount: 3 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  distillation_unit: {
    type: 'distillation_unit',
    name: 'Distillation Unit',
    description: 'Separates the good stuff from dino juice. From dead dinosaurs to the stars!',
    category: 'processor',
    baseCost: [
      { resourceId: 'ceramics', amount: 30 },
      { resourceId: 'glass', amount: 20 },
    ],
    baseProductionRate: 1,
    consumes: [{ resourceId: 'crude_oil', amount: 4 }],
    produces: [{ resourceId: 'kerosene', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  cactus_press: {
    type: 'cactus_press',
    name: 'Cactus Press',
    description: 'Squeezes cacti into refreshing juice. Warning: may cause mild hallucinations and an urge to drink more.',
    category: 'food_producer',
    baseCost: [
      { resourceId: 'planks', amount: 20 },
      { resourceId: 'rubber', amount: 15 },
    ],
    baseProductionRate: 1,
    consumes: [{ resourceId: 'cactus', amount: 3 }],
    produces: [],
    producesFood: [{ foodId: 'cactus_juice', amount: 3.0 }], // 24 nutrition/min (increased 6x)
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  // ============================================================
  // === FROZEN TUNDRA ===
  // ============================================================

  ice_harvester: {
    type: 'ice_harvester',
    name: 'Ice Harvester',
    description: 'Collects pure ice blocks. Finally, a climate suited for a panda! No more sweating.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'planks', amount: 25 },
      { resourceId: 'rubber', amount: 15 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'ice', amount: 5 }], // Increased from 4 to 5
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  rutile_miner: {
    type: 'rutile_miner',
    name: 'Rutile Miner',
    description: 'Extracts titanium ore from frozen ground. Turns out ice preserves minerals pretty well.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'stone_bricks', amount: 40 },
      { resourceId: 'glass', amount: 20 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'rutile_ore', amount: 3 }], // Increased from 2 to 3
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  iron_miner: {
    type: 'iron_miner',
    name: 'Iron Miner',
    description: 'Digs up iron ore from beneath the permafrost. Classic resource, classic mining.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'stone_bricks', amount: 35 },
      { resourceId: 'planks', amount: 25 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'iron_ore', amount: 4 }], // Increased from 3 to 4
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  moss_collector: {
    type: 'moss_collector',
    name: 'Moss Collector',
    description: 'Gathers arctic moss that somehow survives in this cold. Life finds a way.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'wood', amount: 15 },
      { resourceId: 'glass', amount: 10 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'arctic_moss', amount: 4 }], // Increased from 3 to 4
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  smelter: {
    type: 'smelter',
    name: 'Smelter',
    description: 'Processes ores into refined metals. Hot work in a cold place - perfectly balanced.',
    category: 'processor',
    baseCost: [
      { resourceId: 'stone_bricks', amount: 50 },
      { resourceId: 'ceramics', amount: 30 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'iron_ore', amount: 4 },
      { resourceId: 'charcoal', amount: 3 },
    ],
    produces: [{ resourceId: 'iron_ingots', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  greenhouse: {
    type: 'greenhouse',
    name: 'Greenhouse',
    description: 'Grows food in controlled conditions. Arctic gardening for the determined panda.',
    category: 'food_producer',
    baseCost: [
      { resourceId: 'glass', amount: 30 },
      { resourceId: 'planks', amount: 25 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'arctic_moss', amount: 2 },
      { resourceId: 'clean_water', amount: 2 },
    ],
    produces: [],
    producesFood: [{ foodId: 'greenhouse_veggies', amount: 3.6 }], // 64.8 nutrition/min (increased 6x)
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  // ============================================================
  // === VOLCANIC ISLE ===
  // ============================================================

  nickel_cobalt_miner: {
    type: 'nickel_cobalt_miner',
    name: 'Nickel-Cobalt Miner',
    description: 'Extracts valuable nickel-cobalt ore. Essential for batteries and looking important.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'stone_bricks', amount: 60 },
      { resourceId: 'iron_ingots', amount: 20 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'nickel_cobalt_ore', amount: 3 }], // Increased from 2 to 3
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  obsidian_collector: {
    type: 'obsidian_collector',
    name: 'Obsidian Collector',
    description: 'Collects volcanic glass. Sharp, shiny, and surprisingly useful. Handle with care!',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'ceramics', amount: 40 },
      { resourceId: 'glass', amount: 25 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'obsidian', amount: 4 }], // Increased from 3 to 4
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  geothermal_tap: {
    type: 'geothermal_tap',
    name: 'Geothermal Tap',
    description: 'Harnesses volcano power. Free energy! (Terms and conditions: may explode)',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'iron_ingots', amount: 30 },
      { resourceId: 'ceramics', amount: 40 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'geothermal_energy', amount: 6 }], // Increased from 5 to 6
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  sulfur_collector: {
    type: 'sulfur_collector',
    name: 'Sulfur Collector',
    description: 'Collects sulfur from volcanic vents. Smells terrible, works great!',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'ceramics', amount: 30 },
      { resourceId: 'iron_ingots', amount: 20 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'sulfur', amount: 4 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  refinery: {
    type: 'refinery',
    name: 'Refinery',
    description: 'Processes rare ores into valuable alloys. High-tech metallurgy meets panda ingenuity.',
    category: 'processor',
    baseCost: [
      { resourceId: 'iron_ingots', amount: 40 },
      { resourceId: 'glass', amount: 30 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'nickel_cobalt_ore', amount: 3 },
      { resourceId: 'geothermal_energy', amount: 2 },
    ],
    produces: [{ resourceId: 'refined_alloy', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  obsidian_forge: {
    type: 'obsidian_forge',
    name: 'Obsidian Forge',
    description: 'Shapes obsidian into tools and components. Ancient material, modern applications.',
    category: 'processor',
    baseCost: [
      { resourceId: 'obsidian', amount: 30 },
      { resourceId: 'iron_ingots', amount: 25 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'obsidian', amount: 5 },
      { resourceId: 'geothermal_energy', amount: 3 },
    ],
    produces: [{ resourceId: 'obsidian_tools', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  // ============================================================
  // === CRYSTAL CAVERNS ===
  // ============================================================

  lithium_miner: {
    type: 'lithium_miner',
    name: 'Lithium Miner',
    description: 'Extracts lithium crystals. Essential for batteries and achieving that spaceship dream!',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'refined_alloy', amount: 20 },
      { resourceId: 'obsidian_tools', amount: 10 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'lithium_crystals', amount: 3 }], // Increased from 2 to 3
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  copper_miner: {
    type: 'copper_miner',
    name: 'Copper Miner',
    description: 'Digs up copper ore. The backbone of electrical systems everywhere.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'iron_ingots', amount: 35 },
      { resourceId: 'glass', amount: 20 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'copper_ore', amount: 4 }], // Increased from 3 to 4
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  phosphorus_collector: {
    type: 'phosphorus_collector',
    name: 'Phosphorus Collector',
    description: 'Gathers glowing phosphorus deposits. Literally the element that makes things glow!',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'glass', amount: 30 },
      { resourceId: 'ceramics', amount: 25 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'phosphorus', amount: 3 }], // Increased from 2 to 3
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  quartz_miner: {
    type: 'quartz_miner',
    name: 'Quartz Miner',
    description: 'Harvests pure quartz crystals. Perfect for electronics and looking fabulous.',
    category: 'gatherer',
    baseCost: [
      { resourceId: 'obsidian_tools', amount: 15 },
      { resourceId: 'refined_alloy', amount: 15 },
    ],
    baseProductionRate: 1,
    consumes: [],
    produces: [{ resourceId: 'quartz_crystals', amount: 3 }], // Increased from 2 to 3
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.15,
    maxInstancesPerBiome: 1,
  },

  // ============================================================
  // === ADVANCED PRODUCTION (Multi-biome availability) ===
  // ============================================================

  // --- TIER 2 INTERMEDIATE PROCESSORS ---

  electrolyzer: {
    type: 'electrolyzer',
    name: 'Electrolyzer',
    description: 'Splits water into hydrogen and oxygen. Basic chemistry, universe-changing results.',
    category: 'processor',
    baseCost: [
      { resourceId: 'iron_ingots', amount: 30 },
      { resourceId: 'glass', amount: 25 },
      { resourceId: 'rubber', amount: 20 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'clean_water', amount: 4 },
      { resourceId: 'geothermal_energy', amount: 2 },
    ],
    produces: [
      { resourceId: 'hydrogen', amount: 2 },
      { resourceId: 'oxygen', amount: 1 },
    ],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  vulcanizer: {
    type: 'vulcanizer',
    name: 'Vulcanizer',
    description: 'Combines rubber with sulfur under heat. Stronger rubber for space-worthy seals!',
    category: 'processor',
    baseCost: [
      { resourceId: 'ceramics', amount: 35 },
      { resourceId: 'iron_ingots', amount: 25 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'rubber', amount: 3 },
      { resourceId: 'sulfur', amount: 2 },
      { resourceId: 'charcoal', amount: 2 },
    ],
    produces: [{ resourceId: 'vulcanized_rubber', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  wire_mill: {
    type: 'wire_mill',
    name: 'Wire Mill',
    description: 'Draws copper into fine wire. The nervous system of any electrical device.',
    category: 'processor',
    baseCost: [
      { resourceId: 'iron_ingots', amount: 30 },
      { resourceId: 'stone_bricks', amount: 25 },
    ],
    baseProductionRate: 1,
    consumes: [{ resourceId: 'copper_ore', amount: 3 }],
    produces: [{ resourceId: 'copper_wire', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.25,
    maxInstancesPerBiome: 1,
  },

  frame_mill: {
    type: 'frame_mill',
    name: 'Frame Mill',
    description: 'Shapes aluminum into structural frames. Strong bones for your spaceship!',
    category: 'processor',
    baseCost: [
      { resourceId: 'iron_ingots', amount: 40 },
      { resourceId: 'glass', amount: 30 },
    ],
    baseProductionRate: 1,
    consumes: [{ resourceId: 'aluminum_ingots', amount: 3 }],
    produces: [{ resourceId: 'aluminum_frame', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.25,
    maxInstancesPerBiome: 1,
  },

  chemical_plant: {
    type: 'chemical_plant',
    name: 'Chemical Plant',
    description: 'Synthesizes ammonia from nitrogen and hydrogen. The Haber process, panda-style!',
    category: 'processor',
    baseCost: [
      { resourceId: 'ceramics', amount: 40 },
      { resourceId: 'iron_ingots', amount: 35 },
      { resourceId: 'glass', amount: 25 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'nitrogen_nodules', amount: 3 },
      { resourceId: 'hydrogen', amount: 3 },
    ],
    produces: [{ resourceId: 'ammonia', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  // --- TIER 3 INTERMEDIATE PROCESSORS ---

  graphitizer: {
    type: 'graphitizer',
    name: 'Graphitizer',
    description: 'Transforms charcoal into pure graphite. Carbon rearrangement for battery anodes.',
    category: 'processor',
    baseCost: [
      { resourceId: 'ceramics', amount: 50 },
      { resourceId: 'iron_ingots', amount: 40 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'charcoal', amount: 5 },
      { resourceId: 'geothermal_energy', amount: 3 },
    ],
    produces: [{ resourceId: 'graphite', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  precision_cutter: {
    type: 'precision_cutter',
    name: 'Precision Cutter',
    description: 'Uses obsidian tools to cut quartz with extreme precision. Crystal surgery!',
    category: 'processor',
    baseCost: [
      { resourceId: 'obsidian_tools', amount: 20 },
      { resourceId: 'glass', amount: 40 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'quartz_crystals', amount: 3 },
      { resourceId: 'obsidian_tools', amount: 1 },
    ],
    produces: [{ resourceId: 'precision_quartz', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  doping_plant: {
    type: 'doping_plant',
    name: 'Doping Plant',
    description: 'Adds precise impurities to silicon. Controlled contamination for semiconductors.',
    category: 'processor',
    baseCost: [
      { resourceId: 'glass', amount: 50 },
      { resourceId: 'refined_alloy', amount: 30 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'silicon_ingot', amount: 2 },
      { resourceId: 'phosphorus', amount: 1 },
    ],
    produces: [{ resourceId: 'doped_silicon', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  lox_plant: {
    type: 'lox_plant',
    name: 'LOX Plant',
    description: 'Cryogenically liquefies oxygen. Cold enough to make a panda shiver!',
    category: 'processor',
    baseCost: [
      { resourceId: 'iron_ingots', amount: 50 },
      { resourceId: 'glass', amount: 40 },
      { resourceId: 'rubber', amount: 30 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'oxygen', amount: 4 },
      { resourceId: 'ice', amount: 3 },
    ],
    produces: [{ resourceId: 'liquid_oxygen', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  // --- TIER 4 INTERMEDIATE PROCESSORS ---

  lithography_lab: {
    type: 'lithography_lab',
    name: 'Lithography Lab',
    description: 'Etches circuits onto silicon wafers. The birthplace of computer brains!',
    category: 'processor',
    baseCost: [
      { resourceId: 'precision_quartz', amount: 20 },
      { resourceId: 'refined_alloy', amount: 40 },
      { resourceId: 'glass', amount: 50 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'doped_silicon', amount: 2 },
      { resourceId: 'precision_quartz', amount: 1 },
      { resourceId: 'copper_wire', amount: 2 },
    ],
    produces: [{ resourceId: 'microchips', amount: 1 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  battery_factory: {
    type: 'battery_factory',
    name: 'Battery Factory',
    description: 'Assembles lithium-ion battery cells. Storing energy for the journey home!',
    category: 'processor',
    baseCost: [
      { resourceId: 'refined_alloy', amount: 35 },
      { resourceId: 'glass', amount: 30 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'lithium_crystals', amount: 2 },
      { resourceId: 'graphite', amount: 2 },
      { resourceId: 'copper_wire', amount: 2 },
    ],
    produces: [{ resourceId: 'battery_cells', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  pv_plant: {
    type: 'pv_plant',
    name: 'PV Plant',
    description: 'Produces photovoltaic solar cells. Turning starlight into electricity!',
    category: 'processor',
    baseCost: [
      { resourceId: 'glass', amount: 50 },
      { resourceId: 'refined_alloy', amount: 40 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'doped_silicon', amount: 2 },
      { resourceId: 'copper_wire', amount: 2 },
      { resourceId: 'glass', amount: 3 },
    ],
    produces: [{ resourceId: 'solar_cells', amount: 2 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  // ============================================================
  // === FINAL PRODUCT ASSEMBLERS ===
  // These create the 7 components needed for the S.S. Bamboozle!
  // ============================================================

  fuel_depot: {
    type: 'fuel_depot',
    name: 'Fuel Depot',
    description: 'Mixes kerosene with LOX. The explosive combo that gets you home!',
    category: 'final_assembler',
    baseCost: [
      { resourceId: 'iron_ingots', amount: 60 },
      { resourceId: 'ceramics', amount: 50 },
      { resourceId: 'vulcanized_rubber', amount: 30 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'kerosene', amount: 3 },
      { resourceId: 'liquid_oxygen', amount: 2 },
    ],
    produces: [{ resourceId: 'rocket_fuel', amount: 1 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  thruster_plant: {
    type: 'thruster_plant',
    name: 'Thruster Plant',
    description: 'Assembles rocket thrusters. The muscles of your escape plan!',
    category: 'final_assembler',
    baseCost: [
      { resourceId: 'refined_alloy', amount: 50 },
      { resourceId: 'ceramics', amount: 40 },
      { resourceId: 'obsidian_tools', amount: 20 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'refined_alloy', amount: 4 },
      { resourceId: 'iron_ingots', amount: 3 },
      { resourceId: 'vulcanized_rubber', amount: 2 },
    ],
    produces: [{ resourceId: 'thrusters', amount: 1 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  tank_filling_station: {
    type: 'tank_filling_station',
    name: 'Tank Filling Station',
    description: 'Fills and pressurizes oxygen tanks. Breathing in space is overrated... wait, no it isn\'t.',
    category: 'final_assembler',
    baseCost: [
      { resourceId: 'iron_ingots', amount: 50 },
      { resourceId: 'glass', amount: 40 },
      { resourceId: 'vulcanized_rubber', amount: 25 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'liquid_oxygen', amount: 3 },
      { resourceId: 'iron_ingots', amount: 2 },
      { resourceId: 'vulcanized_rubber', amount: 1 },
    ],
    produces: [{ resourceId: 'oxygen_tanks', amount: 1 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  hull_assembly: {
    type: 'hull_assembly',
    name: 'Hull Assembly',
    description: 'Constructs the titanium hull. Home is where the hull is!',
    category: 'final_assembler',
    baseCost: [
      { resourceId: 'refined_alloy', amount: 60 },
      { resourceId: 'obsidian_tools', amount: 30 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'refined_alloy', amount: 5 },
      { resourceId: 'vulcanized_rubber', amount: 3 },
      { resourceId: 'iron_ingots', amount: 3 },
    ],
    produces: [{ resourceId: 'titanium_hull', amount: 1 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  solar_array_assembly: {
    type: 'solar_array_assembly',
    name: 'Solar Array Assembly',
    description: 'Combines solar cells into deployable arrays. Free energy in the void!',
    category: 'final_assembler',
    baseCost: [
      { resourceId: 'aluminum_frame', amount: 30 },
      { resourceId: 'glass', amount: 50 },
      { resourceId: 'copper_wire', amount: 40 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'solar_cells', amount: 4 },
      { resourceId: 'aluminum_frame', amount: 2 },
      { resourceId: 'copper_wire', amount: 3 },
    ],
    produces: [{ resourceId: 'solar_arrays', amount: 1 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  battery_assembly: {
    type: 'battery_assembly',
    name: 'Battery Assembly',
    description: 'Assembles battery cells into complete battery packs for the spaceship. The final step in portable power production.',
    category: 'final_assembler',
    baseCost: [
      { resourceId: 'refined_alloy', amount: 50 },
      { resourceId: 'copper_wire', amount: 30 },
      { resourceId: 'insulation', amount: 20 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'battery_cells', amount: 4 },
      { resourceId: 'copper_wire', amount: 2 },
    ],
    produces: [{ resourceId: 'batteries', amount: 1 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.35,
    maxInstancesPerBiome: 1,
  },

  // === INTERMEDIATE PROCESSORS (Tier 2-3) ===

  silicon_processor: {
    type: 'silicon_processor',
    name: 'Silicon Processor',
    description: 'Processes quartz sand into pure silicon ingots. High-temperature reduction turns sand into semiconductor-grade silicon.',
    category: 'processor',
    baseCost: [
      { resourceId: 'stone_bricks', amount: 40 },
      { resourceId: 'iron_ingots', amount: 25 },
      { resourceId: 'copper_wire', amount: 15 },
    ],
    baseProductionRate: 2,
    consumes: [{ resourceId: 'quartz_sand', amount: 4 }],
    produces: [{ resourceId: 'silicon_ingot', amount: 1 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.25,
    maxInstancesPerBiome: 1,
  },

  aluminum_smelter: {
    type: 'aluminum_smelter',
    name: 'Aluminum Smelter',
    description: 'Smelts clay into aluminum ingots using high-temperature electrolysis. The Hall-Héroult process extracts aluminum from alumina-rich clay.',
    category: 'processor',
    baseCost: [
      { resourceId: 'stone_bricks', amount: 50 },
      { resourceId: 'iron_ingots', amount: 30 },
      { resourceId: 'graphite', amount: 20 },
    ],
    baseProductionRate: 2,
    consumes: [{ resourceId: 'clay', amount: 5 }],
    produces: [{ resourceId: 'aluminum_ingots', amount: 1 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.25,
    maxInstancesPerBiome: 1,
  },

  insulation_plant: {
    type: 'insulation_plant',
    name: 'Insulation Plant',
    description: 'Combines vulcanized rubber with arctic moss fibers to create thermal insulation. Natural fibers trapped in rubber matrix provide excellent thermal protection.',
    category: 'processor',
    baseCost: [
      { resourceId: 'planks', amount: 30 },
      { resourceId: 'stone_bricks', amount: 25 },
      { resourceId: 'iron_ingots', amount: 15 },
    ],
    baseProductionRate: 3,
    consumes: [
      { resourceId: 'vulcanized_rubber', amount: 2 },
      { resourceId: 'arctic_moss', amount: 3 },
    ],
    produces: [{ resourceId: 'insulation', amount: 1 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.2,
    maxInstancesPerBiome: 1,
  },

  hydrazine_plant: {
    type: 'hydrazine_plant',
    name: 'Hydrazine Plant',
    description: 'Synthesizes hydrazine from ammonia and hydrogen. Hypergolic fuel that ignites on contact with oxidizers. Handle with care!',
    category: 'processor',
    baseCost: [
      { resourceId: 'stone_bricks', amount: 60 },
      { resourceId: 'iron_ingots', amount: 40 },
      { resourceId: 'glass', amount: 30 },
    ],
    baseProductionRate: 1,
    consumes: [
      { resourceId: 'ammonia', amount: 3 },
      { resourceId: 'hydrogen', amount: 2 },
    ],
    produces: [{ resourceId: 'hydrazine', amount: 1 }],
    upgradeSlots: 5,
    levelUpCostMultiplier: 1.3,
    maxInstancesPerBiome: 1,
  },
};

// All intermediate processors now implemented
// Production chains complete from raw materials to final spaceship components
