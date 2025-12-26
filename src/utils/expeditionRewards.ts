import { ResourceId, PowerCellTier, BiomeId, ExpeditionTier } from '../types/game.types';
import { EXPEDITION_TIERS } from '../game/config/expeditions';
import { BIOMES } from '../game/config/biomes';

export interface CalculatedRewards {
  resources: { resourceId: ResourceId; amount: number }[];
  powerCells: PowerCellTier[];
  newBiome: BiomeId | null;
  newResources: ResourceId[];
}

/**
 * Calculate the resource scaling multiplier based on unlocked biomes
 * Scales similarly to food cost: 4× per additional biome
 * This ensures late-game expeditions give proportionally more resources
 */
function getResourceScaleMultiplier(unlockedBiomeCount: number): number {
  return Math.pow(4, Math.max(0, unlockedBiomeCount - 1));
}

/**
 * Calculates rewards for a completed expedition
 * @param pityCounter - Hidden counter for biome discovery pity system (+5% per failed attempt)
 * @param isCompleted - Whether the expedition was completed (true) or recalled early (false)
 * @param progressPercent - How far the expedition progressed (0-1), used for partial rewards
 */
export function calculateExpeditionRewards(
  tier: ExpeditionTier,
  bonus: number,
  unlockedBiomes: BiomeId[],
  currentBiomeId: BiomeId,
  discoveredResources: ResourceId[],
  pityCounter: number = 0,
  isCompleted: boolean = true,
  progressPercent: number = 1.0
): CalculatedRewards {
  const config = EXPEDITION_TIERS[tier];
  const baseMultiplier = config.resourceMultiplier;

  // Scale rewards with progression (same scale as food costs)
  const progressionScale = getResourceScaleMultiplier(unlockedBiomes.length);

  // Completion bonus: +20% if expedition completed fully
  const completionBonus = isCompleted ? 0.20 : 0;

  // Progress scaling: partial rewards if recalled early
  const progressMultiplier = isCompleted ? 1.0 : progressPercent;

  const totalMultiplier = baseMultiplier * (1 + bonus + completionBonus) * progressionScale * progressMultiplier;

  // Calculate resource rewards based on current biome's primary resources
  // Base amount: 20-50 per resource, then scaled
  const currentBiome = BIOMES[currentBiomeId];
  const resources: { resourceId: ResourceId; amount: number }[] = currentBiome.primaryResources.map(resourceId => ({
    resourceId,
    amount: Math.floor((Math.random() * 30 + 20) * totalMultiplier)
  }));

  // Power cell rewards - ONLY on completed expeditions
  const powerCells: PowerCellTier[] = [];
  if (isCompleted && Math.random() < config.powerCellChance) {
    // Random power cell tier (weighted towards lower tiers)
    const rand = Math.random();
    if (rand < 0.7) {
      powerCells.push('green');
    } else if (rand < 0.95) {
      powerCells.push('blue');
    } else {
      powerCells.push('orange');
    }
  }

  // Biome discovery - ONLY on completed expeditions
  // Follows strict progression order
  const BIOME_PROGRESSION: Record<BiomeId, BiomeId | null> = {
    'lush_forest': 'misty_lake',      // From lush_forest, discover misty_lake
    'misty_lake': 'arid_desert',       // From misty_lake, discover arid_desert
    'arid_desert': 'frozen_tundra',    // From arid_desert, discover frozen_tundra
    'frozen_tundra': 'volcanic_isle',  // From frozen_tundra, discover volcanic_isle
    'volcanic_isle': 'crystal_caverns', // From volcanic_isle, discover crystal_caverns
    'crystal_caverns': null,           // Final biome - nothing left to discover
  };

  let newBiome: BiomeId | null = null;

  // Only check for biome discovery if expedition was completed
  if (isCompleted) {
    // Pity system: +5% chance per failed expedition (hidden from player)
    // Caps at +50% bonus (10 failed expeditions)
    const pityBonus = Math.min(pityCounter * 0.05, 0.50);
    const effectiveDiscoveryChance = config.biomeDiscoveryChance + pityBonus;

    if (Math.random() < effectiveDiscoveryChance) {
      // Get the next biome in progression from current biome
      const nextBiome = BIOME_PROGRESSION[currentBiomeId];

      // Only discover if: there's a next biome AND it's not already unlocked
      if (nextBiome && !unlockedBiomes.includes(nextBiome)) {
        newBiome = nextBiome;
      }
    }
  }

  // New resource discoveries from current biome's discoverable resources
  // When a resource is discovered, we also give the player some of it!
  // Limit to max 2 resources if biome was also discovered, max 3 otherwise
  const maxNewResources = newBiome ? 2 : 3;
  const newResources: ResourceId[] = [];

  if (currentBiome.discoverableResources) {
    // Shuffle the discoverable resources to randomize which ones we try first
    const shuffledResources = [...currentBiome.discoverableResources]
      .filter(resourceId => !discoveredResources.includes(resourceId))
      .sort(() => Math.random() - 0.5);

    // Use tier-specific resource discovery chance
    const resourceDiscoveryChance = config.resourceDiscoveryChance;

    for (const resourceId of shuffledResources) {
      if (newResources.length >= maxNewResources) break;

      if (Math.random() < resourceDiscoveryChance) {
        newResources.push(resourceId);
        // Also add some of this resource to rewards (3-8 units)
        const amount = Math.floor(Math.random() * 6 + 3) * totalMultiplier;
        resources.push({ resourceId, amount: Math.floor(amount) });
      }
    }
  }

  return {
    resources,
    powerCells,
    newBiome,
    newResources
  };
}
