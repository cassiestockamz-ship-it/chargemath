"use client";

import { useState } from "react";

// Rating-standard ratios to EPA, low and high ends, from
// evchargingstations.com/chargingnews/convert-electric-car-range (checked 2026-10-23):
// WLTP x0.85 to 0.90, CLTC x0.70 to 0.75. Applied to the figure as published.
const TO_EPA: Record<string, { label: string; low: number; high: number }> = {
  wltp: { label: "WLTP (Europe, UK)", low: 0.85, high: 0.9 },
  cltc: { label: "CLTC (China)", low: 0.7, high: 0.75 },
};
const KM_PER_MI = 1.609344;

export default function RatingConverter() {
  const [value, setValue] = useState(500);
  const [unit, setUnit] = useState<"km" | "mi">("km");
  const [standard, setStandard] = useState("wltp");
  const r = TO_EPA[standard];
  const miles = unit === "km" ? value / KM_PER_MI : value;
  const lowMi = Math.round(miles * r.low);
  const highMi = Math.round(miles * r.high);
  const lowKm = Math.round(lowMi * KM_PER_MI);
  const highKm = Math.round(highMi * KM_PER_MI);
  const valid = Number.isFinite(value) && value > 0;

  return (
    <section className="mb-10 rounded-xl border border-[var(--color-border)] p-4 sm:p-6">
      <h2 className="mb-2 text-xl font-bold text-[var(--color-text)]">WLTP and CLTC to EPA Range Converter</h2>
      <p className="mb-4 text-sm text-[var(--color-text-muted)]">
        Range figures from Europe (WLTP) and China (CLTC) come from easier test cycles than the US EPA test, so the same car shows a bigger number. Enter the published figure to see its likely EPA equivalent.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-medium text-[var(--color-text)]">
          Published range
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={Number.isFinite(value) ? value : ""}
            onChange={(e) => setValue(parseFloat(e.target.value))}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-[var(--color-text)]">
          Unit
          <select value={unit} onChange={(e) => setUnit(e.target.value as "km" | "mi")} className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2">
            <option value="km">km</option>
            <option value="mi">miles</option>
          </select>
        </label>
        <label className="text-sm font-medium text-[var(--color-text)]">
          Rating standard
          <select value={standard} onChange={(e) => setStandard(e.target.value)} className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2">
            {Object.entries(TO_EPA).map(([k, s]) => (
              <option key={k} value={k}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-4 text-base text-[var(--color-text)]" aria-live="polite">
        {valid
          ? <>Likely EPA range: <strong>{`${lowMi} to ${highMi} miles`}</strong>{` (${lowKm} to ${highKm} km), using a ratio of ${r.low.toFixed(2)} to ${r.high.toFixed(2)} for ${r.label.split(" (")[0]}.`}</>
          : "Enter the published range to convert it."}
      </p>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        Ratios are typical, not exact for every car; source: evchargingstations.com range conversion guide. For range at your speed and temperature, take the EPA figure to the calculator above.
      </p>
    </section>
  );
}
