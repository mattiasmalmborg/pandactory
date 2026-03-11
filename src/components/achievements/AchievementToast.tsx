import { useEffect, useRef } from 'react';
import { useGame } from '../../game/state/GameContext';
import { ACHIEVEMENTS } from '../../game/config/achievements';
import { useToast } from '../ui/ToastQueue';

export function useAchievementToasts() {
  const { state, dispatch } = useGame();
  const { enqueue } = useToast();
  const processedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const pending = state.achievements?.pending || [];

    pending.forEach(achievementId => {
      if (processedRef.current.has(achievementId)) return;
      processedRef.current.add(achievementId);

      const achievement = ACHIEVEMENTS[achievementId];
      if (achievement) {
        enqueue({
          id: `achievement-${achievementId}`,
          icon: achievement.icon,
          label: 'Achievement Unlocked!',
          title: achievement.name,
          subtitle: achievement.description,
          colorScheme: 'achievement',
        });
      }

      // Acknowledge so it doesn't re-trigger
      setTimeout(() => {
        dispatch({ type: 'ACKNOWLEDGE_ACHIEVEMENT', payload: { achievementId } });
      }, 100);
    });
  }, [state.achievements?.pending, dispatch, enqueue]);
}
