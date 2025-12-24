import { BiomeId, ResourceId, GameState } from '../types/game.types';
import { BIOMES } from '../game/config/biomes';

/**
 * Find which biomes are producing a specific resource
 */
export function findResourceProducers(
  resourceId: ResourceId,
  state: GameState
): BiomeId[] {
  const producers: BiomeId[] = [];

  Object.keys(state.biomes).forEach((biomeKey) => {
    const biomeId = biomeKey as BiomeId;
    const biome = state.biomes[biomeId];

    if (!biome.activated) return;

    // Check if this biome has this resource stored
    const hasResource = (biome.resources[resourceId] || 0) > 0;

    if (hasResource) {
      producers.push(biomeId);
    }
  });

  return producers;
}

/**
 * Get a friendly description of where a resource comes from
 */
export function getResourceSourceDescription(
  resourceId: ResourceId,
  state: GameState
): string {
  const producers = findResourceProducers(resourceId, state);

  if (producers.length === 0) {
    return 'No active production';
  }

  if (producers.length === 1) {
    const biomeName = BIOMES[producers[0]].name;
    return `Från ${biomeName}`;
  }

  // Multiple biomes
  const biomeNames = producers.map(id => BIOMES[id].name);
  return `Från ${biomeNames.join(', ')}`;
}
