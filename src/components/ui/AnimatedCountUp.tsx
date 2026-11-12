'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface AnimatedCountUpProps {
  value: number | string;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedCountUp({
  value,
  decimals = 1,
  duration = 400,
  prefix = '',
  suffix = '',
  className = '',
  style,
}: AnimatedCountUpProps) {
  const numericVal =
    typeof value === 'number'
      ? value
      : !isNaN(Number(value))
      ? Number(value)
      : null;

  const currentValRef = useRef<number>(numericVal ?? 0);
  const rafRef = useRef<number>(0);

  const [displayStr, setDisplayStr] = useState<string>(() =>
    numericVal !== null ? `${prefix}${numericVal.toFixed(decimals)}${suffix}` : String(value)
  );

  useEffect(() => {
    if (numericVal === null) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setDisplayStr(String(value));
      return;
    }

    const startVal = currentValRef.current;
    const endVal = numericVal;
    if (startVal === endVal) {
      setDisplayStr(`${prefix}${endVal.toFixed(decimals)}${suffix}`);
      return;
    }

    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Easing: easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const interpolated = startVal + (endVal - startVal) * easeProgress;

      currentValRef.current = interpolated;
      setDisplayStr(`${prefix}${interpolated.toFixed(decimals)}${suffix}`);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        currentValRef.current = endVal;
        setDisplayStr(`${prefix}${endVal.toFixed(decimals)}${suffix}`);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [numericVal, decimals, duration, prefix, suffix, value]);

  return (
    <span className={className} style={style}>
      {displayStr}
    </span>
  );
}
