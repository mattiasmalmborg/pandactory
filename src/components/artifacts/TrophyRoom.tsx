import { useMemo } from 'react';
import { useGame } from '../../game/state/GameContext';
import { ARTIFACT_TEMPLATES, RARITY_COLORS, getDiscoveredTemplates } from '../../game/config/artifacts';
import { BIOMES } from '../../game/config/biomes';
import { BiomeId } from '../../types/game.types';

const BIOME_ORDER: BiomeId[] = ['lush_forest', 'misty_lake', 'arid_desert', 'frozen_tundra', 'volcanic_isle', 'crystal_caverns'];

export function TrophyRoom() {
  const { state } = useGame();
  const inventory = state.artifacts?.inventory || [];
  const discovered = useMemo(() => getDiscoveredTemplates(inventory), [inventory]);

  const allTemplates = Object.values(ARTIFACT_TEMPLATES);
  const totalTemplates = allTemplates.length;
  const discoveredCount = discovered.size;

  // Group by biome
  const biomeGroups = useMemo(() => {
    return BIOME_ORDER.map(biomeId => ({
      biomeId,
      biome: BIOMES[biomeId],
      templates: allTemplates.filter(t => t.originBiome === biomeId),
    }));
  }, []);

  return (
    <div className="p-4 pt-0 pb-24 space-y-3">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-lg font-bold text-white">🏆 Trophy Room</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">
          "Every artifact tells a story. Most of them are about me." — Dr. Redd
        </p>
      </div>

      {/* Progress */}
      <div className="bg-gray-900/80 backdrop-blur-sm border border-amber-700/30 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">🏺</span>
            <div>
              <p className="text-[10px] text-gray-500">Collection</p>
              <p className="text-lg font-bold text-amber-300">
                {discoveredCount}<span className="text-gray-500 font-normal text-sm">/{totalTemplates}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500">Completion</p>
            <p className="text-sm font-bold text-gray-300">
              {totalTemplates > 0 ? Math.round((discoveredCount / totalTemplates) * 100) : 0}%
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${totalTemplates > 0 ? (discoveredCount / totalTemplates) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Biome groups */}
      {biomeGroups.map(({ biomeId, biome, templates }) => {
        const biomeDiscovered = templates.filter(t => discovered.has(t.id)).length;
        return (
          <div key={biomeId} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{biome.icon}</span>
                <h3 className="text-xs font-bold text-white">{biome.name}</h3>
              </div>
              <span className="text-[10px] text-gray-500">
                {biomeDiscovered}/{templates.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {templates.map(template => {
                const isFound = discovered.has(template.id);
                const rarity = RARITY_COLORS[template.rarity];

                return (
                  <div
                    key={template.id}
                    className={`rounded-lg border p-3 transition-all ${
                      isFound
                        ? `${rarity.bg} ${rarity.border} ${rarity.glow}`
                        : 'bg-gray-900/40 border-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-2xl ${isFound ? '' : 'grayscale opacity-30'}`}>
                        {isFound ? template.icon : '❓'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm font-semibold truncate ${isFound ? 'text-white' : 'text-gray-600'}`}>
                            {isFound ? template.name : '???'}
                          </h4>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${isFound ? rarity.text : 'text-gray-700'}`}>
                            {template.rarity}
                          </span>
                        </div>
                        {isFound ? (
                          <>
                            <p className="text-[11px] text-gray-300 mt-0.5">{template.description}</p>
                            <p className="text-[10px] text-gray-400 italic mt-1">{template.flavorText}</p>
                          </>
                        ) : (
                          <p className="text-[11px] text-gray-600 mt-0.5 italic">
                            Found during expeditions in {biome.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
