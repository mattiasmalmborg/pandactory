import { useMemo, memo, useState } from 'react';
import { useGame } from '../../game/state/GameContext';
import { RESOURCES } from '../../game/config/resources';
import { FOOD_ITEMS } from '../../game/config/food';
import { AUTOMATIONS } from '../../game/config/automations';
import { formatNumber } from '../../utils/formatters';
import { createProductionContext, getAutomationProductionRate } from '../../utils/calculations';
import { ResourceId, FoodId, BiomeId } from '../../types/game.types';
import { SaveManager } from './SaveManager';
import { BackgroundWrapper } from './BackgroundWrapper';
import { getBiomeBackgroundPath, getFallbackGradient } from '../../config/assets';
import { calculateBiomeProductionRates } from '../../utils/allocation';
import { SKILL_TREE, getSkillTreeBonus } from '../../game/config/skillTree';
import { RESEARCH_NODES } from '../../game/config/research';
import { ARTIFACT_TEMPLATES, getActiveSetBonuses, SET_BONUSES } from '../../game/config/artifacts';
import { getMasteryBonus, hasAllAchievements } from '../../game/config/achievements';

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

      {/* Active Bonuses */}
      <ActiveBonuses />

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

// === Collapsible Card ===

function CollapsibleCard({ title, icon, color, children, defaultOpen = false }: {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-700/30 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className={`font-semibold text-sm ${color}`}>{title}</span>
        </div>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1 border-t border-gray-700/30 pt-2">
          {children}
        </div>
      )}
    </div>
  );
}

// === Bonus Row ===

function BonusRow({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex items-start justify-between text-xs py-0.5">
      <span className="text-gray-300">{label}</span>
      <div className="text-right">
        <span className="text-white font-medium">{value}</span>
        {detail && <span className="text-gray-500 ml-1">({detail})</span>}
      </div>
    </div>
  );
}

// === Active Bonuses Section ===

function ActiveBonuses() {
  const { state } = useGame();

  const skillBonuses = useMemo(() => {
    const skills = state.prestige.unlockedSkills;
    if (skills.length === 0) return null;

    const production = getSkillTreeBonus(skills, 'production_speed');
    const buildCost = getSkillTreeBonus(skills, 'build_cost_reduction');
    const upgradeCost = getSkillTreeBonus(skills, 'upgrade_cost_reduction');
    const allCost = getSkillTreeBonus(skills, 'all_cost_reduction');
    const expTime = getSkillTreeBonus(skills, 'expedition_time_reduction');
    const expFood = getSkillTreeBonus(skills, 'expedition_food_reduction');
    const expResource = getSkillTreeBonus(skills, 'expedition_resource_bonus');
    const cellEff = getSkillTreeBonus(skills, 'power_cell_effectiveness');
    const cellRes = getSkillTreeBonus(skills, 'power_cell_resonance');
    const cellDrop = getSkillTreeBonus(skills, 'power_cell_drop_bonus');
    const hasInstantBiome = skills.includes('exp_4');
    const hasSingularity = skills.includes('cell_5');

    const entries: { label: string; value: string; detail: string }[] = [];
    if (production > 0) entries.push({ label: 'Production Speed', value: `+${Math.round(production * 100)}%`, detail: skills.filter(s => SKILL_TREE[s].effect.type === 'production_speed').map(s => SKILL_TREE[s].name).join(', ') });
    if (buildCost > 0) entries.push({ label: 'Build Cost', value: `-${Math.round(buildCost * 100)}%`, detail: skills.filter(s => SKILL_TREE[s].effect.type === 'build_cost_reduction').map(s => SKILL_TREE[s].name).join(', ') });
    if (upgradeCost > 0) entries.push({ label: 'Upgrade Cost', value: `-${Math.round(upgradeCost * 100)}%`, detail: skills.filter(s => SKILL_TREE[s].effect.type === 'upgrade_cost_reduction').map(s => SKILL_TREE[s].name).join(', ') });
    if (allCost > 0) entries.push({ label: 'All Costs', value: `-${Math.round(allCost * 100)}%`, detail: skills.filter(s => SKILL_TREE[s].effect.type === 'all_cost_reduction').map(s => SKILL_TREE[s].name).join(', ') });
    if (expTime > 0) entries.push({ label: 'Expedition Duration', value: `-${Math.round(expTime * 100)}%`, detail: skills.filter(s => SKILL_TREE[s].effect.type === 'expedition_time_reduction').map(s => SKILL_TREE[s].name).join(', ') });
    if (expFood > 0) entries.push({ label: 'Expedition Food Cost', value: `-${Math.round(expFood * 100)}%`, detail: skills.filter(s => SKILL_TREE[s].effect.type === 'expedition_food_reduction').map(s => SKILL_TREE[s].name).join(', ') });
    if (expResource > 0) entries.push({ label: 'Expedition Resources', value: `+${Math.round(expResource * 100)}%`, detail: skills.filter(s => SKILL_TREE[s].effect.type === 'expedition_resource_bonus').map(s => SKILL_TREE[s].name).join(', ') });
    if (cellEff > 0) entries.push({ label: 'Power Cell Effectiveness', value: `+${Math.round(cellEff * 100)}%`, detail: skills.filter(s => SKILL_TREE[s].effect.type === 'power_cell_effectiveness').map(s => SKILL_TREE[s].name).join(', ') });
    if (cellRes > 0) entries.push({ label: 'Cell Resonance', value: `+${Math.round(cellRes * 100)}%/cell${hasSingularity ? ' (2x)' : ''}`, detail: skills.filter(s => SKILL_TREE[s].effect.type === 'power_cell_resonance').map(s => SKILL_TREE[s].name).join(', ') });
    if (cellDrop > 0) entries.push({ label: 'Power Cell Drops', value: `+${Math.round(cellDrop * 100)}%`, detail: skills.filter(s => SKILL_TREE[s].effect.type === 'power_cell_drop_bonus').map(s => SKILL_TREE[s].name).join(', ') });
    if (hasInstantBiome) entries.push({ label: 'Instant First Biome', value: 'Active', detail: 'Deja Vu Explorer' });

    return entries.length > 0 ? entries : null;
  }, [state.prestige.unlockedSkills]);

  const researchBonuses = useMemo(() => {
    const levels = state.research?.levels || {};
    const entries: { label: string; value: string; detail: string }[] = [];

    for (const [id, level] of Object.entries(levels)) {
      if (!level || level <= 0) continue;
      const node = RESEARCH_NODES[id as keyof typeof RESEARCH_NODES];
      if (!node) continue;
      const totalBonus = node.bonusPerLevel * level;
      const isReduction = node.bonusType.includes('cost') || node.bonusType.includes('food') || node.bonusType.includes('waste') || node.bonusType.includes('time');
      entries.push({
        label: node.name,
        value: `${isReduction ? '-' : '+'}${Math.round(totalBonus * 100)}%`,
        detail: `Lv.${level}/${node.maxLevel}`,
      });
    }

    return entries.length > 0 ? entries : null;
  }, [state.research?.levels]);

  const artifactBonuses = useMemo(() => {
    const inventory = state.artifacts?.inventory || [];
    const equipped = inventory.filter(a => a.equipped && a.status === 'analyzed');
    if (equipped.length === 0) return null;

    return equipped.map(a => {
      const template = ARTIFACT_TEMPLATES[a.templateId];
      return {
        label: `${template.icon} ${template.name}`,
        value: template.description,
        detail: template.rarity,
      };
    });
  }, [state.artifacts?.inventory]);

  const setBonus = useMemo(() => {
    const inventory = state.artifacts?.inventory || [];
    const activeSets = getActiveSetBonuses(inventory);
    if (activeSets.size === 0) return null;

    const entries: { label: string; value: string; detail: string }[] = [];
    for (const [biome, count] of activeSets) {
      const bonus = SET_BONUSES[biome as BiomeId];
      if (!bonus) continue;
      entries.push({
        label: bonus.name,
        value: count >= 3 ? bonus.threeBonus : bonus.twoBonus,
        detail: `${count}/3`,
      });
    }
    return entries.length > 0 ? entries : null;
  }, [state.artifacts?.inventory]);

  const masteryActive = useMemo(() => {
    const unlocked = state.achievements?.unlocked || [];
    if (!hasAllAchievements(unlocked)) return null;
    const bonus = getMasteryBonus(unlocked);
    return [
      { label: 'Production Bonus', value: `+${Math.round(bonus.productionBonus * 100)}%`, detail: 'All achievements' },
      { label: 'Cost Reduction', value: `-${Math.round(bonus.costReduction * 100)}%`, detail: 'All achievements' },
    ];
  }, [state.achievements?.unlocked]);

  const hasAnyBonus = skillBonuses || researchBonuses || artifactBonuses || setBonus || masteryActive;

  if (!hasAnyBonus) return null;

  return (
    <div className="bg-gray-800/85 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 space-y-3">
      <h2 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
        Active Bonuses
      </h2>

      {skillBonuses && (
        <CollapsibleCard title="Skill Tree" icon="🌟" color="text-purple-300" defaultOpen>
          {skillBonuses.map((b, i) => (
            <BonusRow key={i} label={b.label} value={b.value} detail={b.detail} />
          ))}
        </CollapsibleCard>
      )}

      {researchBonuses && (
        <CollapsibleCard title="Research Lab" icon="🔬" color="text-cyan-300">
          <p className="text-[10px] text-gray-500 mb-1">Resets on prestige</p>
          {researchBonuses.map((b, i) => (
            <BonusRow key={i} label={b.label} value={b.value} detail={b.detail} />
          ))}
        </CollapsibleCard>
      )}

      {artifactBonuses && (
        <CollapsibleCard title="Equipped Artifacts" icon="🏺" color="text-amber-300">
          {artifactBonuses.map((b, i) => (
            <div key={i} className="text-xs py-0.5">
              <div className="flex items-start justify-between">
                <span className="text-gray-300">{b.label}</span>
                <span className="text-gray-500 capitalize">{b.detail}</span>
              </div>
              <p className="text-white/70 text-[11px] mt-0.5">{b.value}</p>
            </div>
          ))}
        </CollapsibleCard>
      )}

      {setBonus && (
        <CollapsibleCard title="Set Bonuses" icon="🎯" color="text-green-300">
          {setBonus.map((b, i) => (
            <BonusRow key={i} label={b.label} value={b.value} detail={b.detail} />
          ))}
        </CollapsibleCard>
      )}

      {masteryActive && (
        <CollapsibleCard title="Mastery" icon="👑" color="text-yellow-300">
          {masteryActive.map((b, i) => (
            <BonusRow key={i} label={b.label} value={b.value} detail={b.detail} />
          ))}
        </CollapsibleCard>
      )}
    </div>
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
