import { useMemo } from 'react';
import { useGame } from '../../game/state/GameContext';
import { ARTIFACT_TEMPLATES, RARITY_COLORS, getDiscoveredTemplates } from '../../game/config/artifacts';
import { BIOMES } from '../../game/config/biomes';
import { BiomeId } from '../../types/game.types';

const BIOME_ORDER: BiomeId[] = ['lush_forest', 'misty_lake', 'arid_desert', 'frozen_tundra', 'volcanic_isle', 'crystal_caverns'];

export function TrophyRoom() {
  const { state } = useGame();
  const inventory = useMemo(() => state.artifacts?.inventory || [], [state.artifacts?.inventory]);
  const discovered = useMemo(() => getDiscoveredTemplates(inventory), [inventory]);

  const allTemplates = useMemo(() => Object.values(ARTIFACT_TEMPLATES), []);
  const totalTemplates = allTemplates.length;
  const discoveredCount = discovered.size;

  // Group by biome
  const biomeGroups = useMemo(() => {
    return BIOME_ORDER.map(biomeId => ({
      biomeId,
      biome: BIOMES[biomeId],
      templates: allTemplates.filter(t => t.originBiome === biomeId),
    }));
  }, [allTemplates]);

  return (
    <div className="space-y-3">
      {/* Header + Progress */}
      <div className="bg-gradient-to-br from-yellow-900/50 to-amber-900/50 backdrop-blur-sm rounded-lg border border-yellow-500/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-yellow-200 flex items-center gap-2">
            🏺 Trophy Room
          </h1>
          <span className="text-yellow-300 font-bold">
            {discoveredCount}/{totalTemplates}
          </span>
        </div>
        <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${totalTemplates > 0 ? (discoveredCount / totalTemplates) * 100 : 0}%` }}
          />
        </div>
        <p className="text-center text-yellow-200/80 text-sm mt-2">
          {totalTemplates > 0 ? Math.round((discoveredCount / totalTemplates) * 100) : 0}% Complete
        </p>
      </div>

      {/* Biome groups */}
      {biomeGroups.map(({ biomeId, biome, templates }) => {
        const biomeDiscovered = templates.filter(t => discovered.has(t.id)).length;
        return (
          <div key={biomeId} className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>{biome.icon}</span>
                <span>{biome.name}</span>
              </h2>
              <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                biomeDiscovered === templates.length
                  ? 'bg-green-900/50 text-green-300'
                  : 'bg-gray-700/50 text-gray-400'
              }`}>
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
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      isFound
                        ? `${rarity.bg} ${rarity.border} ${rarity.glow}`
                        : 'bg-gray-800/50 border-gray-700/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl ${isFound ? '' : 'grayscale opacity-50'}`}>
                        {isFound ? template.icon : '❓'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`font-semibold text-sm ${isFound ? 'text-white' : 'text-gray-400'}`}>
                            {isFound ? template.name : '???'}
                          </h3>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${isFound ? rarity.text : 'text-gray-700'}`}>
                            {template.rarity}
                          </span>
                        </div>
                        {isFound ? (
                          <>
                            <p className="text-xs mt-0.5 text-gray-300">{template.description}</p>
                            <p className="text-xs mt-1 text-amber-400/80 italic">"{template.flavorText}"</p>
                          </>
                        ) : (
                          <p className="text-xs mt-0.5 text-gray-500">
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
