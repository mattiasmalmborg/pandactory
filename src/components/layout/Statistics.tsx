import { useMemo, memo } from 'react';
import { useGame } from '../../game/state/GameContext';
import { RESOURCES } from '../../game/config/resources';
import { FOOD_ITEMS } from '../../game/config/food';
import { AUTOMATIONS } from '../../game/config/automations';
import { formatNumber } from '../../utils/formatters';
import { createProductionContext, getAutomationProductionRate } from '../../utils/calculations';
import { ResourceId, FoodId } from '../../types/game.types';
import { SaveManager } from './SaveManager';
import { BackgroundWrapper } from './BackgroundWrapper';
import { getBiomeBackgroundPath, getFallbackGradient } from '../../config/assets';
import { calculateBiomeProductionRates } from '../../utils/allocation';

export function Statistics() {
  const { state } = useGame();

  // Memoize expensive resource/production calculations
  const { resources, foods, totalResourceAmount, totalFoodAmount, builtAutomations, totalAutomationLevels, powerCellStats, prestigeStats } = useMemo(() => {
    const allResources: Partial<Record<ResourceId, { amount: number; productionRate: number; isFood: boolean }>> = {};
    const productionContext = createProductionContext(state);

    state.unlockedBiomes.forEach((biomeId) => {
      const biome = state.biomes[biomeId];

      Object.entries(biome.resources).forEach(([resourceId, amount]) => {
        const rid = resourceId as ResourceId;
        if (RESOURCES[rid]?.category === 'food') return;
        if (!allResources[rid]) {
          allResources[rid] = { amount: 0, productionRate: 0, isFood: false };
        }
        allResources[rid]!.amount += amount;
      });

      const { production } = calculateBiomeProductionRates(biome, productionContext);
      Object.entries(production).forEach(([resourceId, rate]) => {
        const rid = resourceId as ResourceId;
        if (!allResources[rid]) {
          allResources[rid] = { amount: 0, productionRate: 0, isFood: false };
        }
        allResources[rid]!.productionRate += rate;
      });

      biome.automations.forEach((automation) => {
        const config = AUTOMATIONS[automation.type];
        if (!config || !config.producesFood || automation.paused) return;
        const rate = getAutomationProductionRate(automation, productionContext);
        config.producesFood.forEach((foodProduce) => {
          const fid = foodProduce.foodId as ResourceId;
          if (!allResources[fid]) {
            allResources[fid] = { amount: 0, productionRate: 0, isFood: false };
          }
          allResources[fid]!.productionRate += foodProduce.amount * rate;
        });
      });
    });

    Object.entries(state.food).forEach(([foodId, amount]) => {
      const fid = foodId as ResourceId;
      if (!allResources[fid]) {
        allResources[fid] = { amount: 0, productionRate: 0, isFood: false };
      }
      allResources[fid]!.amount += amount;
    });

    const resources = Object.entries(allResources)
      .filter(([resourceId, data]) => {
        const resource = RESOURCES[resourceId as ResourceId];
        return resource && resource.category !== 'food' && (Math.floor(data.amount) >= 1 || data.productionRate > 0);
      })
      .sort((a, b) => {
        const resourceA = RESOURCES[a[0] as ResourceId];
        const resourceB = RESOURCES[b[0] as ResourceId];
        if (!resourceA || !resourceB) return 0;
        return resourceA.name.localeCompare(resourceB.name);
      });

    const foods = Object.entries(allResources)
      .filter(([resourceId, data]) => {
        const foodItem = FOOD_ITEMS[resourceId as FoodId];
        return foodItem && (Math.floor(data.amount) >= 1 || data.productionRate > 0);
      })
      .sort((a, b) => {
        const foodA = FOOD_ITEMS[a[0] as FoodId];
        const foodB = FOOD_ITEMS[b[0] as FoodId];
        if (!foodA || !foodB) return 0;
        return foodA.name.localeCompare(foodB.name);
      });

    const totalResourceAmount = Object.values(state.biomes).reduce(
      (sum, biome) => sum + Object.values(biome.resources).reduce((s, amount) => s + amount, 0),
      0
    );
    const totalFoodAmount = Object.values(state.food).reduce((sum, amount) => sum + amount, 0);

    const builtAutomations = Object.values(state.biomes).reduce(
      (sum, biome) => sum + biome.automations.length,
      0
    );
    const totalAutomationLevels = Object.values(state.biomes).reduce(
      (sum, biome) => sum + biome.automations.reduce((s, a) => s + a.level, 0),
      0
    );

    const installedCells: { green: number; blue: number; orange: number } = { green: 0, blue: 0, orange: 0 };
    Object.values(state.biomes).forEach(biome => {
      biome.automations.forEach(a => {
        if (a.powerCell?.tier) {
          installedCells[a.powerCell.tier]++;
        }
      });
    });

    const powerCellStats = {
      inventoryGreen: state.powerCellInventory.filter(pc => pc.tier === 'green').length,
      inventoryBlue: state.powerCellInventory.filter(pc => pc.tier === 'blue').length,
      inventoryOrange: state.powerCellInventory.filter(pc => pc.tier === 'orange').length,
      installedGreen: installedCells.green,
      installedBlue: installedCells.blue,
      installedOrange: installedCells.orange,
      green: state.powerCellInventory.filter(pc => pc.tier === 'green').length + installedCells.green,
      blue: state.powerCellInventory.filter(pc => pc.tier === 'blue').length + installedCells.blue,
      orange: state.powerCellInventory.filter(pc => pc.tier === 'orange').length + installedCells.orange,
      installed: installedCells.green + installedCells.blue + installedCells.orange,
      inInventory: state.powerCellInventory.length,
    };

    const prestigeStats = {
      totalPrestiges: state.prestige.totalPrestiges,
      cosmicBambooShards: state.prestige.cosmicBambooShards,
      unlockedSkills: state.prestige.unlockedSkills.length,
    };

    return { resources, foods, totalResourceAmount, totalFoodAmount, builtAutomations, totalAutomationLevels, powerCellStats, prestigeStats };
  }, [state]);

  const totalResourceTypes = Object.values(RESOURCES).filter(r => r.category !== 'food').length;
  const totalFoodTypes = Object.keys(FOOD_ITEMS).length;
  const unlockedResourceTypes = resources.length;
  const unlockedFoodTypes = foods.length;
  const totalAutomationTypes = Object.keys(AUTOMATIONS).length;

  const statisticsContent = (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Statistics</h1>
        <p className="text-sm text-gray-400">Your journey so far</p>
      </div>

      {/* Resources Overview */}
      <div className="bg-gray-800/85 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
          📦 Resources
        </h2>

        {/* Resource Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Resource Types"
            value={`${unlockedResourceTypes}/${totalResourceTypes}`}
            icon="🔓"
          />
          <StatCard
            label="Total Resources"
            value={formatNumber(totalResourceAmount)}
            icon="💎"
          />
        </div>

        {/* Resource List */}
        {resources.length > 0 ? (
          <div className="bg-gray-900/50 rounded-lg border border-gray-700/30 divide-y divide-gray-700/30">
            {resources.map(([resourceId, data]) => {
              const resource = RESOURCES[resourceId as ResourceId];
              const name = resource?.name || resourceId;
              const icon = resource?.icon || "📦";
              const description = resource?.description || '';
              const flavorText = resource?.flavorText;
              const descriptionText = flavorText
                ? `${description}\n\n"${flavorText}"`
                : description;
              const exactAmount = Math.floor(data.amount);
              const iconTooltip = `${descriptionText}\n\nAmount: ${exactAmount.toLocaleString()}`;

              return (
                <div
                  key={resourceId}
                  className="flex items-center justify-between p-3 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" data-tooltip={iconTooltip}>
                      {icon}
                    </span>
                    <span className="font-medium text-white">
                      {name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-lg font-bold text-white"
                      data-tooltip={`Exact: ${exactAmount.toLocaleString()}`}
                    >
                      {formatNumber(data.amount)}
                    </span>
                    {data.productionRate > 0 && (
                      <span
                        className="text-xs text-green-400"
                        data-tooltip={`Exact: ${data.productionRate.toFixed(1)}/min`}
                      >
                        {formatNumber(data.productionRate)}/min
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700/30 text-center">
            <p className="text-gray-400">No resources yet. Visit a biome to start gathering!</p>
          </div>
        )}
      </div>

      {/* Food Overview */}
      <div className="bg-gray-800/85 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-green-300 flex items-center gap-2">
          🍽️ Food
        </h2>

        {/* Food Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Food Types"
            value={`${unlockedFoodTypes}/${totalFoodTypes}`}
            icon="🔓"
          />
          <StatCard
            label="Total Food"
            value={formatNumber(totalFoodAmount)}
            icon="🍴"
          />
        </div>

        {/* Food List */}
        {foods.length > 0 ? (
          <div className="bg-gray-900/50 rounded-lg border border-gray-700/30 divide-y divide-gray-700/30">
            {foods.map(([foodId, data]) => {
              const foodItem = FOOD_ITEMS[foodId as FoodId];
              const name = foodItem?.name || foodId;
              const icon = foodItem?.icon || "🍽️";
              const description = foodItem?.description || '';
              const flavorText = foodItem?.flavorText;
              const descriptionText = flavorText
                ? `${description}\n\n"${flavorText}"`
                : description;
              const exactAmount = Math.floor(data.amount);
              const iconTooltip = `${descriptionText}\n\nAmount: ${exactAmount.toLocaleString()}`;

              return (
                <div
                  key={foodId}
                  className="flex items-center justify-between p-3 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" data-tooltip={iconTooltip}>
                      {icon}
                    </span>
                    <span className="font-medium text-white">
                      {name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-lg font-bold text-white"
                      data-tooltip={`Exact: ${exactAmount.toLocaleString()}`}
                    >
                      {formatNumber(data.amount)}
                    </span>
                    {data.productionRate > 0 && (
                      <span
                        className="text-xs text-green-400"
                        data-tooltip={`Exact: ${data.productionRate.toFixed(1)}/min`}
                      >
                        {formatNumber(data.productionRate)}/min
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700/30 text-center">
            <p className="text-gray-400">No food yet. Explore biomes to discover food!</p>
          </div>
        )}
      </div>

      {/* Exploration Stats */}
      <div className="bg-gray-800/85 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
          🗺️ Exploration
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Biomes Unlocked"
            value={state.unlockedBiomes.length}
            max={6}
            icon="🌍"
          />
          <StatCard
            label="Expeditions"
            value={state.expeditionCount}
            icon="🚀"
          />
        </div>
      </div>

      {/* Production Stats */}
      <div className="bg-gray-800/85 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
          🏭 Production
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Automations Built"
            value={`${builtAutomations}/${totalAutomationTypes}`}
            icon="⚙️"
          />
          <StatCard
            label="Total Levels"
            value={totalAutomationLevels}
            icon="⬆️"
          />
        </div>
      </div>

      {/* Power Cell Stats */}
      <div className="bg-gray-800/85 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-orange-300 flex items-center gap-2">
          🔋 Power Cells
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Found"
            value={powerCellStats.green + powerCellStats.blue + powerCellStats.orange}
            icon="💫"
          />
          <StatCard
            label="Installed"
            value={powerCellStats.installed}
            icon="⚡"
          />
          <StatCard
            label="In Inventory"
            value={powerCellStats.inInventory}
            icon="📦"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Green"
            value={powerCellStats.green}
            icon="🟢"
          />
          <StatCard
            label="Blue"
            value={powerCellStats.blue}
            icon="🔵"
          />
          <StatCard
            label="Orange"
            value={powerCellStats.orange}
            icon="🟠"
          />
        </div>
      </div>

      {/* Crashes Stats (only show if player has crashed) */}
      {prestigeStats.totalPrestiges > 0 && (
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-lg border border-purple-500/50 p-4 space-y-3">
          <h2 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
            ✨ Crashes
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Total Crashes"
              value={prestigeStats.totalPrestiges}
              icon="🔄"
            />
            <StatCard
              label="Cosmic Bamboo"
              value={prestigeStats.cosmicBambooShards}
              icon="🎋"
            />
            <StatCard
              label="Skills Unlocked"
              value={prestigeStats.unlockedSkills}
              icon="🌟"
            />
          </div>
        </div>
      )}

      {/* Save Management */}
      <SaveManager />

      {/* Game Info */}
      <div className="bg-gray-800/85 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4">
        <h2 className="text-lg font-semibold text-gray-300 flex items-center gap-2 mb-2">
          ℹ️ Game Info
        </h2>
        <div className="text-sm text-gray-400 space-y-1">
          <p>Version: {state.version}</p>
          <p className="text-xs text-gray-500 mt-2">
            Your game auto-saves every time something changes.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <BackgroundWrapper
      backgroundPath={getBiomeBackgroundPath('skills_stats')}
      fallbackGradient={getFallbackGradient('skills_stats')}
      overlayOpacity={50}
    >
      {statisticsContent}
    </BackgroundWrapper>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  max?: number;
  icon: string;
}

const StatCard = memo(function StatCard({ label, value, max, icon }: StatCardProps) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-400 uppercase font-semibold">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-white">
        {value}
        {max !== undefined && <span className="text-sm text-gray-400">/{max}</span>}
      </div>
    </div>
  );
});
