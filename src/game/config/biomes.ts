import { BiomeConfig } from '../../types/biome.types';
import { BiomeId } from '../../types/game.types';

export const BIOMES: Record<BiomeId, BiomeConfig> = {
  lush_forest: {
    id: 'lush_forest',
    name: 'Lush Forest',
    description: 'A dense forest filled with trees that look suspiciously like the ones from home. Either convergent evolution or the universe is lazy with its assets.',
    icon: '🌲',
    primaryResources: ['wood', 'stone', 'berries'], // berries can be hand-picked, goes to state.food
    discoverableResources: ['rubber_sap', 'nitrogen_nodules'],
    availableAutomations: ['logger', 'quarry', 'berry_picker', 'nitrogen_collector', 'rubber_tapper', 'saw_mill', 'stone_cutter', 'rubber_processor', 'charcoal_kiln', 'graphitizer'],
    backgroundColor: '#2d5016',
    accentColor: '#5a9e3a',
  },

  misty_lake: {
    id: 'misty_lake',
    name: 'Misty Lake',
    description: 'A serene lake shrouded in mysterious mist. The mist is actually just regular fog, but "mysterious" sounds better for property values.',
    icon: '🌊',
    primaryResources: ['fresh_water', 'fish'], // Starting resources (2)
    discoverableResources: ['clay'], // Found via expeditions in this biome
    availableAutomations: ['water_collector', 'water_purifier', 'fish_trap', 'clay_digger', 'kiln', 'smokehouse', 'electrolyzer', 'aluminum_smelter'],
    backgroundColor: '#1e3a5f',
    accentColor: '#4a90a4',
  },

  arid_desert: {
    id: 'arid_desert',
    name: 'Arid Desert',
    description: 'Hot. Sandy. Surprisingly full of useful stuff if you don\'t mind the constant sweating. Your fur was not designed for this.',
    icon: '🏜️',
    primaryResources: ['quartz_sand', 'cactus'], // Starting resources (2)
    discoverableResources: ['crude_oil', 'sulfur'], // Found via expeditions in this biome
    availableAutomations: ['sand_collector', 'oil_pump', 'cactus_farm', 'glass_furnace', 'distillation_unit', 'cactus_press', 'chemical_plant', 'fuel_depot', 'silicon_processor', 'hydrazine_plant'],
    unlockCondition: {
      type: 'expedition',
    },
    backgroundColor: '#c2b280',
    accentColor: '#d4a574',
  },

  frozen_tundra: {
    id: 'frozen_tundra',
    name: 'Frozen Tundra',
    description: 'Finally, weather appropriate for Dr. Redd Pawston III! Sure, there\'s titanium here, but mostly you\'re just happy to stop sweating.',
    icon: '❄️',
    primaryResources: ['ice', 'iron_ore'], // Starting resources (2)
    discoverableResources: ['rutile_ore', 'arctic_moss'], // Found via expeditions in this biome
    availableAutomations: ['ice_harvester', 'rutile_miner', 'iron_miner', 'moss_collector', 'smelter', 'greenhouse', 'frame_mill', 'lox_plant', 'hull_assembly', 'insulation_plant'],
    unlockCondition: {
      type: 'expedition',
    },
    backgroundColor: '#b0e0e6',
    accentColor: '#4682b4',
  },

  volcanic_isle: {
    id: 'volcanic_isle',
    name: 'Volcanic Isle',
    description: 'An island dominated by an active volcano. "Active" here means "could explode any time but the rare metals are worth it." Probably.',
    icon: '🌋',
    primaryResources: ['obsidian', 'geothermal_energy'], // Starting resources (2)
    discoverableResources: ['nickel_cobalt_ore', 'sulfur'], // Found via expeditions in this biome
    availableAutomations: ['nickel_cobalt_miner', 'obsidian_collector', 'geothermal_tap', 'sulfur_collector', 'refinery', 'obsidian_forge', 'vulcanizer', 'thruster_plant'],
    unlockCondition: {
      type: 'expedition',
    },
    backgroundColor: '#8b1a1a',
    accentColor: '#ff4500',
  },

  crystal_caverns: {
    id: 'crystal_caverns',
    name: 'Crystal Caverns',
    description: 'Underground caves filled with glowing crystals. Very pretty. Very valuable. Very easy to get lost in. Bring snacks.',
    icon: '💎',
    primaryResources: ['lithium_crystals', 'copper_ore'], // Starting resources (2)
    discoverableResources: ['phosphorus', 'quartz_crystals'], // Found via expeditions in this biome
    availableAutomations: ['lithium_miner', 'copper_miner', 'phosphorus_collector', 'quartz_miner', 'wire_mill', 'precision_cutter', 'doping_plant', 'lithography_lab', 'battery_factory', 'battery_assembly', 'pv_plant', 'solar_array_assembly', 'tank_filling_station'],
    unlockCondition: {
      type: 'expedition',
    },
    backgroundColor: '#4a0e4e',
    accentColor: '#9d4edd',
  },
};
