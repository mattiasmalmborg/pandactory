import { useEffect, useRef } from 'react';
import { useGame } from '../../game/state/GameContext';
import { useToast } from '../ui/ToastQueue';

export function useChoreToasts() {
  const { state } = useGame();
  const { enqueue } = useToast();
  const seenCompletedRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  // Initialize with already-completed contracts on mount
  useEffect(() => {
    if (initializedRef.current || !state.contracts) return;
    initializedRef.current = true;

    const allContracts = [...(state.contracts.daily || []), ...(state.contracts.weekly || [])];
    allContracts.forEach(c => {
      if (c.completed) {
        seenCompletedRef.current.add(c.id);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!state.contracts]);

  // Watch for newly completed contracts
  useEffect(() => {
    if (!state.contracts || !initializedRef.current) return;
    const allContracts = [...(state.contracts.daily || []), ...(state.contracts.weekly || [])];

    allContracts.forEach(contract => {
      if (contract.completed && !seenCompletedRef.current.has(contract.id)) {
        seenCompletedRef.current.add(contract.id);

        enqueue({
          id: `chore-${contract.id}`,
          icon: '📋',
          label: 'Chore Complete!',
          title: contract.description,
          subtitle: `+${contract.researchDataReward} 🔬 Research Data — tap to claim`,
          colorScheme: 'chore',
        });
      }
    });
  }, [state.contracts, enqueue]);
}
