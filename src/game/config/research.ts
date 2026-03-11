import { ResearchId, ResearchNode, ResearchState } from '../../types/game.types';

export const RESEARCH_NODES: Record<ResearchId, ResearchNode> = {
  efficient_gathering: {
    id: 'efficient_gathering',
    name: 'Efficient Gathering',
    description: '+5% gather yield per click per level',
    flavorText: '"Turns out there\'s a technique to picking things up. Who knew?" — Dr. Redd',
    icon: '🤲',
    maxLevel: 10,
    baseCost: 15,
    costMultiplier: 1.8,
    bonusPerLevel: 0.05,
    bonusType: 'gather',
  },
  overclocked_machines: {
    id: 'overclocked_machines',
    name: 'Overclocked Machines',
    description: '+3% automation production speed per level',
    flavorText: '"If we push these machines harder, they\'ll either go faster or explode. Win-win for science!" — Dr. Redd',
    icon: '⚡',
    maxLevel: 15,
    baseCost: 20,
    costMultiplier: 1.7,
    bonusPerLevel: 0.03,
    bonusType: 'production',
  },
  bulk_purchasing: {
    id: 'bulk_purchasing',
    name: 'Bulk Purchasing',
    description: '-4% build costs per level',
    flavorText: '"I negotiated with the planet. It said no, but I took the discount anyway." — Dr. Redd',
    icon: '🏗️',
    maxLevel: 10,
    baseCost: 25,
    costMultiplier: 1.9,
    bonusPerLevel: 0.04,
    bonusType: 'build_cost',
  },
  smart_upgrades: {
    id: 'smart_upgrades',
    name: 'Smart Upgrades',
    description: '-4% upgrade costs per level',
    flavorText: '"Why replace the whole thing when you can just hit it with a wrench?" — Dr. Redd',
    icon: '🔧',
    maxLevel: 10,
    baseCost: 25,
    costMultiplier: 1.9,
    bonusPerLevel: 0.04,
    bonusType: 'upgrade_cost',
  },
  expedition_logistics: {
    id: 'expedition_logistics',
    name: 'Expedition Logistics',
    description: '-5% expedition food cost per level',
    flavorText: '"Pack lighter. Walk faster. Eat less. Science." — Dr. Redd\'s expedition manual',
    icon: '🎒',
    maxLevel: 8,
    baseCost: 30,
    costMultiplier: 2.0,
    bonusPerLevel: 0.05,
    bonusType: 'expedition_food',
  },
  scout_training: {
    id: 'scout_training',
    name: 'Scout Training',
    description: '-5% expedition duration per level',
    flavorText: '"Left foot, right foot, repeat. It\'s not complicated, just... fast." — Dr. Redd',
    icon: '🏃',
    maxLevel: 8,
    baseCost: 30,
    costMultiplier: 2.0,
    bonusPerLevel: 0.05,
    bonusType: 'expedition_time',
  },
  resource_radar: {
    id: 'resource_radar',
    name: 'Resource Radar',
    description: '+5% expedition resource rewards per level',
    flavorText: '"It beeps when there\'s stuff nearby. Very scientific." — Dr. Redd',
    icon: '📡',
    maxLevel: 10,
    baseCost: 25,
    costMultiplier: 1.8,
    bonusPerLevel: 0.05,
    bonusType: 'expedition_resource',
  },
  food_preservation: {
    id: 'food_preservation',
    name: 'Food Preservation',
    description: '-5% food waste on expeditions per level',
    flavorText: '"Turns out berries last longer if you don\'t sit on them." — Dr. Redd',
    icon: '🧊',
    maxLevel: 6,
    baseCost: 20,
    costMultiplier: 2.0,
    bonusPerLevel: 0.05,
    bonusType: 'food_waste',
  },
  power_cell_tuning: {
    id: 'power_cell_tuning',
    name: 'Power Cell Tuning',
    description: '+5% power cell effectiveness per level',
    flavorText: '"A little tweak here, a little spark there, and... is that smoke normal?" — Dr. Redd',
    icon: '🔋',
    maxLevel: 8,
    baseCost: 35,
    costMultiplier: 2.0,
    bonusPerLevel: 0.05,
    bonusType: 'power_cell',
  },
  alien_metallurgy: {
    id: 'alien_metallurgy',
    name: 'Alien Metallurgy',
    description: '+4% spaceship part production per level',
    flavorText: '"These alien alloys are incredible. They taste terrible though." — Dr. Redd',
    icon: '🛸',
    maxLevel: 10,
    baseCost: 40,
    costMultiplier: 2.0,
    bonusPerLevel: 0.04,
    bonusType: 'spaceship',
  },
};

export const INITIAL_RESEARCH_STATE: ResearchState = {
  levels: {},
};

/**
 * Get the cost to upgrade a research node to the next level.
 * Returns null if already at max level.
 */
export function getResearchCost(researchId: ResearchId, currentLevel: number): number | null {
  const node = RESEARCH_NODES[researchId];
  if (currentLevel >= node.maxLevel) return null;
  return Math.ceil(node.baseCost * Math.pow(node.costMultiplier, currentLevel));
}

/**
 * Get the total bonus from a research node at its current level.
 * Similar to getSkillTreeBonus but for research.
 */
export function getResearchBonus(
  levels: Partial<Record<ResearchId, number>>,
  bonusType: ResearchNode['bonusType']
): number {
  let total = 0;
  for (const [id, level] of Object.entries(levels)) {
    const node = RESEARCH_NODES[id as ResearchId];
    if (node && node.bonusType === bonusType && level && level > 0) {
      total += node.bonusPerLevel * level;
    }
  }
  return total;
}
