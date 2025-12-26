import { useState, useEffect } from 'react';
import { useGame } from '../../game/state/GameContext';
import { AUTOMATIONS } from '../../game/config/automations';
import { RESOURCES } from '../../game/config/resources';
import { calculateBiomeProductionRates, getAutomationEfficiency } from '../../utils/allocation';
import { ResourceId } from '../../types/game.types';
import { formatNumber } from '../../utils/formatters';

export type AlertId = string; // Format: "type-biomeId-automationId" or "type-resourceId"

interface Alert {
  id: AlertId;
  type: 'low_efficiency' | 'resource_depleting';
  title: string;
  message: string;
  severity: 'warning' | 'critical';
  timestamp: number;
}

const ALERT_DURATION = 10000; // 10 seconds
const CHECK_INTERVAL = 5000; // Check every 5 seconds
const EFFICIENCY_WARNING_THRESHOLD = 0.5; // Warn when efficiency < 50%
const DEPLETION_WARNING_THRESHOLD = 60; // Warn when resource will run out in < 60 seconds

export function AlertSystem() {
  const { state } = useGame();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const checkForAlerts = () => {
      const newAlerts: Alert[] = [];

      // Calculate global production rates across all biomes for efficiency calculation
      const globalProduction: Partial<Record<ResourceId, number>> = {};
      const globalConsumption: Partial<Record<ResourceId, number>> = {};
      Object.values(state.biomes).forEach(b => {
        if (!b.activated) return;
        const { production, consumption } = calculateBiomeProductionRates(b);
        Object.entries(production).forEach(([resId, rate]) => {
          globalProduction[resId as ResourceId] = (globalProduction[resId as ResourceId] || 0) + rate;
        });
        Object.entries(consumption).forEach(([resId, rate]) => {
          globalConsumption[resId as ResourceId] = (globalConsumption[resId as ResourceId] || 0) + rate;
        });
      });

      // Calculate net production (production minus consumption from OTHER automations)
      const netProduction: Partial<Record<ResourceId, number>> = {};
      Object.keys(globalProduction).forEach(resId => {
        const prod = globalProduction[resId as ResourceId] || 0;
        const cons = globalConsumption[resId as ResourceId] || 0;
        netProduction[resId as ResourceId] = prod - cons;
      });

      // Check each biome for low efficiency automations
      Object.entries(state.biomes).forEach(([biomeId, biome]) => {
        if (!biome.activated) return;

        // Check each automation for low efficiency
        biome.automations.forEach(automation => {
          if (automation.paused) return; // Skip paused automations

          const config = AUTOMATIONS[automation.type];
          if (!config || !config.consumes || config.consumes.length === 0) return;

          // Use the proper efficiency calculation based on production rates
          const efficiency = getAutomationEfficiency(automation, globalProduction);

          if (efficiency < EFFICIENCY_WARNING_THRESHOLD) {
            // Find which resources are bottlenecking
            const missingResources = config.consumes
              .filter(consume => {
                const available = globalProduction[consume.resourceId] || 0;
                return available < consume.amount * config.baseProductionRate;
              })
              .map(consume => RESOURCES[consume.resourceId]?.name || consume.resourceId)
              .join(', ');

            newAlerts.push({
              id: `low_efficiency-${biomeId}-${automation.id}`,
              type: 'low_efficiency',
              title: `Low Efficiency: ${config.name}`,
              message: `Running at ${Math.round(efficiency * 100)}% efficiency. Need more: ${missingResources}`,
              severity: efficiency < 0.25 ? 'critical' : 'warning',
              timestamp: Date.now(),
            });
          }
        });

        // Check for depleting resources
        const { production, consumption } = calculateBiomeProductionRates(biome);

        Object.entries(consumption).forEach(([resourceId, consumeRate]) => {
          const produceRate = production[resourceId as ResourceId] || 0;
          const netRate = produceRate - consumeRate;

          // If net is negative (depleting)
          if (netRate < -0.01) {
            // Get total amount across all biomes
            const totalAmount = Object.values(state.biomes).reduce(
              (sum, b) => sum + (b.resources[resourceId as ResourceId] || 0),
              0
            );

            // Calculate time until depletion (in seconds)
            const timeUntilDepletion = totalAmount / Math.abs(netRate / 60); // netRate is per minute

            if (timeUntilDepletion < DEPLETION_WARNING_THRESHOLD && totalAmount > 0) {
              const resource = RESOURCES[resourceId as ResourceId];
              const timeText = timeUntilDepletion < 10
                ? 'very soon'
                : `in ${Math.round(timeUntilDepletion)}s`;

              newAlerts.push({
                id: `resource_depleting-${resourceId}`,
                type: 'resource_depleting',
                title: `${resource?.icon || ''} ${resource?.name || resourceId} Depleting!`,
                message: `Will run out ${timeText}. Production: ${formatNumber(produceRate)}/min, Consumption: ${formatNumber(consumeRate)}/min`,
                severity: timeUntilDepletion < 10 ? 'critical' : 'warning',
                timestamp: Date.now(),
              });
            }
          }
        });
      });

      setAlerts(newAlerts);
    };

    // Check immediately
    checkForAlerts();

    // Then check periodically
    const interval = setInterval(checkForAlerts, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [state]);

  // Auto-dismiss alerts after duration
  useEffect(() => {
    if (alerts.length === 0) return;

    const timeout = setTimeout(() => {
      const now = Date.now();
      setAlerts(prev => prev.filter(alert => now - alert.timestamp < ALERT_DURATION));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [alerts]);

  const handleDismiss = (alertId: AlertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full px-4 space-y-2">
      {alerts.slice(0, 3).map((alert) => ( // Show max 3 alerts at once
        <div
          key={alert.id}
          className={`backdrop-blur-md rounded-lg p-3 shadow-lg border-2 animate-slide-up ${
            alert.severity === 'critical'
              ? 'bg-red-900/95 border-red-400/50'
              : 'bg-yellow-900/95 border-yellow-400/50'
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 text-xl">
              {alert.severity === 'critical' ? '🚨' : '⚠️'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-bold mb-0.5 ${
                alert.severity === 'critical' ? 'text-red-200' : 'text-yellow-200'
              }`}>
                {alert.title}
              </h4>
              <p className={`text-xs leading-relaxed ${
                alert.severity === 'critical' ? 'text-red-100' : 'text-yellow-100'
              }`}>
                {alert.message}
              </p>
            </div>
            <button
              onClick={() => handleDismiss(alert.id)}
              className={`flex-shrink-0 text-lg font-bold transition-colors ${
                alert.severity === 'critical'
                  ? 'text-red-200 hover:text-white'
                  : 'text-yellow-200 hover:text-white'
              }`}
              aria-label="Dismiss alert"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
