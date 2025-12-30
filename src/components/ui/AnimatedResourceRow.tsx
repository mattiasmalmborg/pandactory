import { useAnimatedNumber } from './FloatingNumber';
import { RESOURCES } from '../../game/config/resources';
import { formatNumber } from '../../utils/formatters';
import { ResourceId } from '../../types/game.types';

interface AnimatedResourceRowProps {
  resourceId: ResourceId;
  amount: number;
  produced: number;
  consumed: number;
}

export function AnimatedResourceRow({ resourceId, amount, produced, consumed }: AnimatedResourceRowProps) {
  const resource = RESOURCES[resourceId];
  const animatedAmount = useAnimatedNumber(amount, 500);

  if (!resource) return null;

  const net = produced - consumed;
  const isNegativeNet = net < 0;
  const descriptionText = resource.flavorText
    ? `${resource.description}\n\n"${resource.flavorText}"`
    : resource.description;
  // Use animated amount for live updating tooltip
  const displayedExact = Math.floor(animatedAmount);
  const tooltipText = `${descriptionText}\n\nAmount: ${displayedExact.toLocaleString()}`;

  return (
    <div className="p-3 hover:bg-gray-750 transition-colors">
      {/* Top row: Icon, Name, Amount */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl" data-tooltip={tooltipText}>
            {resource.icon ?? "❓"}
          </span>
          <span className="font-medium text-white">
            {resource.name ?? "Unknown"}
          </span>
        </div>
        <span
          className={`text-lg font-bold tabular-nums ${isNegativeNet ? 'text-red-400' : 'text-white'}`}
          data-tooltip={`Exact: ${displayedExact.toLocaleString()}`}
        >
          {formatNumber(animatedAmount)}
        </span>
      </div>
      {/* Bottom row: Production rates (only if there's production/consumption) */}
      {(produced > 0 || consumed > 0) && (
        <div className="flex items-center justify-end gap-2 mt-1 text-xs">
          {produced > 0 && (
            <span
              className="text-green-400"
              data-tooltip={`Exact: +${produced.toFixed(1)}/min`}
            >
              +{formatNumber(produced)}/min
            </span>
          )}
          {consumed > 0 && (
            <span
              className="text-orange-400"
              data-tooltip={`Exact: -${consumed.toFixed(1)}/min`}
            >
              -{formatNumber(consumed)}/min
            </span>
          )}
          <span
            className={net > 0 ? 'text-green-500 font-semibold' : net < 0 ? 'text-red-500 font-semibold' : 'text-gray-400'}
            data-tooltip={`Exact net: ${net > 0 ? '+' : ''}${net.toFixed(1)}/min`}
          >
            = {net > 0 ? '+' : ''}{formatNumber(Math.abs(net))}/min
          </span>
        </div>
      )}
    </div>
  );
}
