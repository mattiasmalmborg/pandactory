import { useEffect, useRef } from 'react';
import { useGame } from '../game/state/GameContext';
import { checkAchievements } from '../game/config/achievements';

/**
 * Hook that checks for new achievements and unlocks them
 * Runs on every state change and dispatches UNLOCK_ACHIEVEMENT for any newly earned achievements
 */
export function useAchievements() {
  const { state, dispatch } = useGame();
  const lastCheckRef = useRef<string>('');

  useEffect(() => {
    // Calculate max automation level across all biomes
    let maxAutomationLevel = 0;
    let automationsAtLevel100 = 0;
    let totalInstalledPowerCells = 0;
    let greenCells = 0;
    let blueCells = 0;
    let orangeCells = 0;

    Object.values(state.biomes).forEach(biome => {
      biome.automations.forEach(a => {
        if (a.level > maxAutomationLevel) {
          maxAutomationLevel = a.level;
        }
        if (a.level >= 100) {
          automationsAtLevel100++;
        }
        if (a.powerCell) {
          totalInstalledPowerCells++;
          if (a.powerCell.tier === 'green') greenCells++;
          if (a.powerCell.tier === 'blue') blueCells++;
          if (a.powerCell.tier === 'orange') orangeCells++;
        }
      });
    });

    // Count discovered resources per biome
    const discoveredResourceCounts = Object.values(state.biomes).map(b =>
      (b.discoveredResources || []).length
    );

    // Count max resource amount for hoarder achievement
    let maxResourceAmount = 0;
    Object.values(state.biomes).forEach(biome => {
      Object.values(biome.resources).forEach(amount => {
        if (amount > maxResourceAmount) {
          maxResourceAmount = amount;
        }
      });
    });

    // Count total automations from current state
    let currentAutomationCount = 0;
    Object.values(state.biomes).forEach(biome => {
      currentAutomationCount += biome.automations.length;
    });

    // Create a simple hash of relevant state to avoid checking too frequently
    const stateHash = JSON.stringify({
      resources: state.lifetimeStats?.totalResourcesGathered || 0,
      automations: state.lifetimeStats?.totalAutomationsBuilt || 0,
      currentAutomationCount, // Also track actual automation count
      upgrades: state.lifetimeStats?.totalUpgradesPurchased || 0,
      expeditions: state.lifetimeStats?.totalExpeditionsCompleted || 0,
      expeditionCount: state.expeditionCount || 0, // Also track expeditionCount for old saves
      expeditionsByTier: state.lifetimeStats?.expeditionsByTier || {},
      biomes: Object.values(state.biomes).filter(b => b.discovered).length,
      activatedBiomes: Object.values(state.biomes).filter(b => b.activated).length,
      prestiges: state.prestige.totalPrestiges,
      shards: state.prestige.cosmicBambooShards,
      skills: state.prestige.unlockedSkills.length,
      powerCells: totalInstalledPowerCells,
      greenCells,
      blueCells,
      orangeCells,
      maxAutomationLevel,
      automationsAtLevel100,
      discoveredResourceCounts,
      discoveredProducedResources: (state.discoveredProducedResources || []).length,
      discoveredProducedFoods: (state.discoveredProducedFoods || []).length,
      maxResourceAmount,
      unlocked: state.achievements?.unlocked?.length || 0,
      currentHour: new Date().getHours(), // For night owl achievement
      // Session stats for secret achievements (check every 100 clicks and periodically)
      sessionClicksRounded: Math.floor((state.sessionStats?.clickCount || 0) / 100) * 100,
      sessionStartTime: state.sessionStats?.sessionStartTime || 0,
    });

    // Skip if nothing relevant changed
    if (stateHash === lastCheckRef.current) {
      return;
    }
    lastCheckRef.current = stateHash;

    // Check for new achievements
    const newAchievements = checkAchievements(state);

    // Unlock each new achievement
    newAchievements.forEach(achievementId => {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId } });
    });
  }, [state, dispatch]);
}
