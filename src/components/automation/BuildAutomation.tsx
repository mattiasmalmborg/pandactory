import { useState, useMemo } from 'react';
import { AutomationType, BiomeId, ResourceCost } from '../../types/game.types';
import { AUTOMATIONS } from '../../game/config/automations';
import { RESOURCES } from '../../game/config/resources';
import { useGame } from '../../game/state/GameContext';
import { canAfford, applyCostReduction } from '../../utils/calculations';
import { calculateBiomeProductionRates } from '../../utils/allocation';
import { getVisibleAutomations } from '../../utils/automation-visibility';
import { formatNumber } from '../../utils/formatters';

interface BuildAutomationProps {
  biomeId: BiomeId;
  availableAutomations: AutomationType[];
}

export function BuildAutomation({ biomeId, availableAutomations }: BuildAutomationProps) {
  const { state, dispatch } = useGame();
  const [selectedType, setSelectedType] = useState<AutomationType | null>(null);
  const biome = state.biomes[biomeId];
  const isOnExpedition = state.panda.status === 'expedition';

  // Calculate current production rates
  const { production } = calculateBiomeProductionRates(biome);

  // Gather all discovered resources from ALL biomes (cross-biome resource sharing)
  const allDiscoveredResources = Object.values(state.biomes)
    .flatMap(b => b.discoveredResources || [])
    .filter((v, i, a) => a.indexOf(v) === i); // unique

  // Filter automations by discovered resources (only show if all required resources are discovered)
  const visibleAutomations = getVisibleAutomations(
    availableAutomations,
    AUTOMATIONS,
    allDiscoveredResources,
    state.discoveredProducedResources || []
  );

  // Filter out automations that already exist (maxInstancesPerBiome check)
  const buildableAutomations = visibleAutomations.filter((type: AutomationType) => {
    const config = AUTOMATIONS[type];
    if (!config) return false; // Config not defined yet
    if (!config.maxInstancesPerBiome) return true; // Unlimited

    const existingCount = biome.automations.filter(a => a.type === type).length;
    return existingCount < config.maxInstancesPerBiome;
  });

  // Gather all resources from ALL biomes for cross-biome building
  const allResources: Record<string, number> = {};
  Object.values(state.biomes).forEach(b => {
    Object.entries(b.resources).forEach(([resId, amount]) => {
      allResources[resId] = (allResources[resId] || 0) + amount;
    });
  });

  // Get achievement-based cost reduction
  const unlockedAchievements = state.achievements?.unlocked || [];

  // Helper to get costs with mastery reduction applied
  const getAdjustedCosts = useMemo(() => (baseCost: ResourceCost[]) => {
    return applyCostReduction(baseCost, unlockedAchievements);
  }, [unlockedAchievements]);

  const buildAutomation = (type: AutomationType) => {
    const config = AUTOMATIONS[type];
    if (!config) return;

    // Apply cost reduction from achievements
    const adjustedCosts = getAdjustedCosts(config.baseCost);

    // Check if we can afford it (using resources from ALL biomes)
    if (!canAfford(allResources, adjustedCosts)) {
      alert('Not enough resources!');
      return;
    }

    // Deduct costs from the biome that HAS the resource (using adjusted costs)
    adjustedCosts.forEach((cost) => {
      let remaining = cost.amount;
      // Find biomes with this resource and deduct from them
      for (const [bId, bState] of Object.entries(state.biomes)) {
        if (remaining <= 0) break;
        const available = bState.resources[cost.resourceId] || 0;
        if (available > 0) {
          const toDeduct = Math.min(available, remaining);
          dispatch({
            type: 'GATHER_RESOURCE',
            payload: {
              biomeId: bId as any,
              resourceId: cost.resourceId,
              amount: -toDeduct,
            },
          });
          remaining -= toDeduct;
        }
      }
    });

    // Build automation
    dispatch({
      type: 'BUILD_AUTOMATION',
      payload: { biomeId, automationType: type },
    });

    setSelectedType(null);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 uppercase">Build New Automation</h3>

      {isOnExpedition ? (
        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700 text-center">
          <p className="text-blue-300 text-sm">🐼 Cannot build while Dr. Redd Pawston III is on expedition!</p>
        </div>
      ) : buildableAutomations.length === 0 ? (
        <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 text-center">
          <p className="text-gray-400 text-sm">All available automations have been built!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {buildableAutomations.map((type: AutomationType) => {
            const config = AUTOMATIONS[type];
            if (!config) return null;
            const adjustedCosts = getAdjustedCosts(config.baseCost);
            const canBuild = canAfford(allResources, adjustedCosts);

            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-3 rounded-lg border-2 transition-all text-left relative group backdrop-blur-sm ${
                  canBuild
                    ? 'border-gray-600/50 bg-gray-800/80 hover:border-panda-orange hover:bg-gray-700/90'
                    : 'border-gray-700/50 bg-gray-900/60 opacity-50 cursor-not-allowed'
                }`}
                disabled={!canBuild}
              >
                <div className="font-semibold text-white text-sm">{config.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {adjustedCosts.map((cost: ResourceCost) => {
                    const resource = RESOURCES[cost.resourceId];
                    return (
                      <div key={cost.resourceId}>
                        {resource?.icon ?? "❓"} {cost.amount}
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Build Confirmation Modal */}
      {selectedType && AUTOMATIONS[selectedType] && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-md rounded-lg border border-gray-700/50 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">
              Build {AUTOMATIONS[selectedType]!.name}?
            </h2>

            <p className="text-gray-300 text-sm mb-4">
              {AUTOMATIONS[selectedType]!.description}
            </p>

            <div className="bg-gray-900 rounded p-3 mb-4">
              <div className="text-xs text-gray-400 mb-2">Cost (from all biomes):</div>
              {getAdjustedCosts(AUTOMATIONS[selectedType]!.baseCost).map((cost) => {
                const resource = RESOURCES[cost.resourceId];
                const available = allResources[cost.resourceId] || 0;
                return (
                  <div key={cost.resourceId} className="flex items-center justify-between text-sm">
                    <span className="text-white">
                      {resource?.icon ?? "❓"} {resource?.name ?? "Unknown"}
                    </span>
                    <span className={available >= cost.amount ? 'text-green-400' : 'text-red-400'}>
                      {Math.floor(available)} / {cost.amount}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Show consumption requirements */}
            {AUTOMATIONS[selectedType]!.consumes && AUTOMATIONS[selectedType]!.consumes!.length > 0 && (
              <div className="bg-gray-900 rounded p-3 mb-4">
                <div className="text-xs text-gray-400 mb-2">Requires (continuous):</div>
                {AUTOMATIONS[selectedType]!.consumes!.map((consume) => {
                  const resource = RESOURCES[consume.resourceId];
                  const needed = consume.amount * AUTOMATIONS[selectedType]!.baseProductionRate;
                  const available = production[consume.resourceId] || 0;
                  const canSupport = available >= needed;

                  return (
                    <div key={consume.resourceId} className="flex justify-between text-sm mb-1">
                      <span className="text-white">
                        {resource?.icon ?? "❓"} {resource?.name ?? "Unknown"}
                      </span>
                      <span className={canSupport ? 'text-green-400' : 'text-red-400'}>
                        {formatNumber(available)}/{formatNumber(needed)}/min {canSupport ? '✓' : '✗'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-gray-900 rounded p-3 mb-4">
              <div className="text-xs text-gray-400 mb-2">Production:</div>
              {AUTOMATIONS[selectedType]!.produces.map((produce) => {
                const resource = RESOURCES[produce.resourceId];
                return (
                  <div key={produce.resourceId} className="text-sm text-green-400">
                    {resource?.icon ?? "❓"} +{produce.amount}/min {resource?.name ?? "Unknown"}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedType(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => buildAutomation(selectedType)}
                className="flex-1 bg-panda-orange hover:bg-orange-600 text-white py-2 px-4 rounded font-semibold"
              >
                Build
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
