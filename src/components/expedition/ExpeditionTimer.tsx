import { useState, useEffect } from 'react';
import { useGame } from '../../game/state/GameContext';
import { EXPEDITION_TIERS, getExpeditionProgress, isExpeditionComplete } from '../../game/config/expeditions';
import { calculateExpeditionRewards } from '../../utils/expeditionRewards';
import { ResourceId } from '../../types/game.types';
import { ExpeditionRewards } from './ExpeditionRewards';
import { BIOMES } from '../../game/config/biomes';

const BASE = import.meta.env.BASE_URL;

export function ExpeditionTimer() {
  const { state, dispatch } = useGame();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [calculatedRewards, setCalculatedRewards] = useState<ReturnType<typeof calculateExpeditionRewards> | null>(null);

  useEffect(() => {
    if (state.panda.status !== 'expedition' || !state.panda.expedition) {
      return;
    }

    const updateTimer = () => {
      const expedition = state.panda.expedition;
      if (!expedition) return;

      const elapsed = Date.now() - expedition.startTime;
      const remaining = Math.max(0, expedition.durationMs - elapsed);
      const currentProgress = getExpeditionProgress(expedition);

      setTimeRemaining(remaining);
      setProgress(currentProgress);
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [state.panda.status, state.panda.expedition]);

  // Show rewards modal after recall (before checking expedition status)
  if (showRewards && calculatedRewards) {
    return (
      <ExpeditionRewards
        rewards={calculatedRewards.resources}
        powerCells={calculatedRewards.powerCells}
        newBiome={calculatedRewards.newBiome}
        newResources={calculatedRewards.newResources}
        onClose={() => {
          setShowRewards(false);
          setCalculatedRewards(null);
        }}
      />
    );
  }

  // Don't show anything if panda is not on expedition
  if (state.panda.status !== 'expedition' || !state.panda.expedition) {
    return null;
  }

  const expedition = state.panda.expedition;
  const tierConfig = EXPEDITION_TIERS[expedition.tier];
  const isCompleted = isExpeditionComplete(expedition);

  // Get biome config for colors
  const biomeConfig = BIOMES[state.player.currentBiome];
  const biomeAccentColor = biomeConfig.accentColor;

  // Don't show the timer modal when expedition is complete
  // Let ExpeditionLauncher handle the completion UI
  if (isCompleted) {
    return null;
  }

  const recallExpedition = () => {
    // No rewards if less than 1% progress
    if (progress < 0.01) {
      dispatch({
        type: 'RECALL_EXPEDITION',
        payload: { partialRewards: {} },
      });
      return;
    }

    // Calculate partial rewards based on progress
    const partialRewards = calculateExpeditionRewards(
      expedition.tier,
      0, // No bonus for early recall
      state.unlockedBiomes,
      state.player.currentBiome,
      state.biomes[state.player.currentBiome].discoveredResources || [],
      state.expeditionPityCounter || 0,
      state.powerCellPityCounter || 0,
      false, // Not completed
      progress // Current progress percentage
    );

    // Convert to record format for dispatch
    const rewardsRecord = partialRewards.resources.reduce((acc, r) => {
      acc[r.resourceId] = (acc[r.resourceId] || 0) + r.amount;
      return acc;
    }, {} as Record<ResourceId, number>);

    dispatch({
      type: 'RECALL_EXPEDITION',
      payload: { partialRewards: rewardsRecord },
    });

    // Show what they got
    setCalculatedRewards(partialRewards);
    setShowRewards(true);
  };

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(progress * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4 pt-8 pb-24">
        <div
          className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 max-w-md w-full shadow-2xl"
          style={{
            borderWidth: '2px',
            borderColor: biomeAccentColor
          }}
        >
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white mb-1">
            {tierConfig.name} in {biomeConfig.name}
          </h2>
          <p className="text-gray-200 text-sm">Expedition In Progress</p>
        </div>

        {/* Panda Image */}
        <div className="flex justify-center mb-4">
          {!imageLoaded && <div className="text-6xl">🐼🗺️</div>}
          <img
            src={`${BASE}assets/sprites/expedition_panda.png`}
            alt="Panda on expedition"
            className={`h-36 object-contain ${imageLoaded ? '' : 'hidden'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(false)}
          />
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-200 mb-2">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div
            className="w-full bg-gray-900 rounded-full h-4"
            style={{ borderWidth: '1px', borderColor: `${biomeAccentColor}99` }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(to right, ${biomeAccentColor}, ${biomeAccentColor}CC)`
              }}
            />
          </div>
        </div>

        {/* Time Remaining */}
        <div
          className="bg-black/30 rounded-lg p-4 text-center mb-4"
          style={{ borderWidth: '1px', borderColor: `${biomeAccentColor}80` }}
        >
          <div className="text-sm text-gray-300 mb-1">Time Remaining</div>
          <div className="text-3xl font-bold text-white font-mono">
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Completion benefits info */}
        <div className="bg-black/30 rounded-lg p-3 mb-4 text-sm">
          <div className="text-gray-100 mb-2 font-semibold">
            Completing the expedition gives:
          </div>
          <ul className="text-gray-200 space-y-1 text-xs">
            <li>✓ +20% bonus to all resources</li>
            <li>✓ Chance to discover new biomes</li>
            <li>✓ Chance to find power cells</li>
          </ul>
        </div>

        {/* Recall button */}
        <button
          onClick={recallExpedition}
          className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Recall Early ({progressPercent}% rewards)
        </button>
        <p className="text-center text-xs text-gray-300/70 mt-2">
          Recalling early forfeits spent food, completion bonus, biome discovery, and power cells
        </p>
        </div>
      </div>
    </div>
  );
}
