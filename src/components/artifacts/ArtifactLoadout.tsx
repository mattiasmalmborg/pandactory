import { useGame } from '../../game/state/GameContext';
import { ARTIFACT_TEMPLATES, RARITY_COLORS, getArtifactBonus } from '../../game/config/artifacts';
import { ArtifactBonusType } from '../../types/game.types';

const BONUS_LABELS: Record<ArtifactBonusType, { label: string; reduction: boolean }> = {
  production: { label: 'Production', reduction: false },
  gather: { label: 'Gather yield', reduction: false },
  expedition_speed: { label: 'Expedition time', reduction: true },
  expedition_rewards: { label: 'Expedition rewards', reduction: false },
  build_cost: { label: 'Build costs', reduction: true },
  upgrade_cost: { label: 'Upgrade costs', reduction: true },
  research_speed: { label: 'Research time', reduction: true },
  artifact_chance: { label: 'Artifact chance', reduction: false },
};

export function ArtifactLoadout() {
  const { state, dispatch } = useGame();
  const inventory = state.artifacts?.inventory || [];
  const loadoutSlots = state.artifacts?.loadoutSlots || 3;
  const equipped = inventory.filter(a => a.equipped);

  // Aggregate bonuses from equipped artifacts
  const activeBonuses: { label: string; value: string }[] = [];
  for (const [type, info] of Object.entries(BONUS_LABELS)) {
    const val = getArtifactBonus(inventory, type as ArtifactBonusType);
    if (val > 0) {
      const sign = info.reduction ? '-' : '+';
      activeBonuses.push({ label: info.label, value: `${sign}${Math.round(val * 100)}%` });
    }
  }

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border border-amber-700/30 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-amber-400">Loadout</p>
        <span className="text-[10px] text-gray-400">{equipped.length}/{loadoutSlots} equipped</span>
      </div>

      {/* Equipped slots */}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: loadoutSlots }).map((_, i) => {
          const artifact = equipped[i];
          if (!artifact) {
            return (
              <div
                key={`slot-${i}`}
                className="border border-dashed border-gray-700/50 rounded-lg p-2 flex items-center justify-center min-h-[60px]"
              >
                <span className="text-gray-700 text-xl">+</span>
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

      {/* Active bonuses from equipped artifacts */}
      {activeBonuses.length > 0 && (
        <div className="border-t border-gray-700/40 pt-1.5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {activeBonuses.map(b => (
              <div key={b.label} className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 truncate">{b.label}</span>
                <span className="text-[10px] text-amber-400 font-mono ml-1">{b.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
