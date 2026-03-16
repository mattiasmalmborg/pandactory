import { useGame } from '../../game/state/GameContext';
import { ARTIFACT_TEMPLATES, RARITY_COLORS, getEffectiveLoadoutSlots, getActiveSetBonuses, SET_BONUSES } from '../../game/config/artifacts';

export function ArtifactLoadout() {
  const { state, dispatch } = useGame();
  const inventory = state.artifacts?.inventory || [];
  const loadoutSlots = getEffectiveLoadoutSlots(inventory);
  const equipped = inventory.filter(a => a.equipped);
  const setBonuses = getActiveSetBonuses(inventory);

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-amber-400">Loadout</p>
        <span className="text-[10px] text-gray-400">{equipped.length}/{loadoutSlots} equipped</span>
      </div>

      {/* Equipped slots */}
      <div className={`grid gap-2 ${loadoutSlots === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
        {Array.from({ length: loadoutSlots }).map((_, i) => {
          const artifact = equipped[i];
          if (!artifact) {
            return (
              <div
                key={`slot-${i}`}
                className="border-2 border-dashed border-gray-600/60 rounded-lg p-2 flex flex-col items-center justify-center min-h-[60px] bg-gray-900/40"
              >
                <span className="text-gray-500 text-xl">+</span>
                <span className="text-[8px] text-gray-500 mt-0.5">Empty</span>
              </div>
            );
          }
          const template = ARTIFACT_TEMPLATES[artifact.templateId];
          const rarity = RARITY_COLORS[template.rarity];
          return (
            <div
              key={artifact.instanceId}
              className={`border rounded-lg p-2 text-center cursor-pointer hover:opacity-80 transition-opacity ${rarity.border} ${rarity.bg} ${rarity.glow}`}
              onClick={() => dispatch({ type: 'UNEQUIP_ARTIFACT', payload: { artifactInstanceId: artifact.instanceId } })}
              title="Click to unequip"
            >
              <span className="text-xl">{template.icon}</span>
              <p className="text-[9px] text-white truncate mt-0.5">{template.name}</p>
              <p className={`text-[8px] ${rarity.text}`}>{template.rarity}</p>
            </div>
          );
        })}
      </div>

      {/* Active effects from equipped artifacts */}
      {equipped.length > 0 && (
        <div className="border-t border-gray-700/40 pt-1.5 space-y-0.5">
          {equipped.map(a => {
            const template = ARTIFACT_TEMPLATES[a.templateId];
            return (
              <div key={a.instanceId} className="flex items-center gap-1.5">
                <span className="text-[10px]">{template.icon}</span>
                <span className="text-[10px] text-gray-300 truncate">{template.description}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Active set bonuses */}
      {setBonuses.size > 0 && (
        <div className="border-t border-amber-700/30 pt-1.5 space-y-1">
          {Array.from(setBonuses.entries()).map(([biome, count]) => {
            const setBonus = SET_BONUSES[biome];
            return (
              <div key={biome} className="bg-amber-900/20 border border-amber-700/30 rounded-md px-2 py-1">
                <p className="text-[10px] text-amber-400 font-semibold">
                  {setBonus.name} ({count}/3)
                </p>
                <p className="text-[9px] text-amber-200/80">
                  {count >= 3 ? setBonus.threeBonus : setBonus.twoBonus}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
