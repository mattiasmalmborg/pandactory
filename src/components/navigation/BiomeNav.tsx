import { useState } from 'react';
import { useGame } from '../../game/state/GameContext';
import { BIOMES } from '../../game/config/biomes';
import { BiomeId } from '../../types/game.types';

// Map biome IDs to their asset paths
const BIOME_ICONS: Record<BiomeId, string> = {
  lush_forest: '/assets/icons/biome_lush_forest.png',
  misty_lake: '/assets/icons/biome_misty_lake.png',
  arid_desert: '/assets/icons/biome_arid_desert.png',
  frozen_tundra: '/assets/icons/biome_frozen_tundra.png',
  volcanic_isle: '/assets/icons/biome_volcanic_isle.png',
  crystal_caverns: '/assets/icons/biome_crystal_caverns.png',
};

// Biome discovery order (exported for swipe navigation)
export const BIOME_ORDER: BiomeId[] = [
  'lush_forest',
  'misty_lake',
  'arid_desert',
  'frozen_tundra',
  'volcanic_isle',
  'crystal_caverns',
];

// Individual tab component
function BiomeTab({
  biomeId,
  isActive,
  isUnlocked,
  onClick,
  onImageError,
  imageHasFailed
}: {
  biomeId: BiomeId;
  isActive: boolean;
  isUnlocked: boolean;
  onClick: () => void;
  onImageError: () => void;
  imageHasFailed: boolean;
}) {
  const biomeConfig = BIOMES[biomeId];
  const iconPath = BIOME_ICONS[biomeId];

  return (
    <button
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      className={`relative flex-1 max-w-16 min-w-8 flex items-center justify-center transition-all ${
        isActive ? 'z-10' : 'z-0'
      } ${!isUnlocked ? 'cursor-not-allowed' : ''}`}
      title={isUnlocked ? biomeConfig.name : 'Unlock through expedition'}
    >
      {/* Tab shape */}
      <div
        className={`w-full h-12 sm:h-14 flex items-center justify-center rounded-b-lg sm:rounded-b-xl transition-all ${
          isActive
            ? 'bg-gray-800 shadow-lg'
            : isUnlocked
              ? 'bg-gray-800/70 hover:bg-gray-700/80'
              : 'bg-gray-900/50'
        }`}
        style={isActive ? {
          borderTop: `3px solid ${biomeConfig.accentColor}`,
          borderLeft: `1px solid ${biomeConfig.accentColor}40`,
          borderRight: `1px solid ${biomeConfig.accentColor}40`,
          borderBottom: `1px solid ${biomeConfig.accentColor}20`,
        } : {
          borderTop: '3px solid transparent',
        }}
      >
        {/* Icon or Lock */}
        <div className={`transition-transform ${
          isActive ? 'scale-110' : 'scale-95'
        } ${!isUnlocked ? 'opacity-40' : isActive ? '' : 'opacity-80'}`}>
          {!isUnlocked ? (
            <span className="text-base sm:text-lg">🔒</span>
          ) : !imageHasFailed && iconPath ? (
            <img
              src={iconPath}
              alt={biomeConfig.name}
              className="w-10 h-9 sm:w-12 sm:h-11 object-cover rounded"
              onError={onImageError}
            />
          ) : (
            <span className="text-lg sm:text-xl">{biomeConfig.icon}</span>
          )}
        </div>
      </div>

      {/* Active glow effect */}
      {isActive && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 sm:w-10 h-1 rounded-full blur-sm"
          style={{ backgroundColor: biomeConfig.accentColor }}
        />
      )}
    </button>
  );
}

export function BiomeNav() {
  const { state, dispatch } = useGame();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (biomeId: BiomeId) => {
    setFailedImages(prev => new Set(prev).add(biomeId));
  };

  return (
    <div className="sticky top-0 z-20 -mx-4 bg-gradient-to-b from-gray-900 to-transparent backdrop-blur-sm shadow-lg overflow-hidden">
      <div className="flex justify-center gap-1 pt-2 pb-1 sm:pb-3 px-2 scale-[0.85] sm:scale-100 origin-top">
        {BIOME_ORDER.map((biomeId: BiomeId) => {
          const isUnlocked = state.unlockedBiomes.includes(biomeId);
          return (
            <BiomeTab
              key={biomeId}
              biomeId={biomeId}
              isActive={state.player.currentBiome === biomeId}
              isUnlocked={isUnlocked}
              onClick={() => dispatch({ type: 'SWITCH_BIOME', payload: { biomeId } })}
              onImageError={() => handleImageError(biomeId)}
              imageHasFailed={failedImages.has(biomeId)}
            />
          );
        })}
      </div>
    </div>
  );
}
