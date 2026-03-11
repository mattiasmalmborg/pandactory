import { useState, useEffect, useRef } from 'react';

// Hook for animating number changes with smooth counting.
// Handles both continuous production ticks (smooth interpolation)
// and discrete gather clicks (instant snap).
export function useAnimatedNumber(value: number, duration: number = 300): number {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef<number | null>(null);
  const displayRef = useRef(value);

  useEffect(() => {
    const currentDisplay = displayRef.current;
    const delta = Math.abs(value - currentDisplay);

    // Already at target
    if (delta < 0.001) return;

    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Discrete jumps (gather clicks: whole-number changes >= 0.5) snap instantly
    // so the UI feels responsive on tap/click
    const isDiscreteJump = delta >= 0.5 && (delta % 1 < 0.05 || delta % 1 > 0.95);

    if (isDiscreteJump) {
      displayRef.current = value;
      setDisplayValue(value);
      return;
    }

    // Continuous changes (production ticks): animate from current display value
    const startValue = currentDisplay;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * easeProgress;

      displayRef.current = current;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return displayValue;
}

// Animated counter component
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
}

export function AnimatedCounter({ value, duration = 300, format, className = '' }: AnimatedCounterProps) {
  const animatedValue = useAnimatedNumber(value, duration);
  const displayValue = format ? format(animatedValue) : Math.floor(animatedValue).toString();

  return <span className={`animate-count-up ${className}`}>{displayValue}</span>;
}
