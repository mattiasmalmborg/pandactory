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
 * Calculates rewards for a completed expedition
 * @param pityCounter - Hidden counter for biome discovery pity system (+5% per failed attempt)
 */
export function calculateExpeditionRewards(
  tier: ExpeditionTier,
  bonus: number,
  unlockedBiomes: BiomeId[],
  currentBiomeId: BiomeId,
  discoveredResources: ResourceId[],
  pityCounter: number = 0
): CalculatedRewards {
  const config = EXPEDITION_TIERS[tier];
  const baseMultiplier = config.resourceMultiplier;
  const totalMultiplier = baseMultiplier * (1 + bonus);

  // Calculate resource rewards based on current biome's primary resources
  const currentBiome = BIOMES[currentBiomeId];
  const resources: { resourceId: ResourceId; amount: number }[] = currentBiome.primaryResources.map(resourceId => ({
    resourceId,
    amount: Math.floor((Math.random() * 10 + 5) * totalMultiplier) // 5-15 base, scaled by multiplier, rounded to integer
  }));

  // Power cell rewards
  const powerCells: PowerCellTier[] = [];
  if (Math.random() < config.powerCellChance) {
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

  // Biome discovery - follows strict progression order
  // Each biome can only be discovered from specific biomes
  const BIOME_PROGRESSION: Record<BiomeId, BiomeId | null> = {
    'lush_forest': 'misty_lake',      // From lush_forest, discover misty_lake
    'misty_lake': 'arid_desert',       // From misty_lake, discover arid_desert
    'arid_desert': 'frozen_tundra',    // From arid_desert, discover frozen_tundra
    'frozen_tundra': 'volcanic_isle',  // From frozen_tundra, discover volcanic_isle
    'volcanic_isle': 'crystal_caverns', // From volcanic_isle, discover crystal_caverns
    'crystal_caverns': null,           // Final biome - nothing left to discover
  };

  let newBiome: BiomeId | null = null;

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
