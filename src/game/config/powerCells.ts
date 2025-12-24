import { PowerCellTier, PowerCell } from '../../types/game.types';

export interface PowerCellDefinition {
  tier: PowerCellTier;
  name: string;
  description: string;
  bonus: number; // Additive bonus (0.50 = +50%, 1.00 = +100%, 1.50 = +150%)
  rarity: 'uncommon' | 'rare' | 'legendary';
  dropWeight: number; // For weighted random selection
  flavorText: string;
  icon: string;
}

export const POWER_CELLS: Record<PowerCellTier, PowerCellDefinition> = {
  green: {
    tier: 'green',
    name: 'Power Cell (Green)',
    description: 'A slightly warm battery that somehow makes machines go faster. Don\'t ask how. Physics left the chat.',
    bonus: 0.50, // +50%
    rarity: 'uncommon',
    dropWeight: 70,
    flavorText: 'Instructions say "Do not lick." Now I\'m curious.',
    icon: '🟢',
  },

  blue: {
    tier: 'blue',
    name: 'Power Cell (Blue)',
    description: 'This one glows ominously. The ominousness is a feature, not a bug.',
    bonus: 1.00, // +100%
    rarity: 'rare',
    dropWeight: 25,
    flavorText: 'Warning: May cause machines to develop a sense of superiority.',
    icon: '🔵',
  },

  orange: {
    tier: 'orange',
    name: 'Power Cell (Orange)',
    description: 'Scientists theorize this was made by an ancient civilization. Scientists are often wrong, but it sounds cool.',
    bonus: 1.50, // +150%
    rarity: 'legendary',
    dropWeight: 5,
    flavorText: 'It whispers secrets of the universe. Mostly about increasing throughput.',
    icon: '🟠',
  },
};

export function createPowerCell(tier: PowerCellTier): PowerCell {
  const definition = POWER_CELLS[tier];
  return {
    tier,
    bonus: definition.bonus,
  };
}

export function rollPowerCell(): PowerCell | null {
  const totalWeight = Object.values(POWER_CELLS).reduce((sum, cell) => sum + cell.dropWeight, 0);
  const roll = Math.random() * totalWeight;

  let currentWeight = 0;
  for (const cell of Object.values(POWER_CELLS)) {
    currentWeight += cell.dropWeight;
    if (roll <= currentWeight) {
      return createPowerCell(cell.tier);
    }
  }

  return null; // Should never happen
}
