import { ReactNode, useMemo } from 'react';
import { BiomeId } from '../../types/game.types';
import { BIOMES } from '../../game/config/biomes';
import { useAssetImage } from '../../hooks/useAssetImage';
import { getBiomeBackgroundPath, getFallbackGradient } from '../../config/assets';

interface BiomeBackgroundProps {
  biomeId: BiomeId | 'dashboard' | 'skills_stats';
  children: ReactNode;
}

const BIOME_IDS = new Set(['lush_forest', 'misty_lake', 'arid_desert', 'frozen_tundra', 'volcanic_isle', 'crystal_caverns']);

// Particle counts per biome (mist needs fewer but bigger, crystals twinkle in place)
const PARTICLE_COUNTS: Partial<Record<string, number>> = {
  lush_forest: 12,
  misty_lake: 6,
  arid_desert: 10,
  frozen_tundra: 15,
  volcanic_isle: 10,
  crystal_caverns: 14,
};

// Seeded random to avoid re-generating on re-render — stable per biome
function seededValues(biome: string, count: number) {
  const particles = [];
  // Use simple hash to get deterministic values per biome
  let seed = 0;
  for (let i = 0; i < biome.length; i++) seed += biome.charCodeAt(i);
  for (let i = 0; i < count; i++) {
    seed = (seed * 16807 + 7) % 2147483647;
    const x = (seed % 100);
    seed = (seed * 16807 + 7) % 2147483647;
    const y = (seed % 100);
    seed = (seed * 16807 + 7) % 2147483647;
    const duration = 8 + (seed % 20); // 8-27s
    seed = (seed * 16807 + 7) % 2147483647;
    const delay = -(seed % 20); // negative delay so particles start mid-animation
    particles.push({ x, y, duration, delay });
  }
  return particles;
}

/**
 * BiomeBackground component
 * - Shows biome-specific background image (fixed, doesn't scroll)
 * - Falls back to gradient if image doesn't exist
 * - Content scrolls over the background
 * - Renders per-biome ambient particle effects
 */
export function BiomeBackground({ biomeId, children }: BiomeBackgroundProps) {
  const backgroundPath = getBiomeBackgroundPath(biomeId);
  const backgroundImage = useAssetImage(backgroundPath);
  const fallbackGradient = getFallbackGradient(biomeId);

  const showOverlay = biomeId !== 'dashboard';
  const overlayColor = 'bg-black bg-opacity-40';

  const particleBiome = BIOME_IDS.has(biomeId) ? biomeId : null;

  // Generate stable particle positions per biome
  const particles = useMemo(() => {
    if (!particleBiome) return [];
    return seededValues(particleBiome, PARTICLE_COUNTS[particleBiome] || 10);
  }, [particleBiome]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background Layer */}
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
        {/* Biome particles — each <span> animates independently */}
        {particleBiome && (
          <div className="biome-particles" data-biome={particleBiome}>
            {particles.map((p, i) => (
              <span
                key={i}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  animationDuration: `${p.duration}s`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>
        )}
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
