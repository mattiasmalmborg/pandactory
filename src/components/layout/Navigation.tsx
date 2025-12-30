import { useGame } from '../../game/state/GameContext';
import { isExpeditionComplete } from '../../game/config/expeditions';

interface NavigationProps {
  currentView: 'dashboard' | 'biome' | 'expedition' | 'statistics' | 'skills' | 'achievements';
  onViewChange: (view: 'dashboard' | 'biome' | 'expedition' | 'statistics' | 'skills' | 'achievements') => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { state } = useGame();

  // Check if expedition is complete
  const expeditionComplete = state.panda.status === 'expedition' &&
                             state.panda.expedition &&
                             isExpeditionComplete(state.panda.expedition);

  // Show notification on skills if player has unspent shards
  const hasUnspentShards = state.prestige.cosmicBambooShards > 0;

  // Show notification on achievements if there are pending achievements
  const hasPendingAchievements = (state.achievements?.pending?.length || 0) > 0;

  const navItems = [
    { id: 'dashboard' as const, label: 'Home', icon: '🏠', showNotification: false },
    { id: 'biome' as const, label: 'Biome', icon: '🌲', showNotification: false },
    { id: 'expedition' as const, label: 'Explore', icon: '🗺️', showNotification: expeditionComplete },
    { id: 'skills' as const, label: 'Skills', icon: '✨', showNotification: hasUnspentShards },
    { id: 'achievements' as const, label: 'Awards', icon: '🏆', showNotification: hasPendingAchievements },
    { id: 'statistics' as const, label: 'Stats', icon: '📊', showNotification: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 safe-area-bottom">
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 transition-colors relative ${
              currentView === item.id
                ? 'text-panda-orange'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
            {item.showNotification && (
              <span className="absolute top-2 right-1/4 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-gray-900"></span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
