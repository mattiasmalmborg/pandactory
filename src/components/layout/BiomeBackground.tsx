import { ReactNode } from 'react';
import { BiomeId } from '../../types/game.types';
import { useAssetImage } from '../../hooks/useAssetImage';
import { getBiomeBackgroundPath, getFallbackGradient } from '../../config/assets';

interface BiomeBackgroundProps {
  biomeId: BiomeId | 'dashboard' | 'skills_stats';
  children: ReactNode;
}

const BIOME_IDS = new Set(['lush_forest', 'misty_lake', 'arid_desert', 'frozen_tundra', 'volcanic_isle', 'crystal_caverns']);

/**
 * BiomeBackground component
 * - Shows biome-specific background image (fixed, doesn't scroll)
 * - Falls back to gradient if image doesn't exist
 * - Content scrolls over the background
 * - Single-div particle layer per biome (CSS background-image gradients)
 */
export function BiomeBackground({ biomeId, children }: BiomeBackgroundProps) {
  const backgroundPath = getBiomeBackgroundPath(biomeId);
  const backgroundImage = useAssetImage(backgroundPath);
  const fallbackGradient = getFallbackGradient(biomeId);

  const showOverlay = biomeId !== 'dashboard';
  const particleBiome = BIOME_IDS.has(biomeId) ? biomeId : null;

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 bg-vignette">
        {backgroundImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient}`} />
        )}
        {showOverlay && <div className="absolute inset-0 bg-black bg-opacity-40" />}
        {/* Biome atmosphere — single div, CSS background-image animation */}
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
