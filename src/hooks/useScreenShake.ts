import { useCallback, useRef } from 'react';

/**
 * Hook that provides a screen shake function.
 * Applies a CSS shake animation to a target element ref.
 * Debounced — only shakes once per 500ms.
 */
export function useScreenShake() {
  const shakeRef = useRef<HTMLDivElement>(null);
  const lastShake = useRef(0);

  const shake = useCallback(() => {
    const now = Date.now();
    if (now - lastShake.current < 500) return; // debounce
    lastShake.current = now;

    const el = shakeRef.current;
    if (!el) return;

    el.classList.remove('animate-screen-shake');
    // Force reflow so re-adding the class restarts the animation
    void el.offsetWidth;
    el.classList.add('animate-screen-shake');

    // Clean up after animation
    const handler = () => {
      el.classList.remove('animate-screen-shake');
      el.removeEventListener('animationend', handler);
    };
    el.addEventListener('animationend', handler);
  }, []);

  return { shakeRef, shake };
}
