import CountUp from "./CountUp";

interface Props {
  /** Percentage 0-100. The arc fills proportionally. */
  percent: number;
  /** Label below the number, e.g. "SAVINGS", "OF FUEL CUT" */
  label?: string;
  /** Stroke color. Defaults to Voltline volt yellow. */
  color?: string;
  size?: number;
}

/**
 * Circular payoff / savings dial. The arc sweeps via CSS keyframes on
 * mount, the number count-ups via CountUp. Named for the "what share of
 * your fuel cost does going electric wipe out" number, but any 0-100
 * metric works.
 *
 * Ported from recallscanner ScoreDial; repainted in Voltline tokens.
 * Circumference: 2 * PI * 45 ~= 282.743
 */
export default function PayoffDial({
  percent,
  label = "SAVINGS",
  color = "var(--color-volt)",
  size = 140,
}: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = 45;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamped / 100) * circ;

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="7"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="animate-score-sweep"
          style={{
            transition:
              "stroke-dashoffset 900ms cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div
            className="text-[36px] font-bold leading-none tabular-nums"
            style={{ color: "var(--color-ink)" }}
            aria-label={`${label} ${clamped} percent`}
          >
            <CountUp value={clamped} duration={900} />
            <span className="text-[18px] ml-0.5" style={{ color: "var(--color-ink-3)" }}>%</span>
          </div>
          <div className="cm-eyebrow mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}
