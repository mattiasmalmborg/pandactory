import { useGame } from '../../game/state/GameContext';
import { isExpeditionComplete } from '../../game/config/expeditions';

export type MainViewType = 'dashboard' | 'biome' | 'expedition' | 'lab' | 'more';
export type SubViewType = 'skills' | 'achievements' | 'trophy_room' | 'statistics';
export type ViewType = MainViewType | SubViewType;

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: MainViewType) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { state } = useGame();

  // Check if expedition is complete
  const expeditionComplete = state.panda.status === 'expedition' &&
                             state.panda.expedition &&
                             isExpeditionComplete(state.panda.expedition);

  // Show notification on More if player has unspent shards or pending achievements
  const hasUnspentShards = state.prestige.cosmicBambooShards > 0;
  const hasPendingAchievements = (state.achievements?.pending?.length || 0) > 0;
  const hasMoreNotification = hasUnspentShards || hasPendingAchievements;

  // Lab is locked until first prestige
  const labUnlocked = state.prestige.totalPrestiges > 0;

  const navItems = [
    { id: 'dashboard' as const, label: 'Home', icon: '🏠', showNotification: false, locked: false },
    { id: 'biome' as const, label: 'Biome', icon: '🌲', showNotification: false, locked: false },
    { id: 'expedition' as const, label: 'Explore', icon: '🗺️', showNotification: expeditionComplete, locked: false },
    { id: 'lab' as const, label: 'Lab', icon: '🔬', showNotification: false, locked: !labUnlocked },
    { id: 'more' as const, label: 'More', icon: '•••', showNotification: hasMoreNotification, locked: false },
  ];

  // Sub-views (skills, achievements, statistics) highlight "More" tab
  const activeTab = (['skills', 'achievements', 'trophy_room', 'statistics'] as string[]).includes(currentView)
    ? 'more'
    : currentView;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 safe-area-bottom z-10">
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.locked && onViewChange(item.id)}
            className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 transition-colors relative ${
              item.locked
                ? 'text-gray-600 cursor-not-allowed'
                : activeTab === item.id
                ? 'text-panda-orange'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <span className={`text-xl ${item.locked ? 'opacity-40' : ''}`}>{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
            {item.locked && (
              <span className="absolute top-1.5 right-1/4 text-[8px]">🔒</span>
            )}
            {item.showNotification && !item.locked && (
              <span className="absolute top-2 right-1/4 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-gray-900"></span>
            )}
            {activeTab === item.id && !item.locked && <span className="nav-active-dot" />}
          </button>
        ))}
      </div>
    </nav>
  );
}
