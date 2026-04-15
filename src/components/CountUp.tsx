"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  decimals?: number;
}

/**
 * Count-up animation. Ticks from 0 to `value` (or from the last displayed
 * number to the new target on re-animate) over `duration` ms using a
 * single requestAnimationFrame loop with ease-out cubic. Respects
 * prefers-reduced-motion (snaps straight to target).
 *
 * Ported from recallscanner with a `decimals` prop for fractional values
 * like cost-per-mile ($0.04).
 */
export default function CountUp({
  value,
  duration = 800,
  className,
  prefix = "",
  suffix = "",
  format,
  decimals = 0,
}: Props) {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }

    const start = performance.now();
    const from = fromRef.current;
    const to = value;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  const rounded =
    decimals > 0
      ? Number(display.toFixed(decimals))
      : Math.round(display);
  const output = format
    ? format(rounded)
    : rounded.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return (
    <span className={className}>
      {prefix}
      {output}
      {suffix}
    </span>
  );
}
