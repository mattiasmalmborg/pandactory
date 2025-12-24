import { useGame } from '../../game/state/GameContext';
import { SpaceshipGoal } from './SpaceshipGoal';

interface DashboardProps {
  onNavigateToBiome: () => void;
}

// Meta descriptions for each crash number
const CRASH_DESCRIPTIONS = [
  {
    title: "Help Dr. Redd Pawston III escape this strange planet!",
    subtitle: "Stranded after a crash landing. Build automations, gather resources, and construct a spaceship. What could go wrong?"
  },
  {
    title: "Help Dr. Redd Pawston III escape... again!",
    subtitle: "Crashed (again). Well, that didn't go as planned. Let's try this one more time. Surely it'll work this time."
  },
  {
    title: "Help Dr. Redd Pawston III escape this ridiculous planet!",
    subtitle: "Crashed (again). Stranded (again). Build automations, gather resources, and construct a spaceship. Try not to crash this one too. Third time's the charm, right?"
  },
  {
    title: "Dr. Redd Pawston III is starting to see a pattern here...",
    subtitle: "Four crashes. FOUR. At what point does this stop being bad luck and start being a skill issue? Anyway, let's build another spaceship."
  },
  {
    title: "This is fine. Everything is fine.",
    subtitle: "Crash #5. The planet's starting to feel like home. That's probably not a good sign. Focus up, build the ship, don't think about the previous failures."
  },
  {
    title: "Dr. Redd has earned frequent crasher miles!",
    subtitle: "Six crashes and counting! The good news: you're getting really efficient at this whole 'building from scratch' thing. The bad news: you're getting really efficient at this."
  },
  {
    title: "Lucky number seven! (It's not lucky)",
    subtitle: "Seven times stranded. At this point, the universe is just mocking you. But hey, at least you've got the automation thing down to a science!"
  },
  {
    title: "Achievement unlocked: Professional Crash Landing Expert",
    subtitle: "Eight crashes. EIGHT. You've now crashed more times than most pilots fly. Maybe stop flying? No? Okay, let's build another ship then."
  },
  {
    title: "Dr. Redd is reconsidering career choices...",
    subtitle: "Crash number nine. One more and you'll have crashed a nice, round ten times. Maybe aim for something other than 'round numbers' this time?"
  },
  {
    title: "DOUBLE DIGITS! 🎉 (This is not a celebration)",
    subtitle: "Ten crashes. A perfect ten. If only the landings were. You know what to do by now: automate, gather, build, crash, repeat. Wait, no—don't crash!"
  },
  {
    title: "At this point, it's just routine.",
    subtitle: "Crash. Rebuild. Launch. Repeat. The planet keeps a parking spot reserved for you. The local wildlife waves when you arrive. This is your life now."
  }
];

export function Dashboard({ onNavigateToBiome: _onNavigateToBiome }: DashboardProps) {
  const { state } = useGame();

  // Show prestige counter only after first prestige
  const hasPrestiged = state.prestige.totalPrestiges > 0;

  // Get the appropriate description based on crash number (capped at last available description)
  const crashNumber = state.prestige.totalPrestiges;
  const description = crashNumber < CRASH_DESCRIPTIONS.length
    ? CRASH_DESCRIPTIONS[crashNumber]
    : CRASH_DESCRIPTIONS[CRASH_DESCRIPTIONS.length - 1]; // Use last one for crashes beyond 10

  return (
    <div className="p-4 pt-0 space-y-2 pb-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-panda-orange flex items-center justify-center gap-2">
          <img
            src="/assets/ui/logo.png"
            alt="Pandactory"
            className="h-56 max-w-[90%] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] -mt-2 -mb-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) (fallback as HTMLElement).style.display = 'inline';
            }}
          />
          <span style={{ display: 'none' }}>🐼 Pandactory</span>
        </h1>

        {/* Game Description - Changes based on crash number */}
        <div className="mt-1 max-w-md mx-auto bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 shadow-lg relative">
          {/* Prestige Counter - positioned on top-right corner */}
          {hasPrestiged && (
            <div className="absolute -top-3 -right-2 bg-purple-900 backdrop-blur-sm border border-purple-500 px-3 py-0.5 rounded-full shadow-lg">
              <span className="text-purple-300 text-xs font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                Crash #{state.prestige.totalPrestiges + 1}
              </span>
            </div>
          )}
          <p className="text-sm text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {description.title}
          </p>
          <p className="text-xs text-gray-300 mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {description.subtitle}
          </p>
        </div>
      </div>

      {/* Spaceship Goal */}
      <SpaceshipGoal />

      {/* Expedition Status */}
      {state.panda.expedition !== null && (
        <div className="bg-panda-orange bg-opacity-20 border border-panda-orange p-4 rounded-lg">
          <div className="font-semibold text-panda-orange">🚀 Expedition In Progress</div>
          <div className="text-sm text-gray-300">Dr. Redd Pawston III is exploring...</div>
        </div>
      )}
    </div>
  );
}
