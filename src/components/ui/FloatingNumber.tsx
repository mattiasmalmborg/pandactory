import { useState, useEffect, useRef } from 'react';

// Hook for animating number changes with smooth counting
export function useAnimatedNumber(value: number, duration: number = 300): number {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (previousValue.current === value) return;

    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
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
