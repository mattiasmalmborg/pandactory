import { ResourceId } from '../../types/game.types';
import { RESOURCES } from '../../game/config/resources';
import { formatNumber } from '../../utils/formatters';

interface ResourceDisplayProps {
  resourceId: ResourceId;
  amount: number;
  showIcon?: boolean;
  compact?: boolean;
}

export function ResourceDisplay({ resourceId, amount, showIcon = true, compact = false }: ResourceDisplayProps) {
  const resource = RESOURCES[resourceId];

  if (!resource) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-sm">
        {showIcon && <span className="text-lg">{resource?.icon ?? "❓"}</span>}
        <span className="font-semibold">{formatNumber(amount)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2">
        {showIcon && <span className="text-2xl">{resource?.icon ?? "❓"}</span>}
        <div>
          <div className="font-semibold text-white">{resource?.name ?? "Unknown"}</div>
          <div className="text-xs text-gray-400">{resource.description}</div>
        </div>
      </div>
      <div className="text-lg font-bold text-green-400">{formatNumber(amount)}</div>
    </div>
  );
}
