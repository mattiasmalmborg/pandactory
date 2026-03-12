import { useGame } from '../../game/state/GameContext';
import { SpaceshipGoal } from './SpaceshipGoal';
import { ASSET_CONFIG } from '../../config/assets';
import { ChoresList } from '../chores/ChoresList';

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
    subtitle: "You know what, this planet deserves a name by now. It's green, it's got trees, and I'm stuck here... Verdania. Named it myself. Very scientific."
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

      {/* Dr. Redd's Chore List */}
      <ChoresList />


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
    </div>
  );
}
