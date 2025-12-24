import { useState, useEffect } from 'react';
import { useGame } from '../../game/state/GameContext';
import { EXPEDITION_TIERS, getExpeditionProgress, isExpeditionComplete } from '../../game/config/expeditions';

export function ExpeditionTimer() {
  const { state } = useGame();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

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

  // Don't show anything if panda is not on expedition
  if (state.panda.status !== 'expedition' || !state.panda.expedition) {
    return null;
  }

  const expedition = state.panda.expedition;
  const tierConfig = EXPEDITION_TIERS[expedition.tier];
  const isCompleted = isExpeditionComplete(expedition);

  // Don't show the timer modal when expedition is complete
  // Let ExpeditionLauncher handle the completion UI
  if (isCompleted) {
    return null;
  }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl border-2 border-blue-500 p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">🐼</div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Expedition In Progress
          </h2>
          <p className="text-blue-200 text-sm">{tierConfig.name}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-blue-200 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="w-full bg-blue-950 rounded-full h-4 border border-blue-700">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-1"
              style={{ width: `${progress * 100}%` }}
            >
              {progress > 0.1 && (
                <span className="text-xs text-white font-bold">🚀</span>
              )}
            </div>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="bg-blue-950 rounded-lg p-4 border border-blue-700 text-center">
          <div className="text-sm text-blue-300 mb-1">Time Remaining</div>
          <div className="text-3xl font-bold text-white font-mono">
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-4 text-center">
          <p className="text-blue-200 text-sm italic">
            Dr. Redd Pawston III is exploring the wilderness...
          </p>
        </div>
      </div>
    </div>
  );
}
