import { useState, useEffect, useCallback, useMemo } from "react";
import { useGame } from "../../game/state/GameContext";
import { BIOMES } from "../../game/config/biomes";
import { RESOURCES } from "../../game/config/resources";
import { AUTOMATIONS } from "../../game/config/automations";
import { POWER_CELLS } from "../../game/config/powerCells";
import { AutomationCard } from "../automation/AutomationCard";
import { BuildAutomation } from "../automation/BuildAutomation";
import { BiomeNav, BIOME_ORDER } from "../navigation/BiomeNav";
import { BiomeIntroPopup } from "./BiomeIntroPopup";
import { useSwipe } from "../../hooks/useSwipe";
import { BiomeId, ResourceId, FoodId } from "../../types/game.types";
import { calculateLevelUpCost, calculateProductionRate, applyCostReduction } from "../../utils/calculations";
import { getSkillTreeBonus, countInstalledPowerCells, getEffectivePowerCellBonus } from "../../game/config/skillTree";
import { getMasteryBonus } from "../../game/config/achievements";
import { getResearchBonus } from "../../game/config/research";
import { hasArtifactEffect } from "../../game/config/artifacts";
import { calculateBiomeProductionRates } from "../../utils/allocation";
import { AnimatedResourceRow } from "../ui/AnimatedResourceRow";

interface BiomeViewProps {
  biomeId: BiomeId;
}

// Track which biomes have shown their intro popup this session
const shownIntros = new Set<BiomeId>();

export function BiomeView({ biomeId }: BiomeViewProps) {
  const { state, dispatch } = useGame();
  const [powerCellModal, setPowerCellModal] = useState<{ automationId: string } | null>(null);
  const [showBiomeIntro, setShowBiomeIntro] = useState(false);
  const biome = state.biomes[biomeId];
  const biomeConfig = BIOMES[biomeId];

  // Swipe navigation between biomes
  const navigateToBiome = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = BIOME_ORDER.indexOf(biomeId);
    if (currentIndex === -1) return;

    // Find next/prev unlocked biome
    const step = direction === 'next' ? 1 : -1;
    let targetIndex = currentIndex + step;

    while (targetIndex >= 0 && targetIndex < BIOME_ORDER.length) {
      const targetBiome = BIOME_ORDER[targetIndex];
      if (state.unlockedBiomes.includes(targetBiome)) {
        dispatch({ type: 'SWITCH_BIOME', payload: { biomeId: targetBiome } });
        return;
      }
      targetIndex += step;
    }
  }, [biomeId, state.unlockedBiomes, dispatch]);

  const swipeRef = useSwipe<HTMLDivElement>({
    onSwipeLeft: () => navigateToBiome('next'),
    onSwipeRight: () => navigateToBiome('prev'),
    minSwipeDistance: 50,
    maxSwipeTime: 400,
  });

  // Show intro popup when visiting a discovered but not yet activated biome
  // (not lush_forest since it's the starting biome)
  useEffect(() => {
    if (
      biomeId !== 'lush_forest' &&
      biome.discovered &&
      !biome.activated &&
      !shownIntros.has(biomeId)
    ) {
      shownIntros.add(biomeId);
      setShowBiomeIntro(true);
    }
  }, [biomeId, biome.discovered, biome.activated]);

  // Handle closing the intro popup - activates the biome
  const handleCloseIntro = () => {
    setShowBiomeIntro(false);
    // Activate the biome when closing the intro
    if (!biome.activated) {
      dispatch({
        type: "ACTIVATE_BIOME",
        payload: { biomeId },
      });
    }
  };

  // Calculate production and consumption rates (memoized)
  // NOTE: All hooks must be above any early returns to satisfy React rules of hooks
  const { production, consumption, foodProduction } = useMemo(() => {
    // Pass context for accurate calculations including skill bonuses and power cells
    const context = {
      unlockedSkills: state.prestige.unlockedSkills,
      unlockedAchievements: state.achievements?.unlocked || [],
      allBiomes: state.biomes,
      researchLevels: state.research?.levels || {},
    };
    const { production, consumption } = calculateBiomeProductionRates(biome, context);

    // Get skill and mastery bonuses for food production
    const productionSpeedBonus = getSkillTreeBonus(state.prestige.unlockedSkills, 'production_speed');
    const masteryBonus = getMasteryBonus(state.achievements?.unlocked || []);
    const totalInstalledCells = countInstalledPowerCells(state.biomes);

    // Calculate food production rates using same logic as resource production
    const foodProd: Record<string, number> = {};
    biome.automations.forEach(automation => {
      const config = AUTOMATIONS[automation.type];
      if (!config || !config.producesFood) return;

      // Skip paused automations
      if (automation.paused) return;

      // Calculate effective power cell bonus with skill bonuses
      const basePowerCellBonus = automation.powerCell?.bonus || 0;
      const effectivePowerCellBonus = getEffectivePowerCellBonus(
        basePowerCellBonus,
        totalInstalledCells,
        state.prestige.unlockedSkills
      );

      // Use same production rate calculation as for resources (with all bonuses)
      const effectiveRate = calculateProductionRate(
        config.baseProductionRate,
        automation.level,
        productionSpeedBonus + masteryBonus.productionBonus,
        effectivePowerCellBonus
      );

      config.producesFood.forEach(foodProduce => {
        const amount = foodProduce.amount * effectiveRate;
        foodProd[foodProduce.foodId] = (foodProd[foodProduce.foodId] || 0) + amount;
      });
    });

    return { production, consumption, foodProduction: foodProd };
  }, [biome, state.prestige.unlockedSkills, state.achievements?.unlocked, state.biomes, state.research?.levels]);

  // Collect biome resources and food (memoized)
  const allResourcesAndFood = useMemo(() => {
    // Collect biome resources (exclude food items - they come from state.food)
    // Only show resources with at least 1 whole unit
    const allResources = (Object.keys(biome.resources) as ResourceId[])
      .filter(
        (resourceId) =>
          Math.floor(biome.resources[resourceId] || 0) >= 1 &&
          RESOURCES[resourceId]?.category !== 'food' // Skip food items from biome.resources
      )
      .map((resourceId) => ({
        resourceId: resourceId,
        amount: biome.resources[resourceId] || 0,
        produced: production[resourceId] || 0,
        consumed: consumption[resourceId] || 0,
        isFood: false,
      }));

    // Add food items from state.food that are produced in THIS biome
    // Only show food if:
    // 1. It's a primary resource in this biome (like berries in lush_forest), OR
    // 2. It's being actively produced in this biome (production rate > 0)
    const allFoodIds = Object.keys(state.food) as FoodId[];
    const foodItems = allFoodIds
      .filter(foodId => {
        const isProducedHere = (foodProduction[foodId] || 0) > 0;
        const isPrimaryHere = biomeConfig.primaryResources.includes(foodId as unknown as ResourceId);
        return isProducedHere || isPrimaryHere;
      })
      .map(foodId => ({
        resourceId: foodId as unknown as ResourceId,
        amount: state.food[foodId] || 0,
        produced: foodProduction[foodId] || 0,
        consumed: 0,
        isFood: false,
      }));

    return [...allResources, ...foodItems];
  }, [biome.resources, state.food, production, consumption, foodProduction, biomeConfig.primaryResources]);

  // Biome progress stats
  const biomeStats = useMemo(() => {
    // Total possible resources: primary + discoverable + automation-produced (both resources and food)
    const allResourceIds = new Set<string>([
      ...(biomeConfig.primaryResources || []),
      ...(biomeConfig.discoverableResources || []),
    ]);
    const foodIds = new Set<string>();
    for (const autoType of biomeConfig.availableAutomations) {
      const autoConfig = AUTOMATIONS[autoType];
      if (!autoConfig) continue;
      for (const p of autoConfig.produces) {
        allResourceIds.add(p.resourceId);
      }
      if (autoConfig.producesFood) {
        for (const f of autoConfig.producesFood) {
          allResourceIds.add(f.foodId);
          foodIds.add(f.foodId);
        }
      }
    }
    // Primary food resources (e.g. berries) are also food
    for (const resId of biomeConfig.primaryResources) {
      if (resId in state.food) foodIds.add(resId);
    }
    const totalResources = allResourceIds.size;

    // Discovered: check biome.resources for regular resources, state.food for food items
    let discoveredCount = 0;
    for (const resId of allResourceIds) {
      if (foodIds.has(resId)) {
        if ((state.food[resId as FoodId] || 0) >= 1) discoveredCount++;
      } else {
        if ((biome.resources[resId as ResourceId] || 0) >= 1) discoveredCount++;
      }
    }

    // Automations: count built vs total available
    const totalAutomations = biomeConfig.availableAutomations.length;
    const builtAutomationTypes = new Set(biome.automations.map(a => a.type));
    const builtCount = builtAutomationTypes.size;

    return { discoveredCount, totalResources, builtCount, totalAutomations };
  }, [biome.resources, biome.automations, biomeConfig, state.food]);

  // Undiscovered biome — show placeholder (guard placed after all hooks)
  if (!biome.discovered) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold">{biomeConfig.name}</h2>
        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50 text-center">
          <p className="text-gray-400 mb-4">
            This biome has not been discovered yet.
          </p>
          <p className="text-sm text-gray-500">
            Send Dr. Redd Pawston III on an expedition to discover new biomes!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={swipeRef} className="pb-24">
      {/* Biome Quick-Switch Navigation */}
      <BiomeNav />

      <div className="p-4 space-y-4">
        {/* Header with description and progress */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4">
          <h2 className="text-xl font-bold text-white mb-2">{biomeConfig.name}</h2>
          <p className="text-sm text-gray-300 leading-relaxed italic mb-3">
            "{biomeConfig.description}"
          </p>
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-900/60 rounded-md px-3 py-1.5 text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Resources</p>
              <p className={`text-sm font-bold ${biomeStats.discoveredCount >= biomeStats.totalResources ? 'text-green-400' : 'text-white'}`}>
                {biomeStats.discoveredCount}/{biomeStats.totalResources}
              </p>
            </div>
            <div className="flex-1 bg-gray-900/60 rounded-md px-3 py-1.5 text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Automations</p>
              <p className={`text-sm font-bold ${biomeStats.builtCount >= biomeStats.totalAutomations ? 'text-green-400' : 'text-white'}`}>
                {biomeStats.builtCount}/{biomeStats.totalAutomations}
              </p>
            </div>
          </div>
        </div>

        {/* Resources & Food */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-300 uppercase">
            Resources & Food
          </h3>
          {allResourcesAndFood.length > 0 ? (
            <div className="bg-gray-800/85 backdrop-blur-sm rounded-lg border border-gray-700/50 divide-y divide-gray-700/50">
              {allResourcesAndFood.map(({ resourceId, amount, produced, consumed }) => (
                <AnimatedResourceRow
                  key={resourceId}
                  resourceId={resourceId}
                  amount={amount}
                  produced={produced}
                  consumed={consumed}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 text-center">
              <p className="text-gray-400 text-sm">
                No resources yet. Start gathering!
              </p>
            </div>
          )}
        </div>

        {/* Manual Gathering Area */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-300 uppercase">
            Manual Gathering
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {biomeConfig.primaryResources.map((resourceId) => {
              const resource = RESOURCES[resourceId];
              const isFood = resource?.category === 'food';
              return (
                <button
                  key={resourceId}
                  onClick={() => {
                    // Apply research gather bonus
                    const researchGatherBonus = getResearchBonus(state.research?.levels || {}, 'gather');
                    // Lucky Harvest artifact: 20% chance to double gather
                    const luckyHarvest = hasArtifactEffect(state.artifacts?.inventory || [], 'lucky_harvest') && Math.random() < 0.2;
                    const gatherAmount = (1 + researchGatherBonus) * (luckyHarvest ? 2 : 1);
                    // Dispatch to food or resource depending on category
                    if (isFood) {
                      dispatch({
                        type: "GATHER_FOOD",
                        payload: { foodId: resourceId as FoodId, amount: gatherAmount },
                      });
                    } else {
                      dispatch({
                        type: "GATHER_RESOURCE",
                        payload: { biomeId, resourceId, amount: gatherAmount },
                      });
                    }
                  }}
                  className="bg-gray-800/80 hover:bg-gray-700/90 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 transition-colors active:scale-95 active:bg-gray-600/90 flex flex-col items-center gap-2"
                  style={{ touchAction: 'manipulation', transitionDuration: '100ms' }}
                >
                  <span className="text-3xl">{resource?.icon ?? "❓"}</span>
                  <span className="text-xs text-gray-300 font-semibold">
                    {resource?.name ?? "Unknown"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Automations */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-300 uppercase">
            Automations ({biome.automations.length})
          </h3>
          {biome.automations.length > 0 ? (
            <div className="space-y-3">
              {biome.automations.map((automation) => {
                const config = AUTOMATIONS[automation.type];
                if (!config) return null;
                const baseUpgradeCost = calculateLevelUpCost(
                  config.baseCost,
                  automation.level,
                  config.levelUpCostMultiplier,
                );
                // Apply same cost reduction as UI display (mastery + research)
                const unlockedAchievements = state.achievements?.unlocked || [];
                const upgradeCost = applyCostReduction(baseUpgradeCost, unlockedAchievements, state.research?.levels, 'upgrade');

                return (
                  <AutomationCard
                    key={automation.id}
                    automation={automation}
                    biomeId={biomeId}
                    onUpgrade={() => {
                      // Deduct upgrade costs from biomes that HAVE the resources
                      upgradeCost.forEach((cost) => {
                        let remaining = cost.amount;
                        // Find biomes with this resource and deduct from them
                        for (const [bId, bState] of Object.entries(state.biomes)) {
                          if (remaining <= 0) break;
                          const available = bState.resources[cost.resourceId] || 0;
                          if (available > 0) {
                            const toDeduct = Math.min(available, remaining);
                            dispatch({
                              type: "GATHER_RESOURCE",
                              payload: {
                                biomeId: bId as BiomeId,
                                resourceId: cost.resourceId,
                                amount: -toDeduct,
                              },
                            });
                            remaining -= toDeduct;
                          }
                        }
                      });

                      // Upgrade the automation
                      dispatch({
                        type: "UPGRADE_AUTOMATION",
                        payload: { biomeId, automationId: automation.id },
                      });
                    }}
                    onInstallPowerCell={() => {
                      setPowerCellModal({ automationId: automation.id });
                    }}
                    onRemovePowerCell={() => {
                      dispatch({
                        type: "REMOVE_POWER_CELL",
                        payload: { biomeId, automationId: automation.id },
                      });
                    }}
                    onTogglePause={() => {
                      dispatch({
                        type: "TOGGLE_AUTOMATION_PAUSE",
                        payload: { biomeId, automationId: automation.id },
                      });
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 text-center">
              <p className="text-gray-400 text-sm">No automations built yet.</p>
              <p className="text-xs text-gray-500 mt-1">
                Build your first automation below!
              </p>
            </div>
          )}
        </div>

        {/* Build Automation */}
        <BuildAutomation
          biomeId={biomeId}
          availableAutomations={biomeConfig.availableAutomations}
        />
      </div>

      {/* Power Cell Selection Modal */}
      {powerCellModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-md rounded-lg border border-gray-700/50 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">
              Select Power Cell
            </h2>

            {state.powerCellInventory.length > 0 ? (
              <div className="space-y-2 mb-4">
                {/* Group power cells by tier */}
                {(['green', 'blue', 'orange'] as const).map((tier) => {
                  const count = state.powerCellInventory.filter(pc => pc.tier === tier).length;
                  if (count === 0) return null;
                  const cellDef = POWER_CELLS[tier];
                  return (
                    <button
                      key={tier}
                      onClick={() => {
                        // Find first power cell of this tier
                        const cellIndex = state.powerCellInventory.findIndex(pc => pc.tier === tier);
                        if (cellIndex !== -1) {
                          // Always use the defined bonus from POWER_CELLS to ensure correct value
                          // This handles legacy power cells that might not have bonus set
                          const powerCell = {
                            tier,
                            bonus: POWER_CELLS[tier].bonus,
                          };
                          // Install the power cell
                          dispatch({
                            type: "INSTALL_POWER_CELL",
                            payload: {
                              biomeId,
                              automationId: powerCellModal.automationId,
                              powerCell,
                            },
                          });
                          setPowerCellModal(null);
                        }
                      }}
                      className="w-full p-3 rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cellDef.icon}</span>
                          <div>
                            <div className="font-semibold text-white">{cellDef.name}</div>
                            <div className="text-xs text-green-400">+{Math.round(cellDef.bonus * 100)}% production</div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-300">x{count}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-900 p-4 rounded mb-4 text-center">
                <p className="text-gray-400">No power cells in inventory!</p>
                <p className="text-xs text-gray-500 mt-1">Complete expeditions to find power cells.</p>
              </div>
            )}

            <button
              onClick={() => setPowerCellModal(null)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Biome Introduction Popup */}
      {showBiomeIntro && (
        <BiomeIntroPopup
          biomeId={biomeId}
          onClose={handleCloseIntro}
        />
      )}
    </div>
  );
}
