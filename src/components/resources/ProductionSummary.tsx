import { useGame } from '../../game/state/GameContext';
import { BiomeId } from '../../types/game.types';
import { AUTOMATIONS } from '../../game/config/automations';
import { RESOURCES } from '../../game/config/resources';
import { calculateProductionRate } from '../../utils/calculations';
import { formatNumber } from '../../utils/formatters';

interface ProductionSummaryProps {
  biomeId: BiomeId;
}

export function ProductionSummary({ biomeId }: ProductionSummaryProps) {
  const { state } = useGame();
  const biome = state.biomes[biomeId];

  if (!biome || biome.automations.length === 0) return null;

  // Calculate total production per resource
  const productionRates: Record<string, number> = {};

  biome.automations.forEach((automation) => {
    const config = AUTOMATIONS[automation.type];
    if (!config) return;

    // Calculate production rate with level scaling (+50% per level)
    let rate = calculateProductionRate(config.baseProductionRate, automation.level);
    if (automation.powerCell?.bonus) {
      rate *= (1 + automation.powerCell.bonus);
    }

    config.produces.forEach((produce) => {
      const amount = produce.amount * rate;
      productionRates[produce.resourceId] = (productionRates[produce.resourceId] || 0) + amount;
    });
  });

  const hasProduction = Object.keys(productionRates).length > 0;

  if (!hasProduction) return null;

  return (
    <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-3">
      <div className="text-xs text-green-400 font-semibold mb-2 flex items-center gap-2">
        <span className="animate-pulse">⚙️</span>
        Total Production
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(productionRates).map(([resourceId, rate]) => {
          const resource = RESOURCES[resourceId as keyof typeof RESOURCES];
          if (!resource) return null;

          return (
            <div key={resourceId} className="flex items-center gap-2">
              <span className="text-lg">{resource?.icon ?? "❓"}</span>
              <div className="text-sm">
                <div className="text-green-300 font-semibold">+{formatNumber(rate)}/min</div>
                <div className="text-xs text-green-500">{resource?.name ?? "Unknown"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
