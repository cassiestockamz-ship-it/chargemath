"use client";

interface Props {
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
  period?: string;
  verb?: string;
  className?: string;
}

/**
 * The ChargeMath signature interaction. Split-column cost meter
 * sitting above the result grid on cost-comparison calculators.
 * Each digit is a vertical column of 0-9 glyphs that translates
 * independently via CSS transform as the value changes, driven by
 * stable position-from-right React keys so React never remounts a
 * slot even when the digit count changes (e.g., $99 becomes $1,234).
 *
 * Left column = losing option (gas, grid, public)
 * Right column = winning option (EV, solar, home)
 * Middle = volt-yellow delta
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
      <div className="mb-4 flex items-center gap-2">
        <span
          className="animate-live-dot grid h-2 w-2 place-items-center rounded-full bg-[var(--color-volt)] shadow-[0_0_8px_var(--color-volt)]"
          aria-hidden
        />
        <span className="cm-eyebrow" style={{ color: "rgba(255,255,255,0.6)" }}>
          Live savings meter
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
        {/* LEFT */}
        <div className="flex flex-col items-start">
          <span className="cm-eyebrow mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            {leftLabel}
          </span>
          <OdometerNumber
            value={leftValue}
            color="#ffffff"
            size="clamp(1.9rem, 7vw, 3rem)"
            prefix="$"
          />
          <span className="cm-mono mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            {period}
          </span>
        </div>

        {/* MIDDLE DELTA */}
        <div className="flex flex-col items-center px-1 sm:px-3">
          <div className="cm-eyebrow" style={{ color: "var(--color-volt)" }}>
            {verb}
          </div>
          <div className="mt-1">
            <OdometerNumber
              value={delta}
              color="var(--color-volt)"
              size="clamp(1.6rem, 5.5vw, 2.4rem)"
              prefix="$"
            />
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
          <OdometerNumber
            value={rightValue}
            color="var(--color-teal)"
            size="clamp(1.9rem, 7vw, 3rem)"
            prefix="$"
          />
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

      {/* Glow accent */}
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

/* ————————————————————————————————————————————————
   OdometerNumber — split-flap digit display with stable keys
   Right-aligned to a fixed max width. Each slot has a stable
   position-from-right key, so React never remounts a slot when
   the digit count changes. Every slot renders the same uniform
   DOM tree (digit column + comma overlay), toggling opacity to
   switch modes, which avoids any flicker on rapid value changes.
   ———————————————————————————————————————————————— */

const MAX_WIDTH = 7; // enough for "999,999"

function OdometerNumber({
  value,
  color,
  size,
  prefix = "",
}: {
  value: number;
  color: string;
  size: string;
  prefix?: string;
}) {
  const rounded = Math.max(0, Math.round(value));
  const formatted = rounded.toLocaleString("en-US");
  const padded = formatted.padStart(MAX_WIDTH, " ");
  // padded[0] is leftmost (position MAX_WIDTH-1 from right), padded[last] is rightmost (position 0).

  return (
    <span
      className="inline-flex items-baseline font-bold tabular-nums"
      style={{
        fontFamily: "var(--font-display), var(--font-sans), sans-serif",
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        color,
      }}
      aria-label={`${prefix}${formatted}`}
    >
      {prefix && (
        <span aria-hidden className="mr-[0.05em]">
          {prefix}
        </span>
      )}
      {[...padded].map((ch, i) => {
        const posFromRight = MAX_WIDTH - 1 - i;
        return <DigitSlot key={`pos-${posFromRight}`} char={ch} />;
      })}
    </span>
  );
}

function DigitSlot({ char }: { char: string }) {
  const isDigit = /^[0-9]$/.test(char);
  const isComma = char === ",";
  const isEmpty = !isDigit && !isComma; // space or anything else

  // Target digit (0 when not a digit — keeps the column at rest while hidden)
  const target = isDigit ? Number(char) : 0;

  // Uniform DOM tree: always contains width-holder + digit column + comma overlay.
  // Opacity toggles control which one is visible. React never swaps nodes.
  return (
    <span
      aria-hidden
      className="relative inline-block overflow-hidden align-baseline"
      style={{
        height: "1em",
        lineHeight: 1,
      }}
    >
      {/* Width holder (invisible 0, provides the tabular slot width) */}
      <span style={{ visibility: "hidden" }}>0</span>

      {/* Rolling digit column (0-9) */}
      <span
        className="absolute left-0 top-0"
        style={{
          transform: `translateY(${-target * 100}%)`,
          transition:
            "transform 420ms cubic-bezier(0.32, 0.72, 0, 1), opacity 220ms ease",
          opacity: isDigit ? 1 : 0,
          willChange: "transform",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <span
            key={d}
            style={{ display: "block", height: "1em", lineHeight: 1 }}
          >
            {d}
          </span>
        ))}
      </span>

      {/* Comma overlay (only visible when char is ',') */}
      <span
        className="absolute left-0 top-0"
        style={{
          opacity: isComma ? 1 : 0,
          transition: "opacity 220ms ease",
          // empty slot gets neither column nor comma visible
          pointerEvents: "none",
        }}
      >
        ,
      </span>
      {/* Hidden fallback so the isEmpty case is handled silently */}
      {isEmpty && <span className="sr-only">{" "}</span>}
    </span>
  );
}
