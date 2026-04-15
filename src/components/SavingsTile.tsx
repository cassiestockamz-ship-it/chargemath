"use client";

import { ReactNode } from "react";
import CountUp from "./CountUp";

export type Tier = "brand" | "volt" | "good" | "mid" | "warn";

export interface CompareBar {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  /** Short uppercase eyebrow label */
  label: string;
  /** Primary numeric value to display (animated via CountUp) */
  value: number;
  /** Unit suffix, e.g. "/mo", "/yr", "/mi", "%" */
  unit?: string;
  /** Currency prefix, e.g. "$" */
  prefix?: string;
  /** Number of decimals on the primary value (default 0) */
  decimals?: number;
  /** Optional icon slot (pass a SVG or any ReactNode) */
  icon?: ReactNode;
  /** default | hero | compare */
  variant?: "default" | "hero" | "compare";
  /** Color tier */
  tier?: Tier;
  /** Optional delta pill shown top-right */
  delta?: { value: string; trend?: "up" | "down" | "flat" };
  /** Sub-line muted explainer */
  sub?: ReactNode;
  /** Optional comparison bars row shown below the number */
  compareBars?: CompareBar[];
  /** Animate on mount (default true) */
  animate?: boolean;
  /** Override CountUp duration (ms) */
  duration?: number;
  /** Extra className on outer article */
  className?: string;
  /** Mark this as the hero number (adds vt-hero-number for View Transitions) */
  heroMorph?: boolean;
}

const railFor = (tier: Tier) =>
  ({
    brand: "rail-brand",
    volt: "rail-volt",
    good: "rail-good",
    mid: "rail-mid",
    warn: "rail-warn",
  }[tier]);

const tierInk = (tier: Tier) =>
  ({
    brand: "var(--color-brand-ink)",
    volt: "var(--color-ink)",
    good: "var(--color-good-ink)",
    mid: "var(--color-mid-ink)",
    warn: "var(--color-warn-ink)",
  }[tier]);

const tierSoft = (tier: Tier) =>
  ({
    brand: "var(--color-brand-soft)",
    volt: "var(--color-volt-soft)",
    good: "var(--color-good-soft)",
    mid: "var(--color-mid-soft)",
    warn: "var(--color-warn-soft)",
  }[tier]);

/**
 * The ChargeMath atomic unit. One component, rendered everywhere a
 * result number appears. Count-up number, optional compareBars footer,
 * optional delta pill, optional explainer sub-line, rail color tier.
 *
 * variant="hero"     — oversized number, shown once per calculator at top
 * variant="default"  — standard tile in a grid
 * variant="compare"  — default but also shows compareBars by default
 */
export default function SavingsTile({
  label,
  value,
  unit,
  prefix,
  decimals = 0,
  icon,
  variant = "default",
  tier = "brand",
  delta,
  sub,
  compareBars,
  animate = true,
  duration,
  className = "",
  heroMorph = false,
}: Props) {
  const isHero = variant === "hero";
  const rail = railFor(tier);
  const numberColor = tierInk(tier);
  const iconBg = tierSoft(tier);

  const numberClass = isHero ? "cm-hero-number" : "cm-result-number";

  return (
    <article
      className={[
        rail,
        "relative rounded-2xl border border-[var(--color-border)] bg-white p-5 sm:p-6",
        "flex flex-col gap-3",
        isHero ? "sm:p-7" : "",
        className,
      ].join(" ")}
      aria-live="polite"
    >
      {/* Top row: icon + eyebrow + optional delta */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && (
            <span
              className="grid h-9 w-9 place-items-center rounded-lg"
              style={{ background: iconBg, color: numberColor }}
              aria-hidden
            >
              {icon}
            </span>
          )}
          <span className="cm-eyebrow">{label}</span>
        </div>
        {delta && (
          <span
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-ink-2)]"
            aria-label={`Delta ${delta.value}`}
          >
            {delta.trend === "up" ? "▲ " : delta.trend === "down" ? "▼ " : ""}
            {delta.value}
          </span>
        )}
      </div>

      {/* Main row: big number + unit */}
      <div className="flex items-baseline gap-1.5">
        <span
          className={`${numberClass} ${heroMorph ? "vt-hero-number" : ""}`}
          style={{ color: numberColor }}
        >
          {animate ? (
            <CountUp
              value={value}
              duration={duration ?? (isHero ? 900 : 600)}
              prefix={prefix}
              decimals={decimals}
            />
          ) : (
            <>
              {prefix}
              {value.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              })}
            </>
          )}
        </span>
        {unit && <span className="cm-mono">{unit}</span>}
      </div>

      {/* Sub-line explainer */}
      {sub && (
        <div className="text-sm text-[var(--color-ink-2)]">{sub}</div>
      )}

      {/* Comparison bars (optional footer) */}
      {compareBars && compareBars.length > 0 && (
        <div className="mt-1 flex flex-col gap-2">
          {compareBars.map((bar, i) => {
            const max = Math.max(...compareBars.map((b) => b.value));
            const pct = max === 0 ? 0 : Math.round((bar.value / max) * 100);
            return (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="cm-mono w-12 shrink-0"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  {bar.label}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
                  <div
                    className="animate-bar-fill absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: bar.color ?? "var(--color-brand)",
                    }}
                  />
                </div>
                <span className="cm-mono w-14 shrink-0 text-right tabular-nums">
                  {bar.value.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
