import { SkillId, SkillNode } from '../../types/game.types';

export const SKILL_TREE: Record<SkillId, SkillNode> = {
  // Production Branch
  prod_1: {
    id: 'prod_1',
    name: 'Nimble Paws',
    description: 'Your paws remember the motions. +5% base production speed.',
    cost: 1,
    branch: 'production',
    tier: 1,
    requires: [],
    effect: { type: 'production_speed', value: 0.05 },
  },
  prod_2: {
    id: 'prod_2',
    name: 'Muscle Memory',
    description: "You've done this before. Literally. +10% base production speed.",
    cost: 2,
    branch: 'production',
    tier: 2,
    requires: ['prod_1'],
    effect: { type: 'production_speed', value: 0.10 },
  },
  prod_3: {
    id: 'prod_3',
    name: 'Factory Savant',
    description: "At this point, you could build a smelter blindfolded. Please don't. +15% base production speed.",
    cost: 3,
    branch: 'production',
    tier: 3,
    requires: ['prod_2'],
    effect: { type: 'production_speed', value: 0.15 },
  },
  prod_4: {
    id: 'prod_4',
    name: 'Time Lord (Sort Of)',
    description: "You've optimized so hard, time itself is impressed. +20% base production speed.",
    cost: 5,
    branch: 'production',
    tier: 4,
    requires: ['prod_3'],
    effect: { type: 'production_speed', value: 0.20 },
  },

  // Economy Branch
  econ_1: {
    id: 'econ_1',
    name: 'Shrewd Negotiator',
    description: 'Negotiate with whom? The rocks? Yes. -5% building costs.',
    cost: 1,
    branch: 'economy',
    tier: 1,
    requires: [],
    effect: { type: 'build_cost_reduction', value: 0.05 },
  },
  econ_2: {
    id: 'econ_2',
    name: 'Bulk Buyer',
    description: 'You know a guy. The guy is also you. From a previous timeline. -10% upgrade costs.',
    cost: 2,
    branch: 'economy',
    tier: 2,
    requires: ['econ_1'],
    effect: { type: 'upgrade_cost_reduction', value: 0.10 },
  },
  econ_3: {
    id: 'econ_3',
    name: 'Cosmic Coupons',
    description: "You've collected coupons across multiple crash landings. -15% all costs.",
    cost: 3,
    branch: 'economy',
    tier: 3,
    requires: ['econ_2'],
    effect: { type: 'all_cost_reduction', value: 0.15 },
  },
  econ_4: {
    id: 'econ_4',
    name: 'Infinite Discount',
    description: 'The universe owes you at this point. -20% all costs.',
    cost: 5,
    branch: 'economy',
    tier: 4,
    requires: ['econ_3'],
    effect: { type: 'all_cost_reduction', value: 0.20 },
  },

  // Expedition Branch
  exp_1: {
    id: 'exp_1',
    name: 'Restless Paws',
    description: "You've walked these paths before. In your dreams. Nightmares, technically. -15% expedition time.",
    cost: 1,
    branch: 'expedition',
    tier: 1,
    requires: [],
    effect: { type: 'expedition_time_reduction', value: 0.15 },
  },
  exp_2: {
    id: 'exp_2',
    name: 'Light Packer',
    description: "You've learned to pack efficiently. -20% expedition food cost.",
    cost: 2,
    branch: 'expedition',
    tier: 2,
    requires: ['exp_1'],
    effect: { type: 'expedition_food_reduction', value: 0.20 },
  },
  exp_3: {
    id: 'exp_3',
    name: 'Lucky Snout',
    description: 'Your nose knows. +25% resource find on expeditions.',
    cost: 3,
    branch: 'expedition',
    tier: 3,
    requires: ['exp_2'],
    effect: { type: 'expedition_resource_bonus', value: 0.25 },
  },
  exp_4: {
    id: 'exp_4',
    name: 'Déjà Vu Explorer',
    description: 'You remember where everything is. Spooky. First biome discovered instantly on new game.',
    cost: 5,
    branch: 'expedition',
    tier: 4,
    requires: ['exp_3'],
    effect: { type: 'instant_first_biome', value: true },
  },

  // Power Cells Branch
  cell_1: {
    id: 'cell_1',
    name: 'Gentle Touch',
    description: "You've learned to handle Power Cells without them exploding. Usually. +10% Power Cell effectiveness.",
    cost: 1,
    branch: 'power_cells',
    tier: 1,
    requires: [],
    effect: { type: 'power_cell_effectiveness', value: 0.10 },
  },
  cell_2: {
    id: 'cell_2',
    name: 'Cell Resonance',
    description: 'Power Cells hum together in harmony. Each installed cell boosts ALL cell bonuses by +3%.',
    cost: 2,
    branch: 'power_cells',
    tier: 2,
    requires: ['cell_1'],
    effect: { type: 'power_cell_resonance', value: 0.03 },
  },
  cell_3: {
    id: 'cell_3',
    name: 'Power Cell Magnet',
    description: 'Power Cells are drawn to your overwhelming cuteness. +50% Power Cell drop rate.',
    cost: 3,
    branch: 'power_cells',
    tier: 3,
    requires: ['cell_2'],
    effect: { type: 'power_cell_drop_bonus', value: 0.50 },
  },
  cell_4: {
    id: 'cell_4',
    name: 'Overcharge Protocol',
    description: 'Push the cells beyond their limits. +25% Power Cell effectiveness. Void warranty.',
    cost: 5,
    branch: 'power_cells',
    tier: 4,
    requires: ['cell_3'],
    effect: { type: 'power_cell_effectiveness', value: 0.25 },
  },
};

export function getSkillTreeBonus(
  unlockedSkills: SkillId[],
  effectType: SkillNode['effect']['type']
): number {
  let total = 0;

  for (const skillId of unlockedSkills) {
    const skill = SKILL_TREE[skillId];
    if (skill.effect.type === effectType && typeof skill.effect.value === 'number') {
      total += skill.effect.value;
    }
  }

  return total;
}

export function hasSkillEffect(
  unlockedSkills: SkillId[],
  effectType: SkillNode['effect']['type']
): boolean {
  for (const skillId of unlockedSkills) {
    const skill = SKILL_TREE[skillId];
    if (skill.effect.type === effectType) {
      return skill.effect.value === true || (typeof skill.effect.value === 'number' && skill.effect.value > 0);
    }
  }
  return false;
}

export function canUnlockSkill(skillId: SkillId, unlockedSkills: SkillId[]): boolean {
  const skill = SKILL_TREE[skillId];

  // Check if already unlocked
  if (unlockedSkills.includes(skillId)) {
    return false;
  }

  // Check if all requirements are met
  for (const requiredSkillId of skill.requires) {
    if (!unlockedSkills.includes(requiredSkillId)) {
      return false;
    }
  }

  return true;
}

/**
 * Count the total number of installed power cells across all biomes
 */
export function countInstalledPowerCells(biomes: Record<string, { automations: Array<{ powerCell?: { bonus: number } | null }> }>): number {
  let count = 0;
  Object.values(biomes).forEach(biome => {
    biome.automations.forEach(automation => {
      if (automation.powerCell && automation.powerCell.bonus > 0) {
        count++;
      }
    });
  });
  return count;
}

/**
 * Calculate the effective power cell bonus including resonance
 * Resonance: Each installed cell boosts ALL cell bonuses by +X%
 */
export function getEffectivePowerCellBonus(
  basePowerCellBonus: number,
  totalInstalledCells: number,
  unlockedSkills: SkillId[]
): number {
  if (basePowerCellBonus <= 0) return 0;

  // Get base effectiveness bonus (+10% from Gentle Touch, +25% from Overcharge)
  const effectivenessBonus = getSkillTreeBonus(unlockedSkills, 'power_cell_effectiveness');

  // Get resonance bonus per cell
  const resonancePerCell = getSkillTreeBonus(unlockedSkills, 'power_cell_resonance');

  // Apply effectiveness first: base * (1 + effectiveness%)
  let effectiveBonus = basePowerCellBonus * (1 + effectivenessBonus);

  // Apply resonance: effective * (1 + (resonancePerCell * totalCells))
  if (resonancePerCell > 0 && totalInstalledCells > 0) {
    const resonanceMultiplier = 1 + (resonancePerCell * totalInstalledCells);
    effectiveBonus *= resonanceMultiplier;
  }

  return effectiveBonus;
}
