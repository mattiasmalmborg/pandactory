import { describe, it, expect } from 'vitest';
import {
  calculateProductionRate,
  calculateLevelUpCost,
  canAfford,
  deductResources,
  applyCostReduction,
  calculateExpeditionBonus,
} from '../calculations';
import { ResourceCost, AchievementId } from '../../types/game.types';

describe('calculateProductionRate', () => {
  it('returns baseRate at level 0 with no bonuses', () => {
    const rate = calculateProductionRate(1, 0);
    // 1 * (1.25^0) * 1 * 1 = 1
    expect(rate).toBeCloseTo(1);
  });

  it('applies level scaling correctly', () => {
    const rate = calculateProductionRate(1, 1);
    // 1 * 1.25 * 1 * 1 = 1.25
    expect(rate).toBeCloseTo(1.25);
  });

  it('applies exponential level scaling at level 5', () => {
    const rate = calculateProductionRate(1, 5);
    // 1 * (1.25^5) = 3.0517578125
    expect(rate).toBeCloseTo(Math.pow(1.25, 5));
  });

  it('applies exponential level scaling at level 10', () => {
    const rate = calculateProductionRate(1, 10);
    // 1 * (1.25^10) = 9.3132...
    expect(rate).toBeCloseTo(Math.pow(1.25, 10));
  });

  it('scales with baseRate', () => {
    const rate = calculateProductionRate(2, 3);
    // 2 * (1.25^3) = 2 * 1.953125 = 3.90625
    expect(rate).toBeCloseTo(2 * Math.pow(1.25, 3));
  });

  it('applies skill bonus additively', () => {
    const rate = calculateProductionRate(1, 0, 0.10);
    // 1 * 1 * 1.10 * 1 = 1.10
    expect(rate).toBeCloseTo(1.10);
  });

  it('applies power cell bonus additively', () => {
    const rate = calculateProductionRate(1, 0, 0, 0.50);
    // 1 * 1 * 1 * 1.50 = 1.50
    expect(rate).toBeCloseTo(1.50);
  });

  it('combines all bonuses correctly', () => {
    const rate = calculateProductionRate(2, 3, 0.10, 0.50);
    // 2 * (1.25^3) * (1 + 0.10) * (1 + 0.50)
    // 2 * 1.953125 * 1.10 * 1.50 = 6.44531...
    const expected = 2 * Math.pow(1.25, 3) * 1.10 * 1.50;
    expect(rate).toBeCloseTo(expected);
  });

  it('handles zero baseRate', () => {
    const rate = calculateProductionRate(0, 5, 0.10, 0.50);
    expect(rate).toBeCloseTo(0);
  });

  it('handles large level values', () => {
    const rate = calculateProductionRate(1, 50);
    expect(rate).toBeCloseTo(Math.pow(1.25, 50));
  });
});

describe('calculateLevelUpCost', () => {
  it('returns base cost at level 0', () => {
    const baseCost: ResourceCost[] = [{ resourceId: 'wood', amount: 10 }];
    const result = calculateLevelUpCost(baseCost, 0, 1.15);
    // 10 * (1.15^0) = 10
    expect(result).toEqual([{ resourceId: 'wood', amount: 10 }]);
  });

  it('applies multiplier at level 1', () => {
    const baseCost: ResourceCost[] = [{ resourceId: 'wood', amount: 10 }];
    const result = calculateLevelUpCost(baseCost, 1, 1.15);
    // 10 * 1.15 = 11.5 -> ceil = 12
    expect(result[0].amount).toBe(Math.ceil(10 * 1.15));
  });

  it('scales exponentially with level', () => {
    const baseCost: ResourceCost[] = [{ resourceId: 'wood', amount: 10 }];
    const result = calculateLevelUpCost(baseCost, 5, 1.15);
    // 10 * (1.15^5) = ceil(20.113...) = 21
    expect(result[0].amount).toBe(Math.ceil(10 * Math.pow(1.15, 5)));
  });

  it('handles multiple resource costs', () => {
    const baseCost: ResourceCost[] = [
      { resourceId: 'wood', amount: 5 },
      { resourceId: 'stone', amount: 3 },
    ];
    const result = calculateLevelUpCost(baseCost, 2, 1.25);
    expect(result[0].resourceId).toBe('wood');
    expect(result[0].amount).toBe(Math.ceil(5 * Math.pow(1.25, 2)));
    expect(result[1].resourceId).toBe('stone');
    expect(result[1].amount).toBe(Math.ceil(3 * Math.pow(1.25, 2)));
  });

  it('uses different multipliers correctly', () => {
    const baseCost: ResourceCost[] = [{ resourceId: 'wood', amount: 10 }];

    const result115 = calculateLevelUpCost(baseCost, 3, 1.15);
    const result135 = calculateLevelUpCost(baseCost, 3, 1.35);

    expect(result115[0].amount).toBe(Math.ceil(10 * Math.pow(1.15, 3)));
    expect(result135[0].amount).toBe(Math.ceil(10 * Math.pow(1.35, 3)));
    // Higher multiplier should cost more
    expect(result135[0].amount).toBeGreaterThan(result115[0].amount);
  });

  it('always rounds up with Math.ceil', () => {
    const baseCost: ResourceCost[] = [{ resourceId: 'wood', amount: 7 }];
    const result = calculateLevelUpCost(baseCost, 1, 1.15);
    // 7 * 1.15 = 8.05 -> ceil = 9
    expect(result[0].amount).toBe(Math.ceil(7 * 1.15));
    expect(result[0].amount).toBe(9);
  });
});

describe('canAfford', () => {
  it('returns true when resources are sufficient', () => {
    const resources = { wood: 100, stone: 50 };
    const costs: ResourceCost[] = [
      { resourceId: 'wood', amount: 10 },
      { resourceId: 'stone', amount: 5 },
    ];
    expect(canAfford(resources, costs)).toBe(true);
  });

  it('returns true when resources exactly match costs', () => {
    const resources = { wood: 10, stone: 5 };
    const costs: ResourceCost[] = [
      { resourceId: 'wood', amount: 10 },
      { resourceId: 'stone', amount: 5 },
    ];
    expect(canAfford(resources, costs)).toBe(true);
  });

  it('returns false when one resource is insufficient', () => {
    const resources = { wood: 100, stone: 2 };
    const costs: ResourceCost[] = [
      { resourceId: 'wood', amount: 10 },
      { resourceId: 'stone', amount: 5 },
    ];
    expect(canAfford(resources, costs)).toBe(false);
  });

  it('returns false when a required resource is missing', () => {
    const resources = { wood: 100 };
    const costs: ResourceCost[] = [
      { resourceId: 'wood', amount: 10 },
      { resourceId: 'stone', amount: 5 },
    ];
    expect(canAfford(resources, costs)).toBe(false);
  });

  it('returns true with empty costs', () => {
    const resources = { wood: 100 };
    expect(canAfford(resources, [])).toBe(true);
  });

  it('returns false when resource is zero and cost is positive', () => {
    const resources = { wood: 0 };
    const costs: ResourceCost[] = [{ resourceId: 'wood', amount: 1 }];
    expect(canAfford(resources, costs)).toBe(false);
  });
});

describe('deductResources', () => {
  it('subtracts costs from resources', () => {
    const resources = { wood: 100, stone: 50 };
    const costs: ResourceCost[] = [
      { resourceId: 'wood', amount: 10 },
      { resourceId: 'stone', amount: 5 },
    ];
    const result = deductResources(resources, costs);
    expect(result.wood).toBe(90);
    expect(result.stone).toBe(45);
  });

  it('does not mutate the original resources', () => {
    const resources = { wood: 100 };
    const costs: ResourceCost[] = [{ resourceId: 'wood', amount: 10 }];
    const result = deductResources(resources, costs);
    expect(resources.wood).toBe(100);
    expect(result.wood).toBe(90);
  });

  it('handles deducting from a missing resource (treats as 0)', () => {
    const resources: Record<string, number> = {};
    const costs: ResourceCost[] = [{ resourceId: 'wood', amount: 10 }];
    const result = deductResources(resources, costs);
    expect(result.wood).toBe(-10);
  });

  it('handles empty costs', () => {
    const resources = { wood: 100, stone: 50 };
    const result = deductResources(resources, []);
    expect(result).toEqual({ wood: 100, stone: 50 });
  });
});

describe('applyCostReduction', () => {
  it('returns original costs when no achievements are unlocked', () => {
    const costs: ResourceCost[] = [
      { resourceId: 'wood', amount: 100 },
      { resourceId: 'stone', amount: 50 },
    ];
    const result = applyCostReduction(costs, []);
    expect(result[0].amount).toBe(100);
    expect(result[1].amount).toBe(50);
  });

  it('returns original costs with partial achievements', () => {
    const costs: ResourceCost[] = [
      { resourceId: 'wood', amount: 100 },
    ];
    const partialAchievements: AchievementId[] = ['first_gather', 'first_automation'];
    const result = applyCostReduction(costs, partialAchievements);
    expect(result[0].amount).toBe(100);
  });
});

describe('calculateExpeditionBonus', () => {
  it('returns 0 for short incomplete expedition', () => {
    const bonus = calculateExpeditionBonus(10, false);
    expect(bonus).toBe(0);
  });

  it('gives 5% per 30 minutes', () => {
    const bonus = calculateExpeditionBonus(30, false);
    expect(bonus).toBe(5);
  });

  it('gives 10% for 60 minutes (2 half-hours)', () => {
    const bonus = calculateExpeditionBonus(60, false);
    expect(bonus).toBe(10);
  });

  it('floors partial 30 minute blocks', () => {
    const bonus = calculateExpeditionBonus(45, false);
    // floor(45/30) = 1 -> 5%
    expect(bonus).toBe(5);
  });

  it('adds 20% completion bonus', () => {
    const bonus = calculateExpeditionBonus(30, true);
    // 5% (30 min) + 20% (completion) = 25%
    expect(bonus).toBe(25);
  });

  it('combines duration and completion bonus', () => {
    const bonus = calculateExpeditionBonus(120, true);
    // floor(120/30) = 4 -> 20% + 20% completion = 40%
    expect(bonus).toBe(40);
  });

  it('returns only completion bonus for 0 duration', () => {
    const bonus = calculateExpeditionBonus(0, true);
    expect(bonus).toBe(20);
  });
});
