import { useEffect, useRef } from 'react';
import { useGame } from '../game/state/GameContext';
import { checkAchievements } from '../game/config/achievements';
import { feedbackAchievement } from '../utils/gameFeedback';

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

    // Create a lightweight hash of relevant state to avoid checking too frequently
    // Using string concatenation instead of JSON.stringify for better performance
    const expeditionsByTier = state.lifetimeStats?.expeditionsByTier;
    const stateHash = [
      state.lifetimeStats?.totalResourcesGathered || 0,
      state.lifetimeStats?.totalAutomationsBuilt || 0,
      currentAutomationCount,
      state.lifetimeStats?.totalUpgradesPurchased || 0,
      state.lifetimeStats?.totalExpeditionsCompleted || 0,
      state.expeditionCount || 0,
      expeditionsByTier ? Object.values(expeditionsByTier).join(',') : '0',
      Object.values(state.biomes).filter(b => b.discovered).length,
      Object.values(state.biomes).filter(b => b.activated).length,
      state.prestige.totalPrestiges,
      state.prestige.cosmicBambooShards,
      state.prestige.unlockedSkills.length,
      totalInstalledPowerCells,
      greenCells, blueCells, orangeCells,
      maxAutomationLevel,
      automationsAtLevel100,
      discoveredResourceCounts.join(','),
      (state.discoveredProducedResources || []).length,
      (state.discoveredProducedFoods || []).length,
      maxResourceAmount,
      state.achievements?.unlocked?.length || 0,
      new Date().getHours(),
      Math.floor((state.sessionStats?.clickCount || 0) / 100) * 100,
      state.sessionStats?.sessionStartTime || 0,
    ].join('|');

    // Skip if nothing relevant changed
    if (stateHash === lastCheckRef.current) {
      return;
    }
    lastCheckRef.current = stateHash;

    // Check for new achievements
    const newAchievements = checkAchievements(state);

    // Unlock each new achievement
    if (newAchievements.length > 0) {
      feedbackAchievement();
    }
    newAchievements.forEach(achievementId => {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId } });
    });
  }, [state, dispatch]);
}
