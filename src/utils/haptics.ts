/**
 * Haptic feedback via navigator.vibrate()
 * Works on Android Chrome. Silent no-op on iOS and unsupported browsers.
 */

function vibrate(pattern: number | number[]) {
  try {
    navigator?.vibrate?.(pattern);
  } catch {
    // Silently ignore — vibrate not supported
  }
}

/** Light tap — button press, toggle */
export function hapticTap() {
  vibrate(8);
}

/** Medium feedback — upgrade, resource gain */
export function hapticSuccess() {
  vibrate(25);
}

/** Strong pattern — achievement unlock, expedition complete */
export function hapticAchievement() {
  vibrate([30, 50, 30]);
}
