import { useMemo } from 'react';
import { useGame } from '../../game/state/GameContext';
import { SpaceshipGoal } from './SpaceshipGoal';
import { ASSET_CONFIG } from '../../config/assets';
import { getSmartBottleneck } from '../../utils/smart-recommendations';

interface CommandCenterProps {
  onNavigate: (view: string) => void;
}

// Meta descriptions for each crash number
const CRASH_DESCRIPTIONS = [
  {
    title: "Help Dr. Redd Pawston III escape this strange planet!",
    subtitle: "Stranded after a crash landing. Build automations, gather resources, and construct a spaceship."
  },
  {
    title: "Help Dr. Redd Pawston III escape... again!",
    subtitle: "Crashed (again). Let's try this one more time. Surely it'll work this time."
  },
  {
    title: "Help Dr. Redd escape this ridiculous planet!",
    subtitle: "Crashed (again). Stranded (again). Third time's the charm, right?"
  },
  {
    title: "Dr. Redd is starting to see a pattern here...",
    subtitle: "Four crashes. FOUR. Anyway, let's build another spaceship."
  },
  {
    title: "This is fine. Everything is fine.",
    subtitle: "Crash #5. The planet's starting to feel like home. That's probably not a good sign."
  },
  {
    title: "Dr. Redd has earned frequent crasher miles!",
    subtitle: "Six crashes and counting! You're getting really efficient at building from scratch."
  },
  {
    title: "Lucky number seven! (It's not lucky)",
    subtitle: "Seven times stranded. The universe is just mocking you at this point."
  },
  {
    title: "Professional Crash Landing Expert",
    subtitle: "Eight crashes. You've now crashed more times than most pilots fly."
  },
  {
    title: "Dr. Redd is reconsidering career choices...",
    subtitle: "Crash number nine. One more and you'll have a nice, round ten."
  },
  {
    title: "DOUBLE DIGITS!",
    subtitle: "Ten crashes. A perfect ten. If only the landings were."
  },
  {
    title: "At this point, it's just routine.",
    subtitle: "Crash. Rebuild. Launch. Repeat. The local wildlife waves when you arrive."
  }
];

export function CommandCenter({ onNavigate }: CommandCenterProps) {
  const { state } = useGame();

  const hasPrestiged = state.prestige.totalPrestiges > 0;
  const crashNumber = state.prestige.totalPrestiges;
  const description = crashNumber < CRASH_DESCRIPTIONS.length
    ? CRASH_DESCRIPTIONS[crashNumber]
    : CRASH_DESCRIPTIONS[CRASH_DESCRIPTIONS.length - 1];

  // Smart bottleneck — traces production chains to find what's actionable NOW
  const smartBottleneck = useMemo(() => getSmartBottleneck(state), [state]);

  // Calculate next steps
  const nextSteps = useMemo(() => {
    const steps: Array<{ text: string; action?: string; view?: string }> = [];

    // Unspent shards
    if (state.prestige.cosmicBambooShards > 0) {
      steps.push({
        text: `${state.prestige.cosmicBambooShards} unspent Bamboo Shards`,
        action: 'Spend in Skill Tree',
        view: 'skills',
      });
    }

    // Check if enough food for an expedition (rough check: 500 is cheapest tier)
    const totalFood = Object.values(state.food).reduce((sum, amount) => sum + amount, 0);
    if (totalFood >= 500 && state.panda.status === 'home') {
      steps.push({
        text: 'Enough food for an expedition!',
        action: 'Go explore',
        view: 'expedition',
      });
    }

    // New biomes available
    if (state.unlockedBiomes.length < 6 && state.panda.status === 'home') {
      steps.push({
        text: `${state.unlockedBiomes.length}/6 biomes discovered`,
        action: 'Send expeditions to find more',
        view: 'expedition',
      });
    }

    return steps.slice(0, 3); // Max 3 steps
  }, [state]);

  // Lab status
  const labUnlocked = state.prestige.totalPrestiges > 0;

  return (
    <div className="p-4 pt-0 space-y-3 pb-24">
      {/* Compact Header */}
      <div className="text-center pt-1">
        <img
          src={ASSET_CONFIG.ui.logo}
          alt="Pandactory"
          className="h-32 max-w-[70%] mx-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] -mb-1"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Description card */}
        <div className="max-w-md mx-auto bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-2.5 shadow-lg relative">
          {hasPrestiged && (
            <div className="absolute -top-4 -right-2 bg-purple-900 backdrop-blur-sm border border-purple-500 px-2.5 py-0.5 rounded-full shadow-lg">
              <span className="text-purple-300 text-xs font-semibold">
                Crash #{state.prestige.totalPrestiges + 1}
              </span>
            </div>
          )}
          <p className="text-xs text-white font-medium">{description.title}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{description.subtitle}</p>
        </div>
      </div>

      {/* Spaceship Progress — always visible, compact */}
      <SpaceshipGoal />

      {/* Smart bottleneck indicator — adapts to game phase */}
      {smartBottleneck && (
        <div className="bg-gray-900/70 backdrop-blur-sm border border-amber-700/40 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{smartBottleneck.icon}</span>
            <div className="flex-1">
              <p className="text-xs text-amber-300 font-medium">{smartBottleneck.label}</p>
              <p className="text-xs text-gray-300">{smartBottleneck.text}</p>
            </div>
            {smartBottleneck.percent !== undefined && (
              <span className="text-xs text-amber-400 font-mono">{smartBottleneck.percent}%</span>
            )}
          </div>
          {smartBottleneck.percent !== undefined && (
            <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500/70 rounded-full transition-all duration-500"
                style={{ width: `${smartBottleneck.percent}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/40 rounded-lg p-3 space-y-2">
          <p className="text-xs text-gray-400 font-semibold">💡 Recommended</p>
          {nextSteps.map((step, i) => (
            <button
              key={i}
              onClick={() => step.view && onNavigate(step.view)}
              className={`w-full flex items-center gap-2 text-left rounded p-1.5 transition-colors ${
                step.view ? 'hover:bg-gray-800/50 cursor-pointer' : 'cursor-default'
              }`}
            >
              <span className="text-gray-500 text-xs">•</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-200 truncate">{step.text}</p>
                {step.action && (
                  <p className="text-[10px] text-panda-orange">{step.action} →</p>
                )}
              </div>
              {step.view && (
                <span className="text-gray-600 text-xs">›</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Active Timers */}
      {state.panda.status === 'expedition' && state.panda.expedition && (
        <div
          className="bg-gray-900/70 backdrop-blur-sm border border-blue-700/40 rounded-lg p-3 cursor-pointer hover:bg-gray-800/70 transition-colors"
          onClick={() => onNavigate('expedition')}
        >
          <div className="flex items-center gap-2">
            <span className="text-blue-400">🗺️</span>
            <div className="flex-1">
              <p className="text-xs text-blue-300 font-medium">Expedition in progress</p>
              <p className="text-[10px] text-gray-400">Tap to view details</p>
            </div>
            <span className="text-gray-600 text-xs">›</span>
          </div>
        </div>
      )}

      {/* Lab status (only if unlocked) */}
      {labUnlocked && (
        <div
          className="bg-gray-900/70 backdrop-blur-sm border border-purple-700/40 rounded-lg p-3 cursor-pointer hover:bg-gray-800/70 transition-colors"
          onClick={() => onNavigate('lab')}
        >
          <div className="flex items-center gap-2">
            <span className="text-purple-400">🔬</span>
            <div className="flex-1">
              <p className="text-xs text-purple-300 font-medium">Dr. Redd's Lab</p>
              <p className="text-[10px] text-gray-400">Research and experiments await</p>
            </div>
            <span className="text-gray-600 text-xs">›</span>
          </div>
        </div>
      )}
    </div>
  );
}
