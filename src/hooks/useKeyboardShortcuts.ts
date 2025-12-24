import { useEffect } from 'react';
import { BiomeId } from '../types/game.types';

type ViewType = 'dashboard' | 'biome' | 'expedition' | 'statistics' | 'skills';

interface UseKeyboardShortcutsProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  unlockedBiomes: BiomeId[];
  currentBiome: BiomeId;
  onBiomeChange: (biomeId: BiomeId) => void;
}

const BIOME_SHORTCUTS: Record<string, BiomeId> = {
  '1': 'lush_forest',
  '2': 'misty_lake',
  '3': 'arid_desert',
  '4': 'frozen_tundra',
  '5': 'volcanic_isle',
  '6': 'crystal_caverns',
};

export function useKeyboardShortcuts({
  currentView,
  onViewChange,
  unlockedBiomes,
  currentBiome,
  onBiomeChange,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // ESC - Go to dashboard
      if (e.key === 'Escape') {
        e.preventDefault();
        onViewChange('dashboard');
        return;
      }

      // D - Dashboard
      if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onViewChange('dashboard');
        return;
      }

      // E - Expedition
      if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        onViewChange('expedition');
        return;
      }

      // 1-6 - Biome shortcuts
      if (BIOME_SHORTCUTS[e.key]) {
        const biomeId = BIOME_SHORTCUTS[e.key];

        // Only switch if biome is unlocked
        if (unlockedBiomes.includes(biomeId)) {
          e.preventDefault();
          onBiomeChange(biomeId);
          onViewChange('biome');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, onViewChange, unlockedBiomes, currentBiome, onBiomeChange]);
}
