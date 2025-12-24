import { useState, useEffect } from 'react';
import { useGame } from '../../game/state/GameContext';

export type HintId =
  | 'welcome'
  | 'cross_biome_resources'
  | 'efficiency_basics'
  | 'expedition_intro'
  | 'power_cells'
  | 'pause_automation'
  | 'spaceship_goal'
  | 'save_export';

interface Hint {
  id: HintId;
  title: string;
  message: string;
  triggerCondition: (state: any) => boolean;
  priority: number; // Lower = higher priority
}

const HINTS: Hint[] = [
  {
    id: 'welcome',
    title: 'Welcome to Pandactory!',
    message: 'Help Dr. Redd Pawston III build a spaceship to get home! Start by gathering resources in the Lush Forest.',
    triggerCondition: (state) => {
      // Show on first load when player has no resources
      const biome = state.biomes.lush_forest;
      const hasAnyResources = Object.values(biome.resources).some((amount: any) => amount > 0);
      return !hasAnyResources;
    },
    priority: 1,
  },
  {
    id: 'cross_biome_resources',
    title: 'Cross-Biome Resources',
    message: 'Resources are shared across all unlocked biomes! You can use wood from the Lush Forest to build automations in other biomes.',
    triggerCondition: (state) => {
      // Show when player has unlocked a second biome
      return state.unlockedBiomes.length >= 2;
    },
    priority: 2,
  },
  {
    id: 'efficiency_basics',
    title: 'Automation Efficiency',
    message: 'Automations need input resources to run at 100% efficiency. If efficiency drops below 100%, production slows down. Check the efficiency bar to see what resources are needed!',
    triggerCondition: (state) => {
      // Show when player has built their first automation
      const totalAutomations = Object.values(state.biomes).reduce(
        (sum: number, biome: any) => sum + biome.automations.length,
        0
      );
      return totalAutomations >= 1;
    },
    priority: 3,
  },
  {
    id: 'expedition_intro',
    title: 'Expeditions',
    message: 'Send Dr. Redd Pawston III on expeditions to discover new biomes, find power cells, and gather resources! Expeditions require food to begin.',
    triggerCondition: (state) => {
      // Show when player has 10+ food
      const totalFood = Object.values(state.food).reduce((sum: number, amount: any) => sum + amount, 0);
      return totalFood >= 10 && state.expeditionCount === 0;
    },
    priority: 4,
  },
  {
    id: 'power_cells',
    title: 'Power Cells Boost Production',
    message: 'Install power cells in your automations to boost production! Green cells give +50%, Blue +100%, and Orange +150%.',
    triggerCondition: (state) => {
      // Show when player gets their first power cell
      return state.powerCellInventory.length >= 1;
    },
    priority: 5,
  },
  {
    id: 'pause_automation',
    title: 'Pause Automations',
    message: 'Click the pause button on automations to temporarily stop them. This helps you prioritize which automations should consume resources first!',
    triggerCondition: (state) => {
      // Show when player has 3+ automations
      const totalAutomations = Object.values(state.biomes).reduce(
        (sum: number, biome: any) => sum + biome.automations.length,
        0
      );
      return totalAutomations >= 3;
    },
    priority: 6,
  },
  {
    id: 'spaceship_goal',
    title: 'Build the S.S. Bamboozle',
    message: 'Your goal is to collect 100 of each spaceship part. You\'ll discover these advanced resources as you unlock new biomes and build advanced production chains!',
    triggerCondition: (state) => {
      // Show when player has unlocked 2+ biomes
      return state.unlockedBiomes.length >= 2;
    },
    priority: 7,
  },
  {
    id: 'save_export',
    title: 'Save Your Progress',
    message: 'Your game auto-saves, but you can also export your save from the Dashboard to backup or transfer to another device!',
    triggerCondition: (state) => {
      // Show when player has played for a while (has 5+ automations)
      const totalAutomations = Object.values(state.biomes).reduce(
        (sum: number, biome: any) => sum + biome.automations.length,
        0
      );
      return totalAutomations >= 5;
    },
    priority: 8,
  },
];

const STORAGE_KEY = 'pandactory-dismissed-hints';

export function HintSystem() {
  const { state } = useGame();
  const [dismissedHints, setDismissedHints] = useState<HintId[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);

  // Check for hints to show
  useEffect(() => {
    // Find the first hint that should be shown (not dismissed and condition met)
    const hintToShow = HINTS
      .filter(hint => !dismissedHints.includes(hint.id))
      .filter(hint => hint.triggerCondition(state))
      .sort((a, b) => a.priority - b.priority)[0];

    setCurrentHint(hintToShow || null);
  }, [state, dismissedHints]);

  const handleDismiss = () => {
    if (!currentHint) return;

    const newDismissed = [...dismissedHints, currentHint.id];
    setDismissedHints(newDismissed);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDismissed));
    } catch (e) {
      console.error('Failed to save dismissed hints:', e);
    }

    setCurrentHint(null);
  };

  if (!currentHint) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
      <div className="bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-md border-2 border-blue-400/50 rounded-lg p-4 shadow-2xl animate-slide-down">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-3xl">💡</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-200 mb-1">
              {currentHint.title}
            </h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              {currentHint.message}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-blue-200 hover:text-white text-xl font-bold transition-colors"
            aria-label="Dismiss hint"
          >
            ×
          </button>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleDismiss}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-sm font-semibold transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
