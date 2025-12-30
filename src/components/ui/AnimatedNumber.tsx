import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number; // Animation duration in ms
  formatFn?: (value: number) => string;
  className?: string;
}

/**
 * A component that smoothly animates between number values
 * Uses requestAnimationFrame for smooth 60fps animations
 */
export function AnimatedNumber({
  value,
  duration = 500,
  formatFn = (v) => v.toLocaleString(),
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const previousValue = previousValueRef.current;

    // If value hasn't changed, don't animate
    if (previousValue === value) {
      return;
    }

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startValue = displayValue;
    const difference = value - startValue;

    // If difference is very small, just set directly
    if (Math.abs(difference) < 0.01) {
      setDisplayValue(value);
      previousValueRef.current = value;
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + difference * eased;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        previousValueRef.current = value;
        startTimeRef.current = null;
      }
    };

    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, displayValue]);

  // Update ref when value changes
  useEffect(() => {
    previousValueRef.current = value;
  }, [value]);

  return (
    <span className={className}>
      {formatFn(Math.round(displayValue))}
    </span>
  );
}

/**
 * A simpler hook version for use in custom components
 */
export function useAnimatedNumber(value: number, duration: number = 500): number {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(value);

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startValue = startValueRef.current;
    const difference = value - startValue;

    if (Math.abs(difference) < 0.01) {
      setDisplayValue(value);
      startValueRef.current = value;
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(startValue + difference * eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        startValueRef.current = value;
        startTimeRef.current = null;
      }
    };

    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  useEffect(() => {
    startValueRef.current = displayValue;
  }, [displayValue]);

  return Math.round(displayValue);
}
