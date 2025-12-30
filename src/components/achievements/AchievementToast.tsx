import { useEffect, useState } from 'react';
import { useGame } from '../../game/state/GameContext';
import { ACHIEVEMENTS } from '../../game/config/achievements';
import { AchievementId } from '../../types/game.types';

interface ToastItem {
  id: AchievementId;
  visible: boolean;
}

export function AchievementToast() {
  const { state, dispatch } = useGame();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Watch for new pending achievements
  useEffect(() => {
    const pending = state.achievements?.pending || [];

    pending.forEach(achievementId => {
      // Check if we already have this toast
      if (!toasts.find(t => t.id === achievementId)) {
        // Add new toast
        setToasts(prev => [...prev, { id: achievementId, visible: true }]);

        // Acknowledge the achievement after a short delay (so it doesn't re-trigger)
        setTimeout(() => {
          dispatch({ type: 'ACKNOWLEDGE_ACHIEVEMENT', payload: { achievementId } });
        }, 100);

        // Start hiding animation after 3 seconds
        setTimeout(() => {
          setToasts(prev =>
            prev.map(t => t.id === achievementId ? { ...t, visible: false } : t)
          );
        }, 3000);

        // Remove from list after animation completes
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== achievementId));
        }, 3500);
      }
    });
  }, [state.achievements?.pending, dispatch, toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        const achievement = ACHIEVEMENTS[toast.id];
        if (!achievement) return null;

        return (
          <div
            key={toast.id}
            className={`
              bg-gradient-to-r from-yellow-900/95 to-amber-900/95
              backdrop-blur-md border border-yellow-500/50
              rounded-xl shadow-2xl px-4 py-3
              flex items-center gap-3
              transform transition-all duration-500 ease-out
              animate-bounce-in
              ${toast.visible
                ? 'translate-y-0 opacity-100 scale-100'
                : '-translate-y-4 opacity-0 scale-95'
              }
            `}
          >
            <div className="text-3xl animate-achievement-pop">{achievement.icon}</div>
            <div>
              <div className="text-yellow-300 text-xs font-semibold uppercase tracking-wider">
                Achievement Unlocked!
              </div>
              <div className="text-white font-bold">{achievement.name}</div>
              <div className="text-yellow-200/80 text-xs">{achievement.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
