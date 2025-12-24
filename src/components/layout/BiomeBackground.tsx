import { ReactNode } from 'react';
import { BiomeId } from '../../types/game.types';
import { useAssetImage } from '../../hooks/useAssetImage';
import { getBiomeBackgroundPath, getFallbackGradient } from '../../config/assets';

interface BiomeBackgroundProps {
  biomeId: BiomeId | 'dashboard' | 'skills_stats';
  children: ReactNode;
}

/**
 * BiomeBackground component
 * - Shows biome-specific background image (fixed, doesn't scroll)
 * - Falls back to gradient if image doesn't exist
 * - Content scrolls over the background
 */
export function BiomeBackground({ biomeId, children }: BiomeBackgroundProps) {
  const backgroundPath = getBiomeBackgroundPath(biomeId);
  const backgroundImage = useAssetImage(backgroundPath);
  const fallbackGradient = getFallbackGradient(biomeId);

  // Fallback overlay colors (semi-transparent to darken image and improve text readability)
  // Dashboard doesn't need the overlay since it has its own card backgrounds
  const showOverlay = biomeId !== 'dashboard';
  const overlayColor = 'bg-black bg-opacity-40';

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background Layer - Fixed, doesn't scroll */}
      <div className="absolute inset-0">
        {backgroundImage ? (
          // Image background
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : (
          // Fallback gradient
          <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient}`} />
        )}
        {/* Overlay for better text readability (not on dashboard) */}
        {showOverlay && <div className={`absolute inset-0 ${overlayColor}`} />}
      </div>

      {/* Content Layer - Scrollable */}
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
