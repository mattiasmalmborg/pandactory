import { useState } from 'react';
import { useGame } from '../../game/state/GameContext';
import { RESOURCES } from '../../game/config/resources';
import { formatNumber } from '../../utils/formatters';
import { ResourceId } from '../../types/game.types';
import { PrestigeDialog } from '../prestige/PrestigeDialog';

const SPACESHIP_PARTS: ResourceId[] = [
  'microchips',
  'rocket_fuel',
  'thrusters',
  'oxygen_tanks',
  'batteries',
  'solar_arrays',
  'titanium_hull',
];

const REQUIRED_AMOUNT = 100; // Amount needed of each part

export function SpaceshipGoal() {
  const { state, dispatch } = useGame();
  const [showPrestigeDialog, setShowPrestigeDialog] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default

  // Calculate total amounts across all biomes
  const partInventory: Record<string, number> = {};
  const discoveredParts: Set<ResourceId> = new Set();

  SPACESHIP_PARTS.forEach(partId => {
    partInventory[partId] = 0;
  });

  // Check discovered resources across all biomes
  state.unlockedBiomes.forEach(biomeId => {
    const biome = state.biomes[biomeId];

    // Track discovered resources
    if (biome.discoveredResources) {
      biome.discoveredResources.forEach(resId => {
        if (SPACESHIP_PARTS.includes(resId as ResourceId)) {
          discoveredParts.add(resId as ResourceId);
        }
      });
    }

    // Calculate inventory
    Object.entries(biome.resources).forEach(([resourceId, amount]) => {
      if (SPACESHIP_PARTS.includes(resourceId as ResourceId)) {
        partInventory[resourceId] = (partInventory[resourceId] || 0) + amount;
        discoveredParts.add(resourceId as ResourceId);
      }
    });
  });

  // Calculate progress (use Math.floor to avoid float precision issues)
  const completedParts = SPACESHIP_PARTS.filter(
    partId => Math.floor(partInventory[partId]) >= REQUIRED_AMOUNT
  ).length;
  const totalParts = SPACESHIP_PARTS.length;
  const progressPercent = Math.round((completedParts / totalParts) * 100);
  const isComplete = completedParts === totalParts;

  // Check if we've started producing any spaceship parts
  const hasStartedProduction = discoveredParts.size > 0;

  // Calculate shards to earn (base 2 for completion)
  const shardsToEarn = isComplete ? 2 : 0;

  const handlePrestige = () => {
    dispatch({
      type: 'PRESTIGE',
      payload: {
        shardsEarned: shardsToEarn,
      },
    });
    setShowPrestigeDialog(false);
  };

  return (
    <div className={`rounded-lg border transition-all ${
      isComplete
        ? 'bg-green-900/85 border-green-500'
        : hasStartedProduction
        ? 'bg-purple-900/85 border-purple-500'
        : 'bg-purple-900/30 border-purple-500'
    }`}>
      {/* Header - Always visible, clickable to toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-4 text-center hover:bg-white/5 transition-colors rounded-t-lg"
      >
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            🚀 S.S. Bamboozle Construction
          </h2>
          <span className="text-gray-400 text-sm">
            {isCollapsed ? '▼' : '▲'}
          </span>
        </div>
        <p className="text-xs text-gray-300 italic mt-1">
          Build your escape vehicle to get Dr. Redd Pawston III home!
        </p>
        <div className="flex items-center justify-center gap-2 text-xs mt-2">
          <span className="text-gray-400">Progress:</span>
          <span className={`font-bold ${
            isComplete ? 'text-green-400' : 'text-purple-300'
          }`}>
            {completedParts}/{totalParts} parts ({progressPercent}%)
          </span>
        </div>
      </button>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="p-4 pt-0 space-y-3">

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">Progress</span>
          <span className={`font-bold ${
            isComplete ? 'text-green-400' : 'text-purple-300'
          }`}>
            {completedParts}/{totalParts} parts ({progressPercent}%)
          </span>
        </div>
        <div className="bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isComplete ? 'bg-green-500' : 'bg-purple-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Parts List */}
      <div className="grid grid-cols-1 gap-2">
        {SPACESHIP_PARTS.map(partId => {
          const resource = RESOURCES[partId];
          const currentAmount = Math.floor(partInventory[partId] || 0);
          const isPartComplete = currentAmount >= REQUIRED_AMOUNT;
          const isDiscovered = discoveredParts.has(partId);
          const progressPercent = Math.min(100, Math.round((currentAmount / REQUIRED_AMOUNT) * 100));

          return (
            <div
              key={partId}
              className={`rounded p-2 border ${
                isPartComplete
                  ? 'bg-green-900/20 border-green-700/50'
                  : isDiscovered
                  ? 'bg-gray-800/50 border-gray-700/50'
                  : 'bg-gray-900/30 border-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{isDiscovered ? resource?.icon : '🔒'}</span>
                  <span className={`text-sm font-medium ${
                    isPartComplete ? 'text-green-300' :
                    isDiscovered ? 'text-white' : 'text-gray-500'
                  }`}>
                    {isDiscovered ? resource?.name : '???'}
                  </span>
                  {isPartComplete && (
                    <span className="text-xs text-green-400">✓</span>
                  )}
                  {!isDiscovered && (
                    <span className="text-xs text-gray-500">Locked</span>
                  )}
                </div>
                <span className={`text-xs font-bold ${
                  isPartComplete ? 'text-green-400' :
                  currentAmount > 0 ? 'text-yellow-400' : 'text-gray-500'
                }`}>
                  {isDiscovered ? `${formatNumber(currentAmount)}/` : '???/'}{formatNumber(REQUIRED_AMOUNT)}
                </span>
              </div>
              {!isPartComplete && currentAmount > 0 && (
                <div className="bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-purple-500 h-1 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Complete Message & Prestige Button */}
      {isComplete && (
        <div className="bg-green-900/40 border border-green-500 rounded p-4 text-center space-y-3">
          <div>
            <p className="text-green-300 font-semibold text-lg mb-1">
              🎉 All parts ready! Your spaceship is complete!
            </p>
            <p className="text-xs text-green-400">
              The S.S. Bamboozle is ready to launch!
            </p>
          </div>

          <button
            onClick={() => setShowPrestigeDialog(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-4 rounded-lg font-bold text-lg transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <span>🚀 Launch Spaceship</span>
            <span className="text-sm opacity-90">(+{shardsToEarn} 🎋)</span>
          </button>

          <p className="text-xs text-gray-400 italic">
            Launching will reset your progress but grant Cosmic Bamboo Shards for permanent upgrades!
          </p>
        </div>
      )}

      {/* Prestige Dialog */}
      <PrestigeDialog
        isOpen={showPrestigeDialog}
        onClose={() => setShowPrestigeDialog(false)}
        onConfirm={handlePrestige}
        shardsToEarn={shardsToEarn}
      />
        </div>
      )}
    </div>
  );
}
