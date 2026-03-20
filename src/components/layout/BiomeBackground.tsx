import { ReactNode } from 'react';
import { BiomeId } from '../../types/game.types';
import { BIOMES } from '../../game/config/biomes';
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

  // Determine biome key for particles (only actual biomes get particles)
  const particleBiome = (['lush_forest', 'misty_lake', 'arid_desert', 'frozen_tundra', 'volcanic_isle', 'crystal_caverns'] as string[]).includes(biomeId)
    ? biomeId : null;

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background Layer - Fixed, doesn't scroll */}
      <div className="absolute inset-0 bg-breathe bg-vignette" style={{ '--biome-accent': BIOMES[biomeId as BiomeId]?.accentColor || 'rgba(90,158,58,0.5)' } as React.CSSProperties}>
        {backgroundImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient}`} />
        )}
        {showOverlay && <div className={`absolute inset-0 ${overlayColor}`} />}
        {/* Biome-specific particles */}
        {particleBiome && <div className="biome-particles" data-biome={particleBiome} />}
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
