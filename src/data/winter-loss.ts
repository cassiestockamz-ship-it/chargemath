// Cold-weather range loss with the cabin heater on (share of EPA range),
// by outside temperature in F. Drives /winter-range; page text quotes it
// through winterLossPct so no page types its own figure.
export const WINTER_LOSS_POINTS: [number, number][] = [
  [-20, 0.55],
  [0, 0.5],
  [20, 0.4],
  [40, 0.15],
  [70, 0.0],
  [100, 0.0],
];

export function heatedLossAt(tempF: number): number {
  const p = WINTER_LOSS_POINTS;
  if (tempF <= p[0][0]) return p[0][1];
  if (tempF >= p[p.length - 1][0]) return p[p.length - 1][1];
  for (let i = 0; i < p.length - 1; i++) {
    if (tempF >= p[i][0] && tempF <= p[i + 1][0]) {
      const r = (tempF - p[i][0]) / (p[i + 1][0] - p[i][0]);
      return p[i][1] + r * (p[i + 1][1] - p[i][1]);
    }
  }
  return 0;
}

/** Whole-number percent of range lost at tempF with the heater on. */
export function winterLossPct(tempF: number): number {
  return Math.round(heatedLossAt(tempF) * 100);
}
