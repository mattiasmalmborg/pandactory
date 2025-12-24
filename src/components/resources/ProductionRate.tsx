import { ResourceId } from '../../types/game.types';
import { RESOURCES } from '../../game/config/resources';
import { formatProductionRate } from '../../utils/formatters';

interface ProductionRateProps {
  resourceId: ResourceId;
  rate: number;
}

export function ProductionRate({ resourceId, rate }: ProductionRateProps) {
  const resource = RESOURCES[resourceId];

  if (!resource || rate === 0) return null;

  const isPositive = rate > 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-lg">{resource?.icon ?? "❓"}</span>
      <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
        {isPositive ? '+' : ''}{formatProductionRate(rate)}
      </span>
    </div>
  );
}
