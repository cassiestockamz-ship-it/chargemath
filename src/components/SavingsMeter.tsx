"use client";

import CountUp from "./CountUp";

interface Props {
  /** Label for the left column (e.g. "GAS", "GRID", "PUBLIC") */
  leftLabel: string;
  /** Left annual cost (the losing / more-expensive side) */
  leftValue: number;
  /** Label for the right column (e.g. "EV", "SOLAR", "HOME") */
  rightLabel: string;
  /** Right annual cost */
  rightValue: number;
  /** Optional period suffix, default "/yr" */
  period?: string;
  /** Optional middle caption, default "SAVES" */
  verb?: string;
  className?: string;
}

/**
 * The ChargeMath signature interaction. A split-column cost meter that
 * sits above the result grid and morphs as any input changes. Left
 * column is the "losing" option (gas, grid, public charging); right
 * column is the "winning" option (EV, solar, home charging). The
 * middle delta count-ups in volt yellow.
 *
 * This is a pure re-render component: whenever leftValue / rightValue
 * change upstream, the CountUp components re-animate from the current
 * displayed number to the new target.
 */
export default function SavingsMeter({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  period = "/yr",
  verb = "SAVES",
  className = "",
}: Props) {
  const delta = Math.max(0, leftValue - rightValue);
  const total = leftValue + rightValue;
  const leftPct = total > 0 ? Math.round((leftValue / total) * 100) : 50;
  const rightPct = 100 - leftPct;

  return (
    <section
      className={[
        "vt-savings-meter relative overflow-hidden rounded-3xl",
        "bg-[var(--color-surface-ink)] text-white",
        "px-5 py-6 sm:px-8 sm:py-7",
        className,
      ].join(" ")}
      aria-label="Live savings meter"
    >
      {/* Top live indicator */}
      <div className="mb-4 flex items-center gap-2">
        <span className="animate-live-dot grid h-2 w-2 place-items-center rounded-full bg-[var(--color-volt)] shadow-[0_0_8px_var(--color-volt)]" aria-hidden />
        <span className="cm-eyebrow" style={{ color: "rgba(255,255,255,0.6)" }}>
          Live savings meter
        </span>
      </div>

      {/* Three-column grid: left stack, middle delta flash, right stack */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
        {/* LEFT */}
        <div className="flex flex-col items-start">
          <span className="cm-eyebrow mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            {leftLabel}
          </span>
          <span
            className="font-bold leading-none tabular-nums"
            style={{
              fontFamily: "var(--font-display), var(--font-sans), sans-serif",
              fontSize: "clamp(1.9rem, 7vw, 3rem)",
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            <CountUp value={leftValue} duration={700} prefix="$" />
          </span>
          <span className="cm-mono mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            {period}
          </span>
        </div>

        {/* MIDDLE DELTA */}
        <div className="flex flex-col items-center px-1 sm:px-3">
          <div className="cm-eyebrow" style={{ color: "var(--color-volt)" }}>
            {verb}
          </div>
          <div
            className="mt-1 font-bold leading-none tabular-nums"
            style={{
              fontFamily: "var(--font-display), var(--font-sans), sans-serif",
              fontSize: "clamp(1.6rem, 5.5vw, 2.4rem)",
              color: "var(--color-volt)",
              letterSpacing: "-0.02em",
            }}
          >
            <CountUp value={delta} duration={700} prefix="$" />
          </div>
          <div className="cm-mono mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            {period}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-end">
          <span className="cm-eyebrow mb-1" style={{ color: "var(--color-teal)" }}>
            {rightLabel}
          </span>
          <span
            className="font-bold leading-none tabular-nums"
            style={{
              fontFamily: "var(--font-display), var(--font-sans), sans-serif",
              fontSize: "clamp(1.9rem, 7vw, 3rem)",
              letterSpacing: "-0.02em",
              color: "var(--color-teal)",
            }}
          >
            <CountUp value={rightValue} duration={700} prefix="$" />
          </span>
          <span className="cm-mono mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            {period}
          </span>
        </div>
      </div>

      {/* Proportional split bar */}
      <div
        className="mt-5 flex h-2 w-full overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.08)" }}
        aria-hidden
      >
        <div
          className="h-full transition-[width] duration-500 ease-out"
          style={{
            width: `${leftPct}%`,
            background: "var(--color-warn)",
          }}
        />
        <div
          className="h-full transition-[width] duration-500 ease-out"
          style={{
            width: `${rightPct}%`,
            background: "var(--color-teal)",
          }}
        />
      </div>

      {/* Glow accent in the background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,214,10,0.18), transparent 70%)",
        }}
      />
    </section>
  );
}
