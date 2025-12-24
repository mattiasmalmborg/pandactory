import { AutomationConfig } from '../types/automation.types';
import { ResourceId, AutomationType } from '../types/game.types';
import { RESOURCES } from '../game/config/resources';

/**
 * Determines if an automation should be visible to the player
 * based on which resources have been discovered.
 *
 * An automation is visible if:
 * 1. ALL RAW consumed resources have been discovered (via biome activation or expedition)
 * 2. ALL RAW produced resources have been discovered (via biome activation or expedition)
 * 3. ALL INTERMEDIATE consumed resources have been produced at least once
 * 4. ALL build cost resources are either discovered (raw) or produced (intermediate)
 *
 * This creates a natural progression where:
 * - You can't see oil_pump until you discover crude_oil via expedition
 * - You can't see fuel_depot until you've produced kerosene and liquid_oxygen
 * - You can't see advanced automations until you've built the prerequisite chain
 * - You can't see automations that cost resources you haven't discovered yet
 */
export function canSeeAutomation(
  automation: AutomationConfig,
  discoveredResources: ResourceId[],
  discoveredProducedResources: ResourceId[] = []
): boolean {
  const consumedResources = (automation.consumes || []).map(c => c.resourceId);
  const producedResources = (automation.produces || []).map(p => p.resourceId);
  const buildCostResources = (automation.baseCost || []).map(c => c.resourceId);

  // Check RAW consumed resources - must be discovered via biome/expedition
  const rawConsumedResources = consumedResources.filter(resourceId => {
    const resource = RESOURCES[resourceId];
    return resource?.category === 'raw';
  });

  const allRawConsumedDiscovered = rawConsumedResources.every(resource =>
    discoveredResources.includes(resource)
  );

  if (!allRawConsumedDiscovered) {
    return false;
  }

  // Check INTERMEDIATE consumed resources - must have been produced at least once
  const intermediateConsumedResources = consumedResources.filter(resourceId => {
    const resource = RESOURCES[resourceId];
    return resource?.category === 'intermediate';
  });

  const allIntermediateConsumedProduced = intermediateConsumedResources.every(resource =>
    discoveredProducedResources.includes(resource)
  );

  if (!allIntermediateConsumedProduced) {
    return false;
  }

  // Check RAW produced resources - must be discovered via biome/expedition
  // This handles gatherers like oil_pump, sulfur_collector, rubber_tapper, etc.
  const rawProducedResources = producedResources.filter(resourceId => {
    const resource = RESOURCES[resourceId];
    return resource?.category === 'raw';
  });

  const allRawProducedDiscovered = rawProducedResources.every(resource =>
    discoveredResources.includes(resource)
  );

  if (!allRawProducedDiscovered) {
    return false;
  }

  // Check BUILD COST resources - raw must be discovered, intermediate must be produced
  const allBuildCostResourcesAvailable = buildCostResources.every(resourceId => {
    const resource = RESOURCES[resourceId];
    if (!resource) return false;

    if (resource.category === 'raw') {
      return discoveredResources.includes(resourceId);
    } else if (resource.category === 'intermediate') {
      return discoveredProducedResources.includes(resourceId);
    }
    // For other categories (food, final), allow them
    return true;
  });

  return allBuildCostResourcesAvailable;
}

/**
 * Filters a list of automation types to only include those that should be visible
 * based on discovered resources.
 */
export function getVisibleAutomations(
  automationTypes: AutomationType[],
  automationConfigs: Partial<Record<AutomationType, AutomationConfig>>,
  discoveredResources: ResourceId[],
  discoveredProducedResources: ResourceId[] = []
): AutomationType[] {
  return automationTypes.filter(type => {
    const config = automationConfigs[type];
    if (!config) return false;
    return canSeeAutomation(config, discoveredResources, discoveredProducedResources);
  });
}
