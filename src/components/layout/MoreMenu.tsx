import { useState } from 'react';
import { useGame } from '../../game/state/GameContext';

export type MoreViewType = 'skills' | 'achievements' | 'statistics';

interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: MoreViewType) => void;
}

export function MoreMenu({ isOpen, onClose, onNavigate }: MoreMenuProps) {
  const { state } = useGame();
  const [closing, setClosing] = useState(false);

  const hasUnspentShards = state.prestige.cosmicBambooShards > 0;
  const hasPendingAchievements = (state.achievements?.pending?.length || 0) > 0;
  const totalAchievements = state.achievements?.unlocked?.length || 0;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  const handleNavigate = (view: MoreViewType) => {
    onNavigate(view);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Menu panel - slides up from bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 ${closing ? 'animate-menu-slide-down' : 'animate-menu-slide-up'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-md mx-auto bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 rounded-t-2xl pb-24">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-600 rounded-full" />
          </div>

          <div className="px-4 pb-4 space-y-1">
            {/* Skills */}
            <button
              onClick={() => handleNavigate('skills')}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors text-left"
            >
              <span className="text-xl">✨</span>
              <div className="flex-1">
                <span className="text-white font-medium">Skill Tree</span>
                {hasUnspentShards && (
                  <span className="ml-2 text-xs text-green-400 font-semibold">
                    {state.prestige.cosmicBambooShards} shards
                  </span>
                )}
              </div>
              {hasUnspentShards && (
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Achievements */}
            <button
              onClick={() => handleNavigate('achievements')}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors text-left"
            >
              <span className="text-xl">🏆</span>
              <div className="flex-1">
                <span className="text-white font-medium">Achievements</span>
                <span className="ml-2 text-xs text-gray-400">
                  {totalAchievements} unlocked
                </span>
              </div>
              {hasPendingAchievements && (
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Statistics */}
            <button
              onClick={() => handleNavigate('statistics')}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors text-left"
            >
              <span className="text-xl">📊</span>
              <div className="flex-1">
                <span className="text-white font-medium">Statistics</span>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-700/50 my-2" />

            {/* Version info */}
            <div className="text-center text-xs text-gray-600 pt-1">
              Pandactory v{state.version}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
