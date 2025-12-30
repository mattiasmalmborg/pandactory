import { useMemo } from 'react';
import { Automation, BiomeId, ResourceId } from '../../types/game.types';
import { AUTOMATIONS } from '../../game/config/automations';
import { POWER_CELLS } from '../../game/config/powerCells';
import { RESOURCES } from '../../game/config/resources';
import { FOOD_ITEMS } from '../../game/config/food';
import { calculateLevelUpCost, calculateProductionRate, canAfford, applyCostReduction } from '../../utils/calculations';
import { calculateBiomeProductionRates, getAutomationEfficiency } from '../../utils/allocation';
import { countInstalledPowerCells, getEffectivePowerCellBonus } from '../../game/config/skillTree';
import { useGame } from '../../game/state/GameContext';
import { formatNumber } from '../../utils/formatters';
import { getResourceSourceDescription } from '../../utils/resourceTracking';

interface AutomationCardProps {
  automation: Automation;
  biomeId: BiomeId;
  onUpgrade?: () => void;
  onInstallPowerCell?: () => void;
  onRemovePowerCell?: () => void;
  onTogglePause?: () => void;
}

export function AutomationCard({
  automation,
  biomeId: _biomeId,
  onUpgrade,
  onInstallPowerCell,
  onRemovePowerCell,
  onTogglePause
}: AutomationCardProps) {
  const { state } = useGame();
  const config = AUTOMATIONS[automation.type];
  const isOnExpedition = state.panda.status === 'expedition';

  if (!config) return null;

  // Gather all resources from ALL biomes for cross-biome upgrades (memoized)
  const allResources = useMemo(() => {
    const resources: Record<string, number> = {};
    Object.values(state.biomes).forEach(b => {
      Object.entries(b.resources).forEach(([resId, amount]) => {
        resources[resId] = (resources[resId] || 0) + amount;
      });
    });
    return resources;
  }, [state.biomes]);

  // Context for production calculations
  const productionContext = useMemo(() => ({
    unlockedSkills: state.prestige.unlockedSkills,
    unlockedAchievements: state.achievements?.unlocked || [],
    allBiomes: state.biomes,
  }), [state.prestige.unlockedSkills, state.achievements?.unlocked, state.biomes]);

  // Calculate GLOBAL production AND consumption rates from ALL biomes for efficiency calculation (memoized)
  const { globalProduction, globalConsumption } = useMemo(() => {
    const production: Record<string, number> = {};
    const consumption: Record<string, number> = {};
    Object.values(state.biomes).forEach(b => {
      const { production: biomeProduction, consumption: biomeConsumption } = calculateBiomeProductionRates(b, productionContext);
      Object.entries(biomeProduction).forEach(([resId, rate]) => {
        production[resId] = (production[resId] || 0) + rate;
      });
      Object.entries(biomeConsumption).forEach(([resId, rate]) => {
        consumption[resId] = (consumption[resId] || 0) + rate;
      });
    });
    return { globalProduction: production, globalConsumption: consumption };
  }, [state.biomes, productionContext]);

  // Count total installed power cells for resonance calculation
  const totalInstalledCells = countInstalledPowerCells(state.biomes);

  // Calculate effective power cell bonus with resonance
  const basePowerCellBonus = automation.powerCell?.bonus || 0;
  const effectivePowerCellBonus = getEffectivePowerCellBonus(
    basePowerCellBonus,
    totalInstalledCells,
    state.prestige.unlockedSkills
  );

  // Calculate efficiency based on NET production (production minus OTHER automations' consumption)
  // For each resource, calculate what's available AFTER other automations consume it
  const netProduction = useMemo(() => {
    const net: Record<string, number> = {};
    const automationConfig = AUTOMATIONS[automation.type];

    // For each resource in global production
    Object.keys(globalProduction).forEach(resId => {
      const produced = globalProduction[resId] || 0;
      const totalConsumed = globalConsumption[resId] || 0;

      // Calculate how much THIS automation needs
      let thisAutomationNeeds = 0;
      if (automationConfig?.consumes) {
        automationConfig.consumes.forEach(consume => {
          if (consume.resourceId === resId) {
            thisAutomationNeeds = consume.amount;
          }
        });
      }

      // Net available = produced - (total consumed by others)
      // We exclude THIS automation's consumption to see what's available FOR it
      const consumedByOthers = totalConsumed - thisAutomationNeeds;
      net[resId] = produced - consumedByOthers;
    });

    return net;
  }, [globalProduction, globalConsumption, automation.type]);

  const efficiency = getAutomationEfficiency(automation, netProduction, productionContext);
  const efficiencyPercent = Math.round(efficiency * 100);

  // Calculate production rates with new formula (+25% per level)
  const baseRate = calculateProductionRate(config.baseProductionRate, automation.level);
  const actualRate = effectivePowerCellBonus > 0
    ? baseRate * (1 + effectivePowerCellBonus)
    : baseRate;
  const effectiveRate = actualRate * efficiency;

  // Identify which specific resources are bottlenecking this automation
  const bottleneckResources = useMemo(() => {
    if (!config.consumes || efficiency >= 0.99) return [];

    const bottlenecks: ResourceId[] = [];
    config.consumes.forEach(consume => {
      const needed = consume.amount * actualRate;
      const available = netProduction[consume.resourceId] || 0;

      // If we need more than what's available, it's a bottleneck
      if (available < needed) {
        bottlenecks.push(consume.resourceId);
      }
    });

    return bottlenecks;
  }, [config.consumes, actualRate, netProduction, efficiency]);

  // Calculate next level production
  const nextLevelBaseRate = calculateProductionRate(config.baseProductionRate, automation.level + 1);
  const boostPercent = Math.round(((nextLevelBaseRate - baseRate) / baseRate) * 100);

  // Get achievement-based cost reduction
  const unlockedAchievements = state.achievements?.unlocked || [];

  // Calculate upgrade cost (using resources from ALL biomes, with mastery discount)
  const baseUpgradeCost = calculateLevelUpCost(config.baseCost, automation.level, config.levelUpCostMultiplier);
  const upgradeCost = applyCostReduction(baseUpgradeCost, unlockedAchievements);
  const canAffordUpgrade = canAfford(allResources, upgradeCost);

  const powerCellInfo = automation.powerCell
    ? POWER_CELLS[automation.powerCell.tier]
    : null;

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white capitalize truncate">
              {config.name}
            </h3>
            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded whitespace-nowrap">
              Lv. {automation.level}
            </span>
            {automation.paused && (
              <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded whitespace-nowrap">
                Paused
              </span>
            )}
          </div>
          <p className="text-xs text-white italic mt-1 line-clamp-2">{config.description}</p>
        </div>
        {onTogglePause && (
          <button
            onClick={onTogglePause}
            className={`ml-2 px-3 py-1 text-xs rounded font-semibold transition-all ${
              automation.paused
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-yellow-600 hover:bg-yellow-500 text-white'
            }`}
            title={automation.paused ? 'Resume automation' : 'Pause automation'}
          >
            {automation.paused ? '▶' : '❚❚'}
          </button>
        )}
      </div>

      {/* Efficiency Bar - compact */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-16">Efficiency</span>
        <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full progress-bar-smooth ${
              efficiency >= 0.99 ? 'bg-green-500' :
              efficiency >= 0.7 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${efficiencyPercent}%` }}
          />
        </div>
        <span className={`text-xs font-bold w-10 text-right ${
          efficiency >= 0.99 ? 'text-green-400' :
          efficiency >= 0.7 ? 'text-yellow-400' :
          'text-red-400'
        }`}>
          {efficiencyPercent}%
        </span>
      </div>

      {/* Efficiency Warning - show when < 100% and list only bottleneck resources */}
      {efficiency < 0.99 && bottleneckResources.length > 0 && (
        <div className={`border rounded px-2 py-1.5 ${
          efficiency < 0.5
            ? 'bg-red-900/30 border-red-700/50'
            : 'bg-yellow-900/30 border-yellow-700/50'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className={efficiency < 0.5 ? 'text-red-400 text-sm' : 'text-yellow-400 text-sm'}>⚠️</span>
            <span className={`text-xs ${efficiency < 0.5 ? 'text-red-300' : 'text-yellow-300'}`}>
              {efficiency < 0.5 ? 'Low efficiency!' : 'Reduced efficiency.'} Need more {bottleneckResources.map(resId => RESOURCES[resId]?.name || resId).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Production & Consumption - compact grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Consumption */}
        {config.consumes && config.consumes.length > 0 && (
          <div className="bg-gray-900/50 rounded p-2">
            <div className="text-gray-500 mb-1">Consumes:</div>
            {config.consumes.map((consume) => {
              const resource = RESOURCES[consume.resourceId];
              const needed = consume.amount * actualRate;
              const sourceDescription = getResourceSourceDescription(consume.resourceId, state);
              return (
                <div
                  key={consume.resourceId}
                  className="flex justify-between text-yellow-400"
                  data-tooltip={sourceDescription}
                >
                  <span>{resource?.icon ?? "❓"} {resource?.name ?? "?"}</span>
                  <span>-{formatNumber(needed)}/m</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Production */}
        <div className={`bg-gray-900/50 rounded p-2 ${!config.consumes?.length ? 'col-span-2' : ''}`}>
          <div className="text-gray-500 mb-1">Produces:</div>
          {config.produces.map((produce) => {
            const resource = RESOURCES[produce.resourceId];
            const actualProduction = produce.amount * effectiveRate;
            return (
              <div key={produce.resourceId} className="flex justify-between text-green-400">
                <span>{resource?.icon ?? "❓"} {resource?.name ?? "?"}</span>
                <span>+{formatNumber(actualProduction)}/m</span>
              </div>
            );
          })}
          {config.producesFood?.map((produce) => {
            const foodItem = FOOD_ITEMS[produce.foodId];
            return (
              <div key={produce.foodId} className="flex justify-between text-green-400">
                <span>{foodItem?.icon ?? '🍽️'} {foodItem?.name ?? produce.foodId}</span>
                <span>+{formatNumber(produce.amount * effectiveRate)}/m</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Power Cell - compact */}
      {automation.powerCell && powerCellInfo && (
        <div className="flex items-center justify-between bg-green-900/30 border border-green-700/50 rounded px-2 py-1">
          <span className="text-xs text-green-300">
            {powerCellInfo.icon} {powerCellInfo.name} (+{Math.round(effectivePowerCellBonus * 100)}%{effectivePowerCellBonus > basePowerCellBonus && totalInstalledCells > 1 ? ` / ${totalInstalledCells} cells` : ''})
          </span>
          {onRemovePowerCell && (
            <button
              onClick={onRemovePowerCell}
              className="text-xs text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Upgrade Section - inline with all info */}
      {onUpgrade && (
        <div className="border-t border-gray-700/50 pt-3 space-y-2">
          {/* Next Level Preview */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Next Level:</span>
            <span className="text-panda-orange font-semibold">
              Lv.{automation.level + 1} → {formatNumber(nextLevelBaseRate)}/min (+{boostPercent}%)
            </span>
          </div>

          {/* Upgrade Cost - inline */}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {upgradeCost.map((cost) => {
              const resource = RESOURCES[cost.resourceId];
              const available = allResources[cost.resourceId] || 0;
              const hasEnough = available >= cost.amount;
              return (
                <span
                  key={cost.resourceId}
                  className={`text-xs ${hasEnough ? 'text-green-400' : 'text-red-400'}`}
                >
                  {resource?.icon ?? "❓"} {resource?.name ?? "?"} {formatNumber(available)}/{formatNumber(cost.amount)}
                </span>
              );
            })}
          </div>

          {/* Actions Row */}
          <div className="flex gap-2">
            <button
              onClick={onUpgrade}
              disabled={!canAffordUpgrade || isOnExpedition}
              className={`flex-1 text-white text-sm py-2 px-3 rounded font-semibold transition-all ${
                canAffordUpgrade && !isOnExpedition
                  ? 'bg-blue-600 hover:bg-blue-500 active:scale-95'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
              title={isOnExpedition ? 'Cannot upgrade while on expedition' : undefined}
            >
              {isOnExpedition ? '🐼 On Expedition' : `⬆ Upgrade`}
            </button>
            {onInstallPowerCell && !automation.powerCell && (
              <button
                onClick={onInstallPowerCell}
                disabled={isOnExpedition}
                className={`text-sm py-2 px-3 rounded font-semibold transition-all ${
                  !isOnExpedition
                    ? 'bg-green-600 hover:bg-green-500 text-white active:scale-95'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
                title={isOnExpedition ? 'Cannot install while on expedition' : 'Add Power Cell'}
              >
                ⚡
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
