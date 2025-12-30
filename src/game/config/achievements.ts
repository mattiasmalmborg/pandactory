import { AchievementId, AchievementCategory, GameState, BiomeId, ResourceId } from '../../types/game.types';
import { BIOMES } from './biomes';
import { RESOURCES } from './resources';

export interface AchievementDefinition {
  id: AchievementId;
  name: string;
  description: string;
  flavorText?: string; // Short, funny flavor text
  icon: string;
  category: AchievementCategory;
  hidden?: boolean; // If true, show as "???" until unlocked
}

export const ACHIEVEMENTS: Record<AchievementId, AchievementDefinition> = {
  // === GATHERING ACHIEVEMENTS (10) ===
  first_gather: {
    id: 'first_gather',
    name: 'First Steps',
    description: 'Gather your first resource',
    flavorText: 'Every journey begins with a single paw tap.',
    icon: '👆',
    category: 'gathering',
  },
  gather_1k: {
    id: 'gather_1k',
    name: 'Getting Started',
    description: 'Gather 10,000 total resources',
    flavorText: 'Your paws are just getting warmed up.',
    icon: '📦',
    category: 'gathering',
  },
  gather_100k: {
    id: 'gather_100k',
    name: 'Resource Collector',
    description: 'Gather 1,000,000 total resources',
    flavorText: 'The warehouse is getting cramped.',
    icon: '📦',
    category: 'gathering',
  },
  gather_1m: {
    id: 'gather_1m',
    name: 'Hoarder',
    description: 'Gather 10,000,000 total resources',
    flavorText: 'This is fine. Everything is fine.',
    icon: '🏆',
    category: 'gathering',
  },
  gather_10m: {
    id: 'gather_10m',
    name: 'Resource Tycoon',
    description: 'Gather 100,000,000 total resources',
    flavorText: 'More resources than sense.',
    icon: '👑',
    category: 'gathering',
  },
  gather_100m: {
    id: 'gather_100m',
    name: 'Infinity Collector',
    description: 'Gather 1,000,000,000 total resources',
    flavorText: 'Are you still clicking? Really?',
    icon: '🌟',
    category: 'gathering',
  },
  material_master: {
    id: 'material_master',
    name: 'Material Master',
    description: 'Discover all raw resources',
    flavorText: 'If it exists, you\'ve poked it.',
    icon: '🪨',
    category: 'gathering',
  },
  culinary_explorer: {
    id: 'culinary_explorer',
    name: 'Culinary Explorer',
    description: 'Discover all food types',
    flavorText: 'A panda of sophisticated taste.',
    icon: '🍽️',
    category: 'gathering',
  },
  full_catalog: {
    id: 'full_catalog',
    name: 'Full Catalog',
    description: 'Discover all resources in the game',
    flavorText: 'You could write the encyclopedia now.',
    icon: '📚',
    category: 'gathering',
  },
  self_sufficient: {
    id: 'self_sufficient',
    name: 'Self-Sufficient',
    description: 'Have 1,000+ of every resource at once',
    flavorText: 'Prepared for any emergency. Or a really big party.',
    icon: '🏡',
    category: 'gathering',
  },

  // === AUTOMATION ACHIEVEMENTS (13) ===
  first_automation: {
    id: 'first_automation',
    name: 'Automation Begins',
    description: 'Build your first automation',
    flavorText: 'Work smarter, not harder. Or both!',
    icon: '⚙️',
    category: 'automation',
  },
  automation_5: {
    id: 'automation_5',
    name: 'Factory Floor',
    description: 'Build 5 automations',
    flavorText: 'The machines are multiplying.',
    icon: '🏭',
    category: 'automation',
  },
  automation_10: {
    id: 'automation_10',
    name: 'Industrial Revolution',
    description: 'Build 10 automations',
    flavorText: 'Steam power? We have panda power.',
    icon: '🏭',
    category: 'automation',
  },
  automation_25: {
    id: 'automation_25',
    name: 'Mass Production',
    description: 'Build 25 automations',
    flavorText: 'The conveyor belts never stop.',
    icon: '🏭',
    category: 'automation',
  },
  automation_50: {
    id: 'automation_50',
    name: 'Automation Empire',
    description: 'Build 50 automations',
    flavorText: 'Skynet, but cute and fluffy.',
    icon: '👑',
    category: 'automation',
  },
  all_automations: {
    id: 'all_automations',
    name: 'Factory Planet',
    description: 'Build all 59 automations',
    flavorText: 'The planet is now 90% factory.',
    icon: '🌍',
    category: 'automation',
  },
  first_production: {
    id: 'first_production',
    name: 'First Production',
    description: 'Produce your first resource via automation',
    flavorText: 'It\'s alive! IT\'S ALIVE!',
    icon: '🔄',
    category: 'automation',
  },
  first_upgrade: {
    id: 'first_upgrade',
    name: 'Upgraded',
    description: 'Upgrade an automation for the first time',
    flavorText: 'Now with 50% more gears.',
    icon: '⬆️',
    category: 'automation',
  },
  single_upgrade_50: {
    id: 'single_upgrade_50',
    name: 'Optimizer',
    description: 'Upgrade one automation to level 50',
    flavorText: 'That machine is your favorite child.',
    icon: '📈',
    category: 'automation',
  },
  single_upgrade_100: {
    id: 'single_upgrade_100',
    name: 'Efficiency Expert',
    description: 'Upgrade one automation to level 100',
    flavorText: 'It practically runs itself. Wait, it does.',
    icon: '🎯',
    category: 'automation',
  },
  single_upgrade_200: {
    id: 'single_upgrade_200',
    name: 'Upgrade Master',
    description: 'Upgrade one automation to level 200',
    flavorText: 'At this point, it\'s more upgrade than machine.',
    icon: '🏆',
    category: 'automation',
  },
  biome_specialist: {
    id: 'biome_specialist',
    name: 'Biome Specialist',
    description: 'Have 10+ automations in a single biome',
    flavorText: 'Local wildlife: concerned.',
    icon: '🎖️',
    category: 'automation',
  },
  all_automations_100: {
    id: 'all_automations_100',
    name: 'Centennial Factory',
    description: 'Have all automations at level 100+',
    flavorText: 'Your power bill must be astronomical.',
    icon: '💯',
    category: 'automation',
    hidden: true,
  },

  // === POWER CELL ACHIEVEMENTS (7) ===
  power_cell_installed: {
    id: 'power_cell_installed',
    name: 'Powered Up',
    description: 'Install a power cell for the first time',
    flavorText: 'Unlimited power! Well, limited power. But more!',
    icon: '🔋',
    category: 'power_cells',
  },
  green_energy_5: {
    id: 'green_energy_5',
    name: 'Green Energy',
    description: 'Install your first green power cell',
    flavorText: 'Eco-friendly panda is eco-friendly.',
    icon: '🟢',
    category: 'power_cells',
  },
  blue_power: {
    id: 'blue_power',
    name: 'Blue Power',
    description: 'Install your first blue power cell',
    flavorText: 'Now we\'re cooking with... blue?',
    icon: '🔵',
    category: 'power_cells',
  },
  orange_surge: {
    id: 'orange_surge',
    name: 'Orange Surge',
    description: 'Install your first orange power cell',
    flavorText: 'Warning: May cause excessive productivity.',
    icon: '🟠',
    category: 'power_cells',
  },
  power_cells_10: {
    id: 'power_cells_10',
    name: 'Fully Charged',
    description: 'Have 10 power cells installed at once',
    flavorText: 'Like an energizer bunny, but a panda.',
    icon: '⚡',
    category: 'power_cells',
  },
  power_cells_20: {
    id: 'power_cells_20',
    name: 'Power Grid',
    description: 'Have 20 power cells installed at once',
    flavorText: 'The lights never go out.',
    icon: '🔌',
    category: 'power_cells',
  },
  maximum_power: {
    id: 'maximum_power',
    name: 'Maximum Power',
    description: 'Install power cells in all 59 automations',
    flavorText: 'OVER 9000! ...wait, 59. Close enough.',
    icon: '💥',
    category: 'power_cells',
  },

  // === EXPEDITION ACHIEVEMENTS (10) ===
  first_expedition: {
    id: 'first_expedition',
    name: 'Explorer',
    description: 'Complete your first expedition',
    flavorText: 'A panda\'s gotta stretch those legs.',
    icon: '🗺️',
    category: 'expedition',
  },
  expedition_10: {
    id: 'expedition_10',
    name: 'Seasoned Explorer',
    description: 'Complete 10 expeditions',
    flavorText: 'You\'re getting good at walking.',
    icon: '🧭',
    category: 'expedition',
  },
  expedition_50: {
    id: 'expedition_50',
    name: 'Veteran Explorer',
    description: 'Complete 50 expeditions',
    flavorText: 'Your paws have built-in GPS now.',
    icon: '🏕️',
    category: 'expedition',
  },
  expedition_100: {
    id: 'expedition_100',
    name: 'Legendary Explorer',
    description: 'Complete 100 expeditions',
    flavorText: 'They tell tales of you around campfires.',
    icon: '🌟',
    category: 'expedition',
  },
  expedition_500: {
    id: 'expedition_500',
    name: 'Marathon Explorer',
    description: 'Complete 500 expeditions',
    flavorText: 'Do you even stop to eat? Oh wait, you have to.',
    icon: '🏅',
    category: 'expedition',
  },
  swift_forage_25: {
    id: 'swift_forage_25',
    name: 'Speed Runner',
    description: 'Complete 25 Quick Dashes',
    flavorText: 'Gotta go fast!',
    icon: '💨',
    category: 'expedition',
  },
  quick_scout_25: {
    id: 'quick_scout_25',
    name: 'Scout Master',
    description: 'Complete 25 Quick Scouts',
    flavorText: 'Always be prepared. And hungry.',
    icon: '🔭',
    category: 'expedition',
  },
  standard_expedition_25: {
    id: 'standard_expedition_25',
    name: 'Standard Bearer',
    description: 'Complete 25 Standard Expeditions',
    flavorText: 'Perfectly balanced expeditioning.',
    icon: '🚶',
    category: 'expedition',
  },
  deep_exploration_10: {
    id: 'deep_exploration_10',
    name: 'Deep Diver',
    description: 'Complete 25 Deep Explorations',
    flavorText: 'What\'s down there? MORE STUFF.',
    icon: '🔍',
    category: 'expedition',
  },
  epic_journey_5: {
    id: 'epic_journey_5',
    name: 'Epic Journeyer',
    description: 'Complete 25 Epic Journeys',
    flavorText: 'There and back again. Twenty-five times.',
    icon: '🚀',
    category: 'expedition',
  },

  // === BIOME ACHIEVEMENTS (7) ===
  world_domination: {
    id: 'world_domination',
    name: 'World Domination',
    description: 'Discover all 6 biomes',
    flavorText: 'All your biome are belong to us.',
    icon: '👑',
    category: 'biomes',
  },
  forest_resources: {
    id: 'forest_resources',
    name: 'Forest Forager',
    description: 'Discover all resources in Lush Forest',
    flavorText: 'You\'ve poked every tree and rock.',
    icon: '🌲',
    category: 'biomes',
  },
  lake_resources: {
    id: 'lake_resources',
    name: 'Lake Surveyor',
    description: 'Discover all resources in Misty Lake',
    flavorText: 'Nothing left hidden in the mist.',
    icon: '🌊',
    category: 'biomes',
  },
  desert_resources: {
    id: 'desert_resources',
    name: 'Desert Prospector',
    description: 'Discover all resources in Arid Desert',
    flavorText: 'You found treasure in the sand.',
    icon: '🏜️',
    category: 'biomes',
  },
  tundra_resources: {
    id: 'tundra_resources',
    name: 'Tundra Tracker',
    description: 'Discover all resources in Frozen Tundra',
    flavorText: 'Even the ice gave up its secrets.',
    icon: '❄️',
    category: 'biomes',
  },
  volcano_resources: {
    id: 'volcano_resources',
    name: 'Volcano Venture',
    description: 'Discover all resources in Volcanic Isle',
    flavorText: 'Hot finds for a cool panda.',
    icon: '🌋',
    category: 'biomes',
  },
  caverns_resources: {
    id: 'caverns_resources',
    name: 'Cavern Cartographer',
    description: 'Discover all resources in Crystal Caverns',
    flavorText: 'Every gem accounted for.',
    icon: '💎',
    category: 'biomes',
  },

  // === CRASH/PRESTIGE ACHIEVEMENTS (8) - All hidden until first prestige ===
  first_crash: {
    id: 'first_crash',
    name: 'Crash Landing',
    description: 'Complete your first crash',
    flavorText: 'That was intentional. Totally.',
    icon: '💥',
    category: 'crashes',
    hidden: true,
  },
  crash_3: {
    id: 'crash_3',
    name: 'Repeat Offender',
    description: 'Crash 3 times',
    flavorText: 'Third time\'s the... crash?',
    icon: '🔄',
    category: 'crashes',
    hidden: true,
  },
  crash_5: {
    id: 'crash_5',
    name: 'Frequent Crasher',
    description: 'Crash 5 times',
    flavorText: 'Insurance rates: astronomical.',
    icon: '🔄',
    category: 'crashes',
    hidden: true,
  },
  crash_10: {
    id: 'crash_10',
    name: 'Professional Crasher',
    description: 'Crash 10 times',
    flavorText: 'You\'ve made crashing an art form.',
    icon: '🎯',
    category: 'crashes',
    hidden: true,
  },
  crash_25: {
    id: 'crash_25',
    name: 'Crash Connoisseur',
    description: 'Crash 25 times',
    flavorText: 'At this point, is it even an accident?',
    icon: '🏆',
    category: 'crashes',
    hidden: true,
  },
  cosmic_bamboo_10: {
    id: 'cosmic_bamboo_10',
    name: 'Cosmic Collector',
    description: 'Collect 10 Cosmic Bamboo Shards',
    flavorText: 'The cosmos rewards your persistence.',
    icon: '🎋',
    category: 'crashes',
    hidden: true,
  },
  cosmic_bamboo_50: {
    id: 'cosmic_bamboo_50',
    name: 'Cosmic Hoarder',
    description: 'Collect 50 Cosmic Bamboo Shards',
    flavorText: 'Your bamboo stash glows in the dark.',
    icon: '🎋',
    category: 'crashes',
    hidden: true,
  },
  cosmic_bamboo_100: {
    id: 'cosmic_bamboo_100',
    name: 'Cosmic Master',
    description: 'Collect 100 Cosmic Bamboo Shards',
    flavorText: 'You are one with the cosmic bamboo.',
    icon: '✨',
    category: 'crashes',
    hidden: true,
  },

  // === SKILL ACHIEVEMENTS (6) ===
  first_skill: {
    id: 'first_skill',
    name: 'Skill Unlocked',
    description: 'Unlock your first skill',
    flavorText: 'Level up! Ding!',
    icon: '🔓',
    category: 'skills',
  },
  production_branch: {
    id: 'production_branch',
    name: 'Production Pro',
    description: 'Complete the Production skill branch',
    flavorText: 'Efficiency is your middle name.',
    icon: '⚙️',
    category: 'skills',
  },
  economy_branch: {
    id: 'economy_branch',
    name: 'Economy Expert',
    description: 'Complete the Economy skill branch',
    flavorText: 'Penny-wise, panda-smart.',
    icon: '💰',
    category: 'skills',
  },
  expedition_branch: {
    id: 'expedition_branch',
    name: 'Expedition Elite',
    description: 'Complete the Expedition skill branch',
    flavorText: 'Born to wander.',
    icon: '🗺️',
    category: 'skills',
  },
  power_cells_branch: {
    id: 'power_cells_branch',
    name: 'Power Master',
    description: 'Complete the Power Cells skill branch',
    flavorText: 'Resistance is futile.',
    icon: '🔋',
    category: 'skills',
  },
  all_skills: {
    id: 'all_skills',
    name: 'Skill Savant',
    description: 'Unlock all 16 skills',
    flavorText: 'A panda of many talents.',
    icon: '🧠',
    category: 'skills',
    hidden: true,
  },

  // === MILESTONE ACHIEVEMENTS (3) ===
  spaceship_started: {
    id: 'spaceship_started',
    name: 'Liftoff Prep',
    description: 'Contribute to the spaceship for the first time',
    flavorText: 'Houston, we have a panda.',
    icon: '🛠️',
    category: 'milestones',
  },
  spaceship_halfway: {
    id: 'spaceship_halfway',
    name: 'Halfway There',
    description: 'Complete 50% of spaceship requirements',
    flavorText: 'Livin\' on a prayer.',
    icon: '🚧',
    category: 'milestones',
  },
  spaceship_complete: {
    id: 'spaceship_complete',
    name: 'Ready for Launch',
    description: 'Complete the spaceship',
    flavorText: 'Next stop: the stars!',
    icon: '🚀',
    category: 'milestones',
  },

  // === SECRET/FUN ACHIEVEMENTS (5) ===
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Play between midnight and 4 AM',
    flavorText: 'Sleep is for pandas who aren\'t building rockets.',
    icon: '🦉',
    category: 'secret',
    hidden: true,
  },
  clicker_champion: {
    id: 'clicker_champion',
    name: 'Clicker Champion',
    description: 'Click 1,000 times in a single session',
    flavorText: 'Your mouse called. It wants a break.',
    icon: '🖱️',
    category: 'secret',
    hidden: true,
  },
  patient_panda: {
    id: 'patient_panda',
    name: 'Patient Panda',
    description: 'Wait 5 minutes without clicking anything',
    flavorText: 'Zen master achievement unlocked.',
    icon: '🧘',
    category: 'secret',
    hidden: true,
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Build 6 automations within 5 minutes of starting',
    flavorText: 'Slow down! Actually, don\'t.',
    icon: '⚡',
    category: 'secret',
    hidden: true,
  },
  hoarder_deluxe: {
    id: 'hoarder_deluxe',
    name: 'Hoarder Deluxe',
    description: 'Have 100T+ of a single resource',
    flavorText: 'You\'re gonna need a bigger warehouse.',
    icon: '📦',
    category: 'secret',
    hidden: true,
  },
  bamboo_addict: {
    id: 'bamboo_addict',
    name: 'Bamboo Addict',
    description: 'Spend over 50 Cosmic Bamboo Shards on skills',
    flavorText: 'The bamboo flows through you.',
    icon: '🎋',
    category: 'secret',
    hidden: true,
  },
  perfectionist: {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Have all 59 automations with orange power cells',
    flavorText: 'Only the best will do.',
    icon: '🟠',
    category: 'secret',
    hidden: true,
  },
  completionist: {
    id: 'completionist',
    name: 'Completionist',
    description: 'Unlock all other achievements',
    flavorText: 'You did it. You actually did it. Now go outside.',
    icon: '🏅',
    category: 'secret',
    hidden: true,
  },
};

// Helper to get achievements by category
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
}

// Helper to get total achievement count
export function getTotalAchievementCount(): number {
  return Object.keys(ACHIEVEMENTS).length;
}

// Check achievement conditions
export function checkAchievements(state: GameState): AchievementId[] {
  const newAchievements: AchievementId[] = [];
  const unlocked = state.achievements?.unlocked || [];
  const stats = state.lifetimeStats;

  // Helper to check and add achievement
  const check = (id: AchievementId, condition: boolean) => {
    if (condition && !unlocked.includes(id)) {
      newAchievements.push(id);
    }
  };

  // === GATHERING ACHIEVEMENTS ===
  check('first_gather', stats.totalResourcesGathered >= 1);
  check('gather_1k', stats.totalResourcesGathered >= 10000);
  check('gather_100k', stats.totalResourcesGathered >= 1000000);
  check('gather_1m', stats.totalResourcesGathered >= 10000000);
  check('gather_10m', stats.totalResourcesGathered >= 100000000);
  check('gather_100m', stats.totalResourcesGathered >= 1000000000);

  // Count all discovered resources across biomes
  const allDiscoveredResources = new Set<string>();
  Object.values(state.biomes).forEach(biome => {
    (biome.discoveredResources || []).forEach(r => allDiscoveredResources.add(r));
  });
  (state.discoveredProducedResources || []).forEach(r => allDiscoveredResources.add(r));

  // Raw resources count (primary + discoverable from all biomes)
  const rawResourceIds = new Set<string>();
  Object.values(BIOMES).forEach(biome => {
    (biome.primaryResources || []).forEach(r => rawResourceIds.add(r));
    (biome.discoverableResources || []).forEach(r => rawResourceIds.add(r));
  });
  const discoveredRawResources = [...rawResourceIds].filter(r => allDiscoveredResources.has(r));
  check('material_master', discoveredRawResources.length >= rawResourceIds.size);

  // Food types (4 foods in game)
  const discoveredFoods = state.discoveredProducedFoods || [];
  const foodsFromBiomes = Object.values(state.biomes).flatMap(b =>
    (b.discoveredResources || []).filter(r => ['berries', 'cactus_juice', 'smoked_fish', 'greenhouse_veggies'].includes(r))
  );
  const allFoods = new Set([...discoveredFoods, ...foodsFromBiomes]);
  check('culinary_explorer', allFoods.size >= 4);

  // Full catalog - all resources discovered
  check('full_catalog', allDiscoveredResources.size >= 50); // Approximate total resources

  // Self-sufficient - 1000+ of every resource (including food and all produced resources)
  // Count all resources across all biomes
  const allResourceAmounts: Record<string, number> = {};
  Object.values(state.biomes).forEach(biome => {
    Object.entries(biome.resources).forEach(([resourceId, amount]) => {
      allResourceAmounts[resourceId] = (allResourceAmounts[resourceId] || 0) + amount;
    });
  });
  // Add food amounts from state.food
  Object.entries(state.food).forEach(([foodId, amount]) => {
    allResourceAmounts[foodId] = (allResourceAmounts[foodId] || 0) + amount;
  });

  // Get all resource IDs from RESOURCES config (includes raw, intermediate, food, and final products)
  const allResourceIds = Object.keys(RESOURCES) as ResourceId[];
  // Also include the 4 food types that might not be in RESOURCES
  const allFoodIds: string[] = ['berries', 'cactus_juice', 'smoked_fish', 'greenhouse_veggies'];

  // Combine all resources and foods, removing duplicates
  const allRequiredResources = new Set([...allResourceIds, ...allFoodIds]);

  // Check if ALL resources have 1000+
  const hasSelfSufficient = allRequiredResources.size > 0 &&
    [...allRequiredResources].every(r => (allResourceAmounts[r] || 0) >= 1000);
  check('self_sufficient', hasSelfSufficient);

  // === AUTOMATION ACHIEVEMENTS ===
  // Count automations directly from current state (not lifetimeStats which may be stale)
  let currentAutomationCount = 0;
  let maxAutomationLevel = 0;
  let automationsAtLevel100 = 0;
  let totalUpgradesFromState = 0;
  Object.values(state.biomes).forEach(biome => {
    biome.automations.forEach(a => {
      currentAutomationCount++;
      totalUpgradesFromState += Math.max(0, a.level - 1);
      if (a.level > maxAutomationLevel) {
        maxAutomationLevel = a.level;
      }
      if (a.level >= 100) {
        automationsAtLevel100++;
      }
    });
  });

  // Use the higher of lifetimeStats or current count (for retroactive achievements)
  const totalAutomations = Math.max(stats.totalAutomationsBuilt || 0, currentAutomationCount);
  const totalUpgrades = Math.max(stats.totalUpgradesPurchased || 0, totalUpgradesFromState);

  check('first_automation', totalAutomations >= 1);
  check('automation_5', totalAutomations >= 5);
  check('automation_10', totalAutomations >= 10);
  check('automation_25', totalAutomations >= 25);
  check('automation_50', totalAutomations >= 50);
  check('all_automations', totalAutomations >= 59);

  // First production - check if any automation exists and has produced
  const hasProduced = (stats.totalResourcesGathered || 0) > 0 && currentAutomationCount > 0;
  check('first_production', hasProduced);

  // Upgrades - check first upgrade
  check('first_upgrade', totalUpgrades >= 1);

  check('single_upgrade_50', maxAutomationLevel >= 50);
  check('single_upgrade_100', maxAutomationLevel >= 100);
  check('single_upgrade_200', maxAutomationLevel >= 200);

  // All automations at level 100+ (need all 59 automations built and at level 100+)
  check('all_automations_100', currentAutomationCount >= 59 && automationsAtLevel100 >= 59);

  // Biome specialist - 10+ automations in single biome
  const hasBiomeWith10 = Object.values(state.biomes).some(b => b.automations.length >= 10);
  check('biome_specialist', hasBiomeWith10);

  // === POWER CELL ACHIEVEMENTS ===
  const installedCells: { green: number; blue: number; orange: number } = { green: 0, blue: 0, orange: 0 };
  let totalInstalledCells = 0;
  Object.values(state.biomes).forEach(biome => {
    biome.automations.forEach(a => {
      if (a.powerCell) {
        totalInstalledCells++;
        installedCells[a.powerCell.tier]++;
      }
    });
  });

  check('power_cell_installed', totalInstalledCells >= 1);
  check('green_energy_5', installedCells.green >= 1);
  check('blue_power', installedCells.blue >= 1);
  check('orange_surge', installedCells.orange >= 1);
  check('power_cells_10', totalInstalledCells >= 10);
  check('power_cells_20', totalInstalledCells >= 20);
  check('maximum_power', totalInstalledCells >= 59);

  // === EXPEDITION ACHIEVEMENTS ===
  // Use max of lifetimeStats or expeditionCount for retroactive achievements
  const totalExpeditions = Math.max(
    stats.totalExpeditionsCompleted || 0,
    state.expeditionCount || 0
  );
  check('first_expedition', totalExpeditions >= 1);
  check('expedition_10', totalExpeditions >= 10);
  check('expedition_50', totalExpeditions >= 50);
  check('expedition_100', totalExpeditions >= 100);
  check('expedition_500', totalExpeditions >= 500);

  const expByTier = stats.expeditionsByTier || {};
  check('swift_forage_25', (expByTier.quick_dash || 0) >= 25);
  check('quick_scout_25', (expByTier.quick_scout || 0) >= 25);
  check('standard_expedition_25', (expByTier.standard_expedition || 0) >= 25);
  check('deep_exploration_10', (expByTier.deep_exploration || 0) >= 25);
  check('epic_journey_5', (expByTier.epic_journey || 0) >= 25);

  // === BIOME ACHIEVEMENTS ===
  const discoveredBiomes = Object.values(state.biomes).filter(b => b.discovered);
  check('world_domination', discoveredBiomes.length >= 6);

  // Biome resource discovery achievements - check if all resources (including food) are discovered in each biome
  // Each biome has: primaryResources + discoverableResources + any foods produced there
  // Foods by biome: Forest=berries, Lake=smoked_fish, Desert=cactus_juice, Tundra=greenhouse_veggies

  // Helper to check if all biome resources are discovered
  const checkBiomeResources = (biomeId: BiomeId, foodResource?: string): boolean => {
    const biome = BIOMES[biomeId];
    const biomeState = state.biomes[biomeId];
    if (!biome || !biomeState) return false;

    const allBiomeResources: string[] = [
      ...(biome.primaryResources || []),
      ...(biome.discoverableResources || []),
    ];
    if (foodResource) {
      allBiomeResources.push(foodResource);
    }

    const discovered = biomeState.discoveredResources || [];
    const producedDiscovered = state.discoveredProducedResources || [];
    const foodsDiscovered = state.discoveredProducedFoods || [];
    const allDiscovered = new Set<string>([...discovered, ...producedDiscovered, ...foodsDiscovered]);

    return allBiomeResources.every(r => allDiscovered.has(r));
  };

  // Lush Forest: wood, stone, berries, rubber_sap, nitrogen_nodules + berries (food)
  check('forest_resources', checkBiomeResources('lush_forest', 'berries'));
  // Misty Lake: fresh_water, fish, clay + smoked_fish (food)
  check('lake_resources', checkBiomeResources('misty_lake', 'smoked_fish'));
  // Arid Desert: quartz_sand, cactus, crude_oil, sulfur + cactus_juice (food)
  check('desert_resources', checkBiomeResources('arid_desert', 'cactus_juice'));
  // Frozen Tundra: ice, iron_ore, rutile_ore, arctic_moss + greenhouse_veggies (food)
  check('tundra_resources', checkBiomeResources('frozen_tundra', 'greenhouse_veggies'));
  // Volcanic Isle: obsidian, geothermal_energy, nickel_cobalt_ore, sulfur (no unique food)
  check('volcano_resources', checkBiomeResources('volcanic_isle'));
  // Crystal Caverns: lithium_crystals, copper_ore, phosphorus, quartz_crystals (no unique food)
  check('caverns_resources', checkBiomeResources('crystal_caverns'));

  // === CRASH/PRESTIGE ACHIEVEMENTS (only check if player has prestiged at least once) ===
  if (state.prestige.totalPrestiges >= 1) {
    check('first_crash', state.prestige.totalPrestiges >= 1);
    check('crash_3', state.prestige.totalPrestiges >= 3);
    check('crash_5', state.prestige.totalPrestiges >= 5);
    check('crash_10', state.prestige.totalPrestiges >= 10);
    check('crash_25', state.prestige.totalPrestiges >= 25);
    check('cosmic_bamboo_10', state.prestige.cosmicBambooShards >= 10);
    check('cosmic_bamboo_50', state.prestige.cosmicBambooShards >= 50);
    check('cosmic_bamboo_100', state.prestige.cosmicBambooShards >= 100);
  }

  // === SKILL ACHIEVEMENTS ===
  const skills = state.prestige.unlockedSkills || [];
  check('first_skill', skills.length >= 1);

  const productionBranch = ['prod_1', 'prod_2', 'prod_3', 'prod_4'];
  const economyBranch = ['econ_1', 'econ_2', 'econ_3', 'econ_4'];
  const expeditionBranch = ['exp_1', 'exp_2', 'exp_3', 'exp_4'];
  const powerCellsBranch = ['cell_1', 'cell_2', 'cell_3', 'cell_4'];

  check('production_branch', productionBranch.every(s => skills.includes(s as any)));
  check('economy_branch', economyBranch.every(s => skills.includes(s as any)));
  check('expedition_branch', expeditionBranch.every(s => skills.includes(s as any)));
  check('power_cells_branch', powerCellsBranch.every(s => skills.includes(s as any)));
  check('all_skills', skills.length >= 16);

  // === MILESTONE ACHIEVEMENTS ===
  // Check spaceship progress - parts are: microchips, rocket_fuel, thrusters, oxygen_tanks, batteries, solar_arrays, titanium_hull
  const spaceshipParts: ResourceId[] = ['microchips', 'rocket_fuel', 'thrusters', 'oxygen_tanks', 'batteries', 'solar_arrays', 'titanium_hull'];
  const REQUIRED_AMOUNT = 100;

  // Count completed parts
  let completedParts = 0;
  spaceshipParts.forEach(partId => {
    let totalAmount = 0;
    Object.values(state.biomes).forEach(biome => {
      totalAmount += biome.resources[partId] || 0;
    });
    if (Math.floor(totalAmount) >= REQUIRED_AMOUNT) {
      completedParts++;
    }
  });

  check('spaceship_started', completedParts >= 1);
  check('spaceship_halfway', completedParts >= 4); // 4 of 7 = ~57%
  check('spaceship_complete', completedParts >= 7);

  // === SECRET ACHIEVEMENTS ===
  // Night Owl - play between midnight and 4 AM
  const currentHour = new Date().getHours();
  check('night_owl', currentHour >= 0 && currentHour < 4);

  // Hoarder Deluxe - have 100T+ of any single resource (100 trillion)
  let hasHoarderResource = false;
  Object.values(state.biomes).forEach(biome => {
    Object.values(biome.resources).forEach(amount => {
      if (amount >= 100_000_000_000_000) {
        hasHoarderResource = true;
      }
    });
  });
  check('hoarder_deluxe', hasHoarderResource);

  // Clicker Champion - 1000 clicks in a single session
  const sessionClicks = state.sessionStats?.clickCount || 0;
  check('clicker_champion', sessionClicks >= 1000);

  // Patient Panda - 5 minutes without clicking
  const lastClickTime = state.sessionStats?.lastClickTime || Date.now();
  const timeSinceLastClick = Date.now() - lastClickTime;
  const fiveMinutesMs = 5 * 60 * 1000;
  check('patient_panda', timeSinceLastClick >= fiveMinutesMs);

  // Speed Demon - 6 automations within 5 minutes of starting
  const sessionStartTime = state.sessionStats?.sessionStartTime || Date.now();
  const timeSinceSessionStart = Date.now() - sessionStartTime;
  const fiveMinutesFromStart = 5 * 60 * 1000;
  check('speed_demon', currentAutomationCount >= 6 && timeSinceSessionStart <= fiveMinutesFromStart);

  // Bamboo Addict - Spend over 50 Cosmic Bamboo Shards on skills (skills cost varies, but estimate spending)
  // Total shards ever earned = current shards + shards spent on skills
  // Each skill tier costs: tier1=1, tier2=2, tier3=3, tier4=5 (approximately)
  // We can estimate by counting unlocked skills
  const skillCostEstimate = skills.length * 2; // Rough estimate
  check('bamboo_addict', skillCostEstimate >= 50);

  // Perfectionist - All 59 automations with orange power cells
  check('perfectionist', installedCells.orange >= 59);

  // Completionist - Unlock all other achievements (total - 1 for completionist itself)
  const totalAchievementCount = Object.keys(ACHIEVEMENTS).length;
  // Don't count completionist itself
  check('completionist', unlocked.length >= totalAchievementCount - 1);

  return newAchievements;
}

// Helper to check if all achievements are unlocked (for mastery bonus)
export function hasAllAchievements(unlockedAchievements: AchievementId[]): boolean {
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;
  return unlockedAchievements.length >= totalAchievements;
}

// Get mastery bonus (200% production, 50% cost reduction when all achievements unlocked)
export function getMasteryBonus(unlockedAchievements: AchievementId[]): { productionBonus: number; costReduction: number } {
  if (hasAllAchievements(unlockedAchievements)) {
    return { productionBonus: 2.0, costReduction: 0.5 }; // 200% bonus production, 50% cost reduction
  }
  return { productionBonus: 0, costReduction: 0 };
}

// Category display info
export const ACHIEVEMENT_CATEGORIES: Record<AchievementCategory, { name: string; icon: string }> = {
  gathering: { name: 'Gathering', icon: '📦' },
  automation: { name: 'Automation', icon: '⚙️' },
  power_cells: { name: 'Power Cells', icon: '🔋' },
  expedition: { name: 'Expedition', icon: '🗺️' },
  biomes: { name: 'Biomes', icon: '🌍' },
  crashes: { name: 'Crashes', icon: '💥' },
  skills: { name: 'Skills', icon: '🧠' },
  milestones: { name: 'Milestones', icon: '🏆' },
  secret: { name: 'Secret', icon: '🔮' },
};
