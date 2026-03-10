import { describe, it, expect } from 'vitest';
import { calculateBiomeProductionRates, getAutomationEfficiency } from '../allocation';
import { BiomeState, Automation, ResourceId } from '../../types/game.types';

function makeAutomation(overrides: Partial<Automation> = {}): Automation {
  return {
    id: 'test-auto-1',
    type: 'logger',
    level: 0,
    biomeId: 'lush_forest',
    powerCell: null,
    baseProductionRate: 1,
    upgradeSlots: 5,
    ...overrides,
  };
}

function makeBiome(automations: Automation[] = []): BiomeState {
  return {
    id: 'lush_forest',
    resources: {} as Record<ResourceId, number>,
    automations,
    discovered: true,
    activated: true,
    discoveredResources: [],
  };
}

describe('calculateBiomeProductionRates', () => {
  it('returns empty production for biome with no automations', () => {
    const biome = makeBiome([]);
    const { production, consumption } = calculateBiomeProductionRates(biome);
    expect(production).toEqual({});
    expect(consumption).toEqual({});
  });

  it('calculates production for a single gatherer at level 0', () => {
    const biome = makeBiome([makeAutomation({ type: 'logger', level: 0 })]);
    const { production, consumption } = calculateBiomeProductionRates(biome);

    // Logger config: baseProductionRate=1, produces=[{resourceId:'wood', amount:6}]
    // Rate = calculateProductionRate(1, 0) = 1
    // Production: 6 * 1 = 6
    expect(production.wood).toBeCloseTo(6);
    expect(consumption).toEqual({});
  });

  it('calculates production for a gatherer at higher level', () => {
    const biome = makeBiome([makeAutomation({ type: 'logger', level: 3 })]);
    const { production } = calculateBiomeProductionRates(biome);

    // Rate = calculateProductionRate(1, 3) = 1 * (1.25^3) = 1.953125
    // Production: 6 * 1.953125 = 11.71875
    const expectedRate = Math.pow(1.25, 3);
    expect(production.wood).toBeCloseTo(6 * expectedRate);
  });

  it('calculates production and consumption for a processor', () => {
    const biome = makeBiome([makeAutomation({ type: 'saw_mill', level: 0 })]);
    const { production, consumption } = calculateBiomeProductionRates(biome);

    // Sawmill: consumes [{wood, 4}], produces [{planks, 2}], baseProductionRate=1
    // Rate = 1 at level 0
    // Production: planks = 2 * 1 = 2
    // Consumption: wood = 4
    expect(production.planks).toBeCloseTo(2);
    expect(consumption.wood).toBeCloseTo(4);
  });

  it('aggregates production from multiple automations', () => {
    const biome = makeBiome([
      makeAutomation({ id: 'a1', type: 'logger', level: 0 }),
      makeAutomation({ id: 'a2', type: 'quarry', level: 0 }),
    ]);
    const { production } = calculateBiomeProductionRates(biome);

    // Logger produces 6 wood/tick, Quarry produces 6 stone/tick (both at level 0)
    expect(production.wood).toBeCloseTo(6);
    expect(production.stone).toBeCloseTo(6);
  });

  it('skips paused automations', () => {
    const biome = makeBiome([
      makeAutomation({ type: 'logger', level: 0, paused: true }),
    ]);
    const { production } = calculateBiomeProductionRates(biome);

    expect(production.wood).toBeUndefined();
  });

  it('applies power cell bonus to production', () => {
    const biome = makeBiome([
      makeAutomation({
        type: 'logger',
        level: 0,
        powerCell: { tier: 'green', bonus: 0.50 },
      }),
    ]);
    const { production } = calculateBiomeProductionRates(biome);

    // Rate = calculateProductionRate(1, 0, 0, effectivePowerCellBonus)
    // With no skills, effective bonus = 0.50
    // Rate = 1 * 1 * 1 * 1.50 = 1.50
    // Production: 6 * 1.50 = 9
    expect(production.wood).toBeCloseTo(9);
  });
});

describe('getAutomationEfficiency', () => {
  it('returns 1.0 for gatherers (no inputs required)', () => {
    const automation = makeAutomation({ type: 'logger', level: 0 });
    const productionRates: Partial<Record<ResourceId, number>> = {};
    const efficiency = getAutomationEfficiency(automation, productionRates);
    expect(efficiency).toBe(1.0);
  });

  it('returns 1.0 for processors with sufficient inputs', () => {
    const automation = makeAutomation({ type: 'saw_mill', level: 0 });
    // Sawmill consumes 4 wood at rate 1 (level 0) = needs 4 wood
    const productionRates: Partial<Record<ResourceId, number>> = { wood: 10 };
    const efficiency = getAutomationEfficiency(automation, productionRates);
    expect(efficiency).toBe(1.0);
  });

  it('returns partial efficiency when inputs are limited', () => {
    const automation = makeAutomation({ type: 'saw_mill', level: 0 });
    // Sawmill needs 4 wood at rate 1 = 4 wood, but only 2 available
    const productionRates: Partial<Record<ResourceId, number>> = { wood: 2 };
    const efficiency = getAutomationEfficiency(automation, productionRates);
    // 2 / 4 = 0.5
    expect(efficiency).toBeCloseTo(0.5);
  });

  it('returns 0 when no inputs are available', () => {
    const automation = makeAutomation({ type: 'saw_mill', level: 0 });
    const productionRates: Partial<Record<ResourceId, number>> = {};
    const efficiency = getAutomationEfficiency(automation, productionRates);
    expect(efficiency).toBe(0);
  });

  it('returns minimum efficiency across multiple inputs', () => {
    const automation = makeAutomation({ type: 'kiln', level: 0 });
    // Kiln consumes: [{clay, 4}, {charcoal, 2}] at rate 1
    // needs 4 clay and 2 charcoal
    const productionRates: Partial<Record<ResourceId, number>> = {
      clay: 4,     // 4/4 = 1.0
      charcoal: 1, // 1/2 = 0.5
    };
    const efficiency = getAutomationEfficiency(automation, productionRates);
    // min(1.0, 0.5) = 0.5
    expect(efficiency).toBeCloseTo(0.5);
  });

  it('clamps efficiency to maximum of 1.0', () => {
    const automation = makeAutomation({ type: 'saw_mill', level: 0 });
    // Way more resources than needed
    const productionRates: Partial<Record<ResourceId, number>> = { wood: 1000 };
    const efficiency = getAutomationEfficiency(automation, productionRates);
    expect(efficiency).toBe(1.0);
  });
});
