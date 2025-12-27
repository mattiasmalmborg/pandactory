import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../game/state/GameContext';
import { EXPEDITION_TIERS, isExpeditionComplete, calculateExpeditionBonus, getScaledFoodCost } from '../../game/config/expeditions';
import { FOOD_ITEMS, calculateTotalNutrition, optimizeFoodSelection, calculateWastedNutrition } from '../../game/config/food';
import { createPowerCell } from '../../game/config/powerCells';
import { ExpeditionTier, FoodId } from '../../types/game.types';
import { ExpeditionRewards } from './ExpeditionRewards';
import { calculateExpeditionRewards } from '../../utils/expeditionRewards';
import { formatNumber } from '../../utils/formatters';
import { BiomeNav, BIOME_ORDER } from '../navigation/BiomeNav';
import { useSwipe } from '../../hooks/useSwipe';

export function ExpeditionLauncher() {
  const { state, dispatch } = useGame();
  const [selectedTier, setSelectedTier] = useState<ExpeditionTier>('quick_scout');
  const [foodSelection, setFoodSelection] = useState<{ id: FoodId; amount: number }[]>([]);
  const [autoFill, setAutoFill] = useState(true);
  const [showRewards, setShowRewards] = useState(false);
  const [calculatedRewards, setCalculatedRewards] = useState<ReturnType<typeof calculateExpeditionRewards> | null>(null);

  const tierConfig = EXPEDITION_TIERS[selectedTier];
  const unlockedBiomeCount = state.unlockedBiomes.length;
  const scaledFoodCost = getScaledFoodCost(tierConfig.foodCost, unlockedBiomeCount);
  const totalNutrition = calculateTotalNutrition(foodSelection);
  const hasEnoughFood = totalNutrition >= scaledFoodCost;
  const wastedNutrition = calculateWastedNutrition(foodSelection, scaledFoodCost);

  // Swipe navigation between biomes
  const navigateToBiome = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = BIOME_ORDER.indexOf(state.player.currentBiome);
    if (currentIndex === -1) return;

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
  }, [state.player.currentBiome, state.unlockedBiomes, dispatch]);

  const swipeRef = useSwipe<HTMLDivElement>({
    onSwipeLeft: () => navigateToBiome('next'),
    onSwipeRight: () => navigateToBiome('prev'),
    minSwipeDistance: 50,
    maxSwipeTime: 400,
  });

  const canAffordFood = foodSelection.every(
    (f) => (state.food[f.id] || 0) >= f.amount
  );

  const canStartExpedition = hasEnoughFood && canAffordFood && state.panda.status === 'home';

  // Check if expedition is complete
  const expeditionComplete = state.panda.expedition && isExpeditionComplete(state.panda.expedition);

  // Auto-fill when tier changes, auto-fill is enabled, or food inventory changes
  useEffect(() => {
    if (autoFill) {
      // Convert food to integers before optimization
      const integerFood = Object.fromEntries(
        Object.entries(state.food).map(([id, amount]) => [id, Math.floor(amount)])
      ) as Record<FoodId, number>;
      const optimized = optimizeFoodSelection(scaledFoodCost, integerFood);
      setFoodSelection(optimized);
    }
  }, [selectedTier, autoFill, state.food, scaledFoodCost]);

  const optimizeSelection = () => {
    // Convert food to integers before optimization
    const integerFood = Object.fromEntries(
      Object.entries(state.food).map(([id, amount]) => [id, Math.floor(amount)])
    ) as Record<FoodId, number>;
    const optimized = optimizeFoodSelection(scaledFoodCost, integerFood);
    setFoodSelection(optimized);
  };

  const startExpedition = () => {
    if (!canStartExpedition) {
      alert('Cannot start expedition!');
      return;
    }

    dispatch({
      type: 'START_EXPEDITION',
      payload: {
        tier: selectedTier,
        foodConsumed: foodSelection,
      },
    });
  };

  const collectRewards = () => {
    if (!state.panda.expedition || !expeditionComplete) return;

    // Calculate bonus
    const bonus = calculateExpeditionBonus(state.panda.expedition);

    // Gather all discovered resources from ALL biomes to prevent re-discovery
    const allDiscoveredResources = Object.values(state.biomes)
      .flatMap(b => b.discoveredResources || [])
      .filter((v, i, a) => a.indexOf(v) === i); // unique

    // Calculate rewards (pass pity counters for hidden bonuses)
    const rewards = calculateExpeditionRewards(
      state.panda.expedition.tier,
      bonus,
      state.unlockedBiomes,
      state.player.currentBiome,
      allDiscoveredResources,
      state.expeditionPityCounter || 0,
      state.powerCellPityCounter || 0
    );

    // Convert PowerCellTier[] to PowerCell[] using createPowerCell to ensure bonus is set
    const powerCellObjects = rewards.powerCells.map(tier => createPowerCell(tier));

    // IMMEDIATELY dispatch COLLECT_EXPEDITION to clear expedition from state
    // This prevents the loop if user presses F5 during the rewards modal
    dispatch({
      type: 'COLLECT_EXPEDITION',
      payload: {
        rewards: rewards.resources.reduce((acc, r) => {
          acc[r.resourceId] = r.amount;
          return acc;
        }, {} as Record<string, number>),
        powerCells: powerCellObjects,
        newBiome: rewards.newBiome || null,
        newResources: rewards.newResources,
      },
    });

    // Now show the rewards modal (state is already updated)
    setCalculatedRewards(rewards);
    setShowRewards(true);
  };

  const handleRewardsClose = () => {
    // Just close the modal - expedition already collected
    setShowRewards(false);
    setCalculatedRewards(null);
  };

  const addFood = (foodId: FoodId) => {
    setAutoFill(false); // Disable auto-fill when manually changing
    const existing = foodSelection.find((f) => f.id === foodId);
    if (existing) {
      setFoodSelection(
        foodSelection.map((f) =>
          f.id === foodId ? { ...f, amount: f.amount + 1 } : f
        )
      );
    } else {
      setFoodSelection([...foodSelection, { id: foodId, amount: 1 }]);
    }
  };

  const removeFood = (foodId: FoodId) => {
    setAutoFill(false); // Disable auto-fill when manually changing
    setFoodSelection(
      foodSelection
        .map((f) => (f.id === foodId ? { ...f, amount: f.amount - 1 } : f))
        .filter((f) => f.amount > 0)
    );
  };

  // Show rewards modal - but only if expedition is actually still in state
  // (This check prevents showing modal after state has been cleared)
  if (showRewards && calculatedRewards && state.panda.status === 'home') {
    return (
      <ExpeditionRewards
        rewards={calculatedRewards.resources}
        powerCells={calculatedRewards.powerCells}
        newBiome={calculatedRewards.newBiome}
        newResources={calculatedRewards.newResources}
        onClose={handleRewardsClose}
      />
    );
  }

  // If expedition is in progress
  if (state.panda.status === 'expedition') {
    // If expedition is complete, show collect button
    if (expeditionComplete) {
      return (
        <div ref={swipeRef} className="pb-24">
          <BiomeNav />
          <div className="p-4 space-y-4">
            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl border-2 border-green-500 p-6 shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Expedition Complete!
                </h2>
                <p className="text-green-200">Dr. Redd Pawston III has returned with treasures!</p>
              </div>

              <button
                onClick={collectRewards}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
              >
                Collect Rewards! 🎁
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Expedition in progress - ExpeditionTimer handles the popup UI
    return (
      <div ref={swipeRef} className="pb-24">
        <BiomeNav />
      </div>
    );
  }

  return (
    <div ref={swipeRef} className="pb-24">
      <BiomeNav />
      <div className="p-4 space-y-4">
      {/* Header Card - same style as biome menu */}
      <div className="bg-gray-800/85 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4">
        <h2 className="text-xl font-bold text-white mb-2">Start Expedition</h2>
        <p className="text-sm text-gray-300">
          Send Dr. Redd Pawston III exploring to discover new biomes, hidden resources in the current biome, power cells, and gather materials. Longer expeditions have better discovery chances. Building and upgrading is locked while away.
        </p>
      </div>

      {/* Tier Selection */}
      <div className="space-y-2">
        <h3 className="text-md font-semibold text-white">Expedition Tier</h3>
        {(Object.keys(EXPEDITION_TIERS) as ExpeditionTier[]).map((tier) => {
          const config = EXPEDITION_TIERS[tier];
          const tierScaledCost = getScaledFoodCost(config.foodCost, unlockedBiomeCount);
          return (
            <div
              key={tier}
              className={`p-4 rounded-lg border cursor-pointer backdrop-blur-sm transition-all ${
                selectedTier === tier
                  ? 'border-blue-500 bg-gray-700/90 shadow-lg'
                  : 'border-gray-700/50 bg-gray-800/80 hover:bg-gray-700/90 hover:border-gray-600'
              }`}
              onClick={() => setSelectedTier(tier)}
            >
              {/* Title */}
              <div className="font-bold text-white text-lg mb-1.5">{config.name}</div>

              {/* Description */}
              <p className="text-sm text-gray-300 italic leading-relaxed mb-2">
                {config.description}
              </p>

              {/* Stats boxes */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                {/* Duration box */}
                <div className="bg-gray-900/50 rounded-md px-2.5 py-1.5 flex items-center gap-2">
                  <span className="text-lg">⏱️</span>
                  <div className="text-white font-semibold text-sm">{config.durationMinutes}min</div>
                </div>

                {/* Food cost box */}
                <div className="bg-gray-900/50 rounded-md px-2.5 py-1.5 flex items-center gap-2">
                  <span className="text-lg">🍽️</span>
                  <div className="text-yellow-400 font-semibold text-sm">{formatNumber(tierScaledCost)}</div>
                </div>
              </div>

              {/* Discovery chances row */}
              <div className="grid grid-cols-2 gap-2">
                {/* Biome discovery chance */}
                <div className="bg-gray-900/50 rounded-md px-2.5 py-1.5 flex items-center gap-2">
                  <span className="text-lg">🗺️</span>
                  <div>
                    <div className="text-purple-400 font-semibold text-sm">{Math.round(config.biomeDiscoveryChance * 100)}%</div>
                    <div className="text-gray-500 text-[10px]">new biome</div>
                  </div>
                </div>

                {/* Resource discovery chance */}
                <div className="bg-gray-900/50 rounded-md px-2.5 py-1.5 flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <div>
                    <div className="text-cyan-400 font-semibold text-sm">{Math.round(config.resourceDiscoveryChance * 100)}%</div>
                    <div className="text-gray-500 text-[10px]">per resource</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Food Selection Card */}
      <div className="bg-gray-800/85 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4">
        {/* Header with progress bar */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-semibold text-white flex items-center gap-2">
            <span className="text-lg">🎒</span>
            Pack Food
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={optimizeSelection}
              className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              ⚡ Auto-fill
            </button>
            <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer bg-gray-700/50 px-2 py-1 rounded-md">
              <input
                type="checkbox"
                checked={autoFill}
                onChange={(e) => setAutoFill(e.target.checked)}
                className="cursor-pointer accent-blue-500"
              />
              Keep filled
            </label>
          </div>
        </div>

        {/* Nutrition progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Nutrition packed</span>
            <span className={totalNutrition >= scaledFoodCost ? 'text-green-400 font-semibold' : 'text-yellow-400'}>
              {formatNumber(totalNutrition)} / {formatNumber(scaledFoodCost)}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                totalNutrition >= scaledFoodCost
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-400'
              }`}
              style={{ width: `${Math.min((totalNutrition / scaledFoodCost) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Waste warning */}
        {wastedNutrition > 0 && (
          <div className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-700/50 rounded-md p-2 mb-3 flex items-center gap-2">
            <span>⚠️</span>
            <span>{wastedNutrition} nutrition will be wasted (only exact amount needed is consumed)</span>
          </div>
        )}

        {/* Food grid */}
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(FOOD_ITEMS) as FoodId[]).map((foodId) => {
            const food = FOOD_ITEMS[foodId];
            const selected = foodSelection.find((f) => f.id === foodId)?.amount || 0;
            const available = Math.floor(state.food[foodId] || 0);

            // Only show food that player has discovered
            const isDiscovered = foodId === 'berries' || available >= 1;
            if (!isDiscovered) return null;

            const isSelected = selected > 0;

            return (
              <div
                key={foodId}
                className={`p-2.5 rounded-lg border transition-all flex flex-col ${
                  isSelected
                    ? 'border-green-600/50 bg-green-900/20'
                    : 'border-gray-700/50 bg-gray-900/30'
                }`}
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white flex items-center gap-1">
                    <span>{food.icon}</span>
                    <span>{food.name}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    <span className="text-amber-400">{food.nutritionValue}</span> nutr • <span className="text-gray-300">{formatNumber(available)}</span> avail
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-gray-700/30">
                  <button
                    onClick={() => removeFood(foodId)}
                    disabled={selected === 0}
                    className="w-7 h-7 text-sm bg-gray-700 hover:bg-red-700 text-white rounded disabled:opacity-30 disabled:hover:bg-gray-700 transition-colors font-bold"
                  >
                    −
                  </button>
                  <span className="min-w-[2.5rem] text-center text-white font-semibold text-sm">{formatNumber(selected)}</span>
                  <button
                    onClick={() => addFood(foodId)}
                    disabled={selected >= available}
                    className="w-7 h-7 text-sm bg-gray-700 hover:bg-green-700 text-white rounded disabled:opacity-30 disabled:hover:bg-gray-700 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={startExpedition}
        disabled={!canStartExpedition}
        className={`w-full py-3 rounded font-bold ${
          canStartExpedition
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {!hasEnoughFood
          ? 'Need more food!'
          : !canAffordFood
          ? 'Not enough food in inventory!'
          : 'Start Expedition'}
      </button>
      </div>
    </div>
  );
}
