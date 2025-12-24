import { RESOURCES } from '../../game/config/resources';
import { FOOD_ITEMS } from '../../game/config/food';
import { formatNumber, formatTime } from '../../utils/formatters';
import { OFFLINE_EFFICIENCY_MULTIPLIER, MAX_OFFLINE_HOURS } from '../../utils/offlineProgress';
import { ResourceId, FoodId } from '../../types/game.types';

interface OfflineProgressModalProps {
  offlineSeconds: number;
  cappedMinutes: number;
  resourcesProduced: Record<string, number>;
  foodProduced: Record<string, number>;
  wasOnExpedition: boolean;
  onClose: () => void;
}

export function OfflineProgressModal({
  offlineSeconds,
  cappedMinutes,
  resourcesProduced,
  foodProduced,
  wasOnExpedition,
  onClose,
}: OfflineProgressModalProps) {
  const hasProduction = Object.keys(resourcesProduced).length > 0 || Object.keys(foodProduced).length > 0;
  const wasCapped = offlineSeconds / 60 > cappedMinutes;
  const efficiencyPercent = Math.round(OFFLINE_EFFICIENCY_MULTIPLIER * 100);

  // Sort resources by amount produced (highest first)
  const sortedResources = Object.entries(resourcesProduced)
    .filter(([_, amount]) => amount > 0.01) // Filter out tiny amounts
    .sort((a, b) => b[1] - a[1]);

  // Sort food by amount produced (highest first)
  const sortedFood = Object.entries(foodProduced)
    .filter(([_, amount]) => amount > 0.01)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 overflow-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="min-h-full flex items-center justify-center p-4 pt-8 pb-24">
      <div className="bg-gray-900 border-2 border-green-500 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="text-4xl">💤</div>
            <div>
              <h2 className="text-xl font-bold text-green-200">Welcome Back!</h2>
              <p className="text-sm text-green-300">
                You were away for {formatTime(offlineSeconds)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Expedition Warning */}
          {wasOnExpedition && (
            <div className="bg-orange-900/50 border border-orange-500 rounded-lg p-3">
              <p className="text-orange-300 text-sm">
                Dr. Redd was on an expedition, so automations were paused.
              </p>
            </div>
          )}

          {/* Cap Notice */}
          {wasCapped && !wasOnExpedition && (
            <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-3">
              <p className="text-blue-300 text-sm">
                Offline progress is capped at {MAX_OFFLINE_HOURS} hours.
              </p>
            </div>
          )}

          {/* Efficiency Info */}
          {!wasOnExpedition && (
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-300 text-sm">
                Automations produced at <span className="text-green-400 font-semibold">{efficiencyPercent}% efficiency</span> while offline.
              </p>
            </div>
          )}

          {/* Production Summary */}
          {hasProduction ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                Resources Produced
              </h3>

              {/* Resources */}
              {sortedResources.length > 0 && (
                <div className="space-y-2">
                  {sortedResources.map(([resourceId, amount]) => {
                    const resource = RESOURCES[resourceId as ResourceId];
                    return (
                      <div
                        key={resourceId}
                        className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{resource?.icon || '📦'}</span>
                          <span className="text-white text-sm">{resource?.name || resourceId}</span>
                        </div>
                        <span className="text-green-400 font-semibold">
                          +{formatNumber(amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Food */}
              {sortedFood.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-4">
                    Food Produced
                  </h3>
                  <div className="space-y-2">
                    {sortedFood.map(([foodId, amount]) => {
                      const food = FOOD_ITEMS[foodId as FoodId];
                      return (
                        <div
                          key={foodId}
                          className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{food?.icon || '🍽️'}</span>
                            <span className="text-white text-sm">{food?.name || foodId}</span>
                          </div>
                          <span className="text-green-400 font-semibold">
                            +{formatNumber(amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : !wasOnExpedition ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🤷</div>
              <p className="text-gray-400">No automations were running while you were away.</p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
