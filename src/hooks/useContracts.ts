import { useEffect, useRef } from 'react';
import { useGame } from '../game/state/GameContext';
import { refreshContracts, updateContractProgress, getTodayString } from '../game/config/contracts';
import { Contract } from '../types/game.types';
import { getAllBiomeResources } from '../utils/calculations';

/**
 * Hook that manages contract lifecycle:
 * 1. Generates/refreshes contracts on mount and when dates change
 * 2. Detects game actions via lifetimeStats diffs
 * 3. Tracks production/snapshot-based contracts every 5 seconds
 */
export function useContracts() {
  const { state, dispatch } = useGame();
  const stateRef = useRef(state);
  const lastResourcesRef = useRef<Record<string, number>>({});
  const lastCheckDateRef = useRef('');

  // Track previous lifetimeStats for action detection
  const prevStatsRef = useRef({
    totalResourcesGathered: state.lifetimeStats?.totalResourcesGathered || 0,
    totalAutomationsBuilt: state.lifetimeStats?.totalAutomationsBuilt || 0,
    totalUpgradesPurchased: state.lifetimeStats?.totalUpgradesPurchased || 0,
    totalExpeditionsCompleted: state.lifetimeStats?.totalExpeditionsCompleted || 0,
  });

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Initialize/refresh contracts on mount and periodically check for date rollover
  useEffect(() => {
    const check = () => {
      const today = getTodayString();
      if (lastCheckDateRef.current === today) return;
      lastCheckDateRef.current = today;

      const current = stateRef.current;
      const refreshed = refreshContracts(current);

      const needsUpdate =
        refreshed.lastDailyReset !== current.contracts?.lastDailyReset ||
        refreshed.lastWeeklyReset !== current.contracts?.lastWeeklyReset ||
        !current.contracts;

      if (needsUpdate) {
        dispatch({ type: 'UPDATE_CONTRACTS', payload: { contracts: refreshed } });
      }
    };

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Detect discrete game actions via lifetimeStats changes
  useEffect(() => {
    if (!state.contracts) return;

    const stats = state.lifetimeStats;
    const prev = prevStatsRef.current;
    const actions: Array<{ type: string; payload?: Record<string, unknown> }> = [];

    // Detect new gathers
    const gatherDelta = (stats?.totalResourcesGathered || 0) - prev.totalResourcesGathered;
    if (gatherDelta > 0) {
      // We can't know which resource was gathered from stats alone,
      // but the gather tracking also works through resource snapshot diffs below
    }

    // Detect new automation builds
    if ((stats?.totalAutomationsBuilt || 0) > prev.totalAutomationsBuilt) {
      actions.push({ type: 'BUILD_AUTOMATION' });
    }

    // Detect new upgrades
    const upgradeDelta = (stats?.totalUpgradesPurchased || 0) - prev.totalUpgradesPurchased;
    if (upgradeDelta > 0) {
      for (let i = 0; i < upgradeDelta; i++) {
        actions.push({ type: 'UPGRADE_AUTOMATION' });
      }
    }

    // Detect completed expeditions
    if ((stats?.totalExpeditionsCompleted || 0) > prev.totalExpeditionsCompleted) {
      actions.push({ type: 'COLLECT_EXPEDITION' });
    }

    // Update prev stats
    prevStatsRef.current = {
      totalResourcesGathered: stats?.totalResourcesGathered || 0,
      totalAutomationsBuilt: stats?.totalAutomationsBuilt || 0,
      totalUpgradesPurchased: stats?.totalUpgradesPurchased || 0,
      totalExpeditionsCompleted: stats?.totalExpeditionsCompleted || 0,
    };

    if (actions.length === 0) return;

    // Apply all detected actions
    let daily = [...state.contracts.daily];
    let weekly = [...state.contracts.weekly];
    let changed = false;

    for (const action of actions) {
      const newDaily = updateContractProgress(daily, action, state);
      const newWeekly = updateContractProgress(weekly, action, state);

      if (newDaily.some((c, i) => c !== daily[i]) || newWeekly.some((c, i) => c !== weekly[i])) {
        daily = newDaily;
        weekly = newWeekly;
        changed = true;
      }
    }

    if (changed) {
      dispatch({
        type: 'UPDATE_CONTRACTS',
        payload: {
          contracts: { ...state.contracts, daily, weekly },
        },
      });
    }
  }, [state.lifetimeStats, state.contracts, dispatch, state]);

  // Track production, food, level_up, and gather contracts via resource snapshots (every 5s)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = stateRef.current;
      if (!current.contracts) return;

      const allContracts = [...current.contracts.daily, ...current.contracts.weekly];
      const needsTracking = allContracts.some(
        c => !c.completed && (c.category === 'produce' || c.category === 'food' || c.category === 'level_up' || c.category === 'gather')
      );
      if (!needsTracking) return;

      const allResources = getAllBiomeResources(current.biomes);
      let changed = false;

      const updateList = (contracts: Contract[]): Contract[] => {
        return contracts.map(contract => {
          if (contract.completed) return contract;

          let newProgress = contract.progress;

          if ((contract.category === 'produce' || contract.category === 'gather') && contract.trackingParams?.resourceId) {
            const resourceId = contract.trackingParams.resourceId;
            const currentAmount = Math.floor(allResources[resourceId] || 0);
            const key = `${contract.category}-${resourceId}`;
            const lastAmount = lastResourcesRef.current[key];

            // Only track delta if we have a previous baseline (skip first tick)
            if (lastAmount !== undefined && currentAmount > lastAmount) {
              newProgress += (currentAmount - lastAmount);
            }
            // Update baseline
            lastResourcesRef.current[key] = currentAmount;
          }

          if (contract.category === 'food') {
            const totalFood = Object.values(current.food).reduce((s, a) => s + a, 0);
            newProgress = Math.floor(totalFood);
          }

          if (contract.category === 'level_up' && contract.trackingParams?.automationType) {
            let maxLevel = 0;
            for (const biomeId of current.unlockedBiomes) {
              for (const auto of current.biomes[biomeId].automations) {
                if (auto.type === contract.trackingParams.automationType) {
                  maxLevel = Math.max(maxLevel, auto.level);
                }
              }
            }
            newProgress = maxLevel;
          }

          if (newProgress !== contract.progress) {
            changed = true;
            const completed = newProgress >= contract.target;
            return { ...contract, progress: Math.min(newProgress, contract.target), completed };
          }
          return contract;
        });
      };

      const updatedDaily = updateList(current.contracts.daily);
      const updatedWeekly = updateList(current.contracts.weekly);

      if (changed) {
        dispatch({
          type: 'UPDATE_CONTRACTS',
          payload: {
            contracts: { ...current.contracts, daily: updatedDaily, weekly: updatedWeekly },
          },
        });
      }
    }, 5000);

    // Initialize resource baselines
    const allResources = getAllBiomeResources(state.biomes);
    const allContracts = [...(state.contracts?.daily || []), ...(state.contracts?.weekly || [])];
    for (const contract of allContracts) {
      if ((contract.category === 'produce' || contract.category === 'gather') && contract.trackingParams?.resourceId) {
        const key = `${contract.category}-${contract.trackingParams.resourceId}`;
        lastResourcesRef.current[key] = Math.floor(allResources[contract.trackingParams.resourceId] || 0);
      }
    }

    return () => clearInterval(interval);
  }, [dispatch, state.biomes, state.contracts, state.food, state.unlockedBiomes]);
}
