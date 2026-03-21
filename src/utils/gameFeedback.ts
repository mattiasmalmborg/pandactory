import { hapticTap, hapticSuccess, hapticAchievement } from './haptics';

/** Fire screen shake + haptic for impactful moments */
export function feedbackShake() {
  window.dispatchEvent(new Event('game-shake'));
}

/** Upgrade: glow burst + haptic */
export function feedbackUpgrade() {
  hapticSuccess();
}

/** Build automation: shake + haptic */
export function feedbackBuild() {
  feedbackShake();
  hapticSuccess();
}

/** Achievement: shake + strong haptic */
export function feedbackAchievement() {
  feedbackShake();
  hapticAchievement();
}

/** Button tap: light haptic */
export function feedbackTap() {
  hapticTap();
}
