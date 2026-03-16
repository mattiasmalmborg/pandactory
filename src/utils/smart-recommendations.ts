import { GameState, ResourceId, AutomationType } from '../types/game.types';
import { AUTOMATIONS } from '../game/config/automations';
import { BIOMES } from '../game/config/biomes';
import { RESOURCES } from '../game/config/resources';
import { canSeeAutomation } from './automation-visibility';
import { getAllBiomeResources } from './calculations';
import { AutomationConfig } from '../types/automation.types';

export interface SmartRecommendation {
  icon: string;
  label: string;       // e.g. "Bottleneck" or "Next step"
  text: string;        // e.g. "Gather more Wood (needed for Logger, Quarry)"
  resourceId?: ResourceId;
  current?: number;
  needed?: number;
  percent?: number;
}

/**
 * Analyzes the player's current game state and returns the most relevant
 * bottleneck/recommendation — tracing backward through production chains
 * from spaceship parts down to what's actionable NOW.
 */
export function getSmartBottleneck(state: GameState): SmartRecommendation | null {
  const allResources = getAllBiomeResources(state.biomes);
  const discoveredResources = getDiscoveredResources(state);

  // Phase 1: Check if player has any spaceship parts being produced
  // If so, show the actual spaceship bottleneck
  const SPACESHIP_PARTS: ResourceId[] = [
    'microchips', 'rocket_fuel', 'thrusters', 'oxygen_tanks',
    'batteries', 'solar_arrays', 'titanium_hull',
  ];

  const hasAnySpaceshipProduction = SPACESHIP_PARTS.some(partId =>
    state.discoveredProducedResources?.includes(partId)
  );

  if (hasAnySpaceshipProduction) {
    // Late game — show actual spaceship part bottleneck
    const REQUIRED = 100;
    const parts = SPACESHIP_PARTS.map(partId => ({
      id: partId,
      current: Math.floor(allResources[partId] || 0),
      percent: Math.min(100, Math.round(((allResources[partId] || 0) / REQUIRED) * 100)),
      resource: RESOURCES[partId],
    }));

    const incomplete = parts.filter(p => p.percent < 100);
    if (incomplete.length > 0) {
      const worst = incomplete.reduce((min, p) => p.percent < min.percent ? p : min);
      return {
        icon: worst.resource?.icon || '?',
        label: 'Ship Bottleneck',
        text: `${worst.resource?.name || worst.id}: ${worst.current}/${REQUIRED}`,
        resourceId: worst.id,
        current: worst.current,
        needed: REQUIRED,
        percent: worst.percent,
      };
    }
    return null; // All parts complete
  }

  // Phase 2: Find the next unbuilt automation in the production chain
  // and determine what resources the player needs to build it
  const nextAutomation = findNextUnbuiltAutomation(state, discoveredResources, allResources);
  if (nextAutomation) {
    return nextAutomation;
  }

  // Phase 3: Fallback — recommend gathering raw resources
  return getEarlyGameRecommendation(allResources);
}

/**
 * Get all discovered resources across all biomes
 */
function getDiscoveredResources(state: GameState): ResourceId[] {
  const discovered = new Set<ResourceId>();
  for (const biomeId of state.unlockedBiomes) {
    const biome = state.biomes[biomeId];
    if (biome.discoveredResources) {
      for (const r of biome.discoveredResources) {
        discovered.add(r);
      }
    }
  }
  return Array.from(discovered);
}

/**
 * Find the next automation the player should build, prioritizing
 * those closer to spaceship production. Returns a recommendation
 * about what resource to gather for that automation's build cost.
 */
function findNextUnbuiltAutomation(
  state: GameState,
  discoveredResources: ResourceId[],
  allResources: Record<string, number>,
): SmartRecommendation | null {
  const discoveredProduced = state.discoveredProducedResources || [];

  // Collect all built automation types across all biomes
  const builtTypes = new Set<AutomationType>();
  for (const biomeId of state.unlockedBiomes) {
    const biome = state.biomes[biomeId];
    for (const auto of biome.automations) {
      builtTypes.add(auto.type);
    }
  }

  // Find all visible-but-unbuilt automations across unlocked biomes
  const candidates: Array<{
    automation: AutomationConfig;
    shortfall: Array<{ resourceId: ResourceId; name: string; icon: string; have: number; need: number }>;
    priority: number; // higher = more important to build
  }> = [];

  for (const biomeId of state.unlockedBiomes) {
    const biomeConfig = BIOMES[biomeId];
    if (!biomeConfig) continue;

    for (const autoType of biomeConfig.availableAutomations) {
      if (builtTypes.has(autoType)) continue; // Already built

      const config = AUTOMATIONS[autoType];
      if (!config) continue;

      if (!canSeeAutomation(config, discoveredResources, discoveredProduced)) continue;

      // Calculate shortfall for build costs
      const shortfall: Array<{ resourceId: ResourceId; name: string; icon: string; have: number; need: number }> = [];
      for (const cost of config.baseCost) {
        const have = Math.floor(allResources[cost.resourceId] || 0);
        if (have < cost.amount) {
          const resource = RESOURCES[cost.resourceId];
          shortfall.push({
            resourceId: cost.resourceId,
            name: resource?.name || cost.resourceId,
            icon: resource?.icon || '?',
            have,
            need: cost.amount,
          });
        }
      }

      // Priority: processors > gatherers, later tiers > earlier
      let priority = 0;
      if (config.category === 'final_assembler') priority = 4;
      else if (config.category === 'processor' && config.levelUpCostMultiplier >= 1.35) priority = 3;
      else if (config.category === 'processor') priority = 2;
      else if (config.category === 'gatherer' || config.category === 'food_producer') priority = 1;

      candidates.push({ automation: config, shortfall, priority });
    }
  }

  if (candidates.length === 0) return null;

  // Sort: prefer automations that CAN be built (shortfall empty) first, then by priority
  candidates.sort((a, b) => {
    // Buildable automations first (no shortfall)
    const aReady = a.shortfall.length === 0 ? 1 : 0;
    const bReady = b.shortfall.length === 0 ? 1 : 0;
    if (aReady !== bReady) return bReady - aReady;
    // Then by priority (higher = better)
    return b.priority - a.priority;
  });

  const best = candidates[0];

  // If the best candidate has no shortfall, recommend building it
  if (best.shortfall.length === 0) {
    return {
      icon: '🔧',
      label: 'Ready to build',
      text: `You can build a ${best.automation.name}!`,
    };
  }

  // Otherwise, recommend gathering the resource with the worst shortfall ratio
  const worstShortfall = best.shortfall.reduce((worst, s) => {
    const worstRatio = worst.have / worst.need;
    const sRatio = s.have / s.need;
    return sRatio < worstRatio ? s : worst;
  });

  return {
    icon: worstShortfall.icon,
    label: 'Next goal',
    text: `Gather ${worstShortfall.name} for ${best.automation.name} (${worstShortfall.have}/${worstShortfall.need})`,
    resourceId: worstShortfall.resourceId,
    current: worstShortfall.have,
    needed: worstShortfall.need,
    percent: Math.round((worstShortfall.have / worstShortfall.need) * 100),
  };
}

/**
 * Early game fallback: recommend gathering the most-needed raw resource.
 */
function getEarlyGameRecommendation(
  allResources: Record<string, number>,
): SmartRecommendation | null {
  // In very early game, just recommend wood and stone
  const wood = Math.floor(allResources['wood'] || 0);
  const stone = Math.floor(allResources['stone'] || 0);

  if (wood <= stone) {
    const resource = RESOURCES['wood'];
    return {
      icon: resource?.icon || '🪵',
      label: 'Get started',
      text: 'Gather Wood — needed for your first automations',
      resourceId: 'wood',
      current: wood,
    };
  }

  const resource = RESOURCES['stone'];
  return {
    icon: resource?.icon || '🪨',
    label: 'Get started',
    text: 'Gather Stone — needed for your first automations',
    resourceId: 'stone',
    current: stone,
  };
}
