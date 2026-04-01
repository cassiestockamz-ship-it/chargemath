/**
 * Solar production data by state.
 * Peak sun hours sourced from NREL solar resource data.
 * kWh/kW/yr = peak sun hours/day * 365 * system performance ratio (0.80)
 */

export interface SolarStateData {
  peakSunHours: number; // annual average hours/day
  kwhPerKwYear: number; // kWh produced per kW installed per year
  avgInstallCostPerWatt: number; // $/watt before incentives (2026 avg)
}

export const SOLAR_DATA: Record<string, SolarStateData> = {
  AL: { peakSunHours: 4.86, kwhPerKwYear: 1420, avgInstallCostPerWatt: 2.68 },
  AK: { peakSunHours: 3.10, kwhPerKwYear: 905, avgInstallCostPerWatt: 2.90 },
  AZ: { peakSunHours: 6.57, kwhPerKwYear: 1918, avgInstallCostPerWatt: 2.55 },
  AR: { peakSunHours: 4.79, kwhPerKwYear: 1399, avgInstallCostPerWatt: 2.72 },
  CA: { peakSunHours: 5.38, kwhPerKwYear: 1571, avgInstallCostPerWatt: 2.85 },
  CO: { peakSunHours: 5.37, kwhPerKwYear: 1568, avgInstallCostPerWatt: 2.75 },
  CT: { peakSunHours: 3.84, kwhPerKwYear: 1121, avgInstallCostPerWatt: 3.08 },
  DE: { peakSunHours: 4.23, kwhPerKwYear: 1235, avgInstallCostPerWatt: 2.82 },
  FL: { peakSunHours: 5.67, kwhPerKwYear: 1656, avgInstallCostPerWatt: 2.60 },
  GA: { peakSunHours: 5.16, kwhPerKwYear: 1507, avgInstallCostPerWatt: 2.65 },
  HI: { peakSunHours: 5.59, kwhPerKwYear: 1632, avgInstallCostPerWatt: 3.20 },
  ID: { peakSunHours: 4.70, kwhPerKwYear: 1372, avgInstallCostPerWatt: 2.78 },
  IL: { peakSunHours: 4.08, kwhPerKwYear: 1191, avgInstallCostPerWatt: 2.88 },
  IN: { peakSunHours: 4.02, kwhPerKwYear: 1174, avgInstallCostPerWatt: 2.85 },
  IA: { peakSunHours: 4.14, kwhPerKwYear: 1209, avgInstallCostPerWatt: 2.82 },
  KS: { peakSunHours: 4.90, kwhPerKwYear: 1431, avgInstallCostPerWatt: 2.70 },
  KY: { peakSunHours: 4.15, kwhPerKwYear: 1212, avgInstallCostPerWatt: 2.75 },
  LA: { peakSunHours: 4.92, kwhPerKwYear: 1437, avgInstallCostPerWatt: 2.65 },
  ME: { peakSunHours: 3.79, kwhPerKwYear: 1107, avgInstallCostPerWatt: 3.05 },
  MD: { peakSunHours: 4.25, kwhPerKwYear: 1241, avgInstallCostPerWatt: 2.85 },
  MA: { peakSunHours: 3.84, kwhPerKwYear: 1121, avgInstallCostPerWatt: 3.15 },
  MI: { peakSunHours: 3.56, kwhPerKwYear: 1040, avgInstallCostPerWatt: 2.90 },
  MN: { peakSunHours: 3.93, kwhPerKwYear: 1148, avgInstallCostPerWatt: 2.88 },
  MS: { peakSunHours: 4.86, kwhPerKwYear: 1420, avgInstallCostPerWatt: 2.65 },
  MO: { peakSunHours: 4.53, kwhPerKwYear: 1323, avgInstallCostPerWatt: 2.75 },
  MT: { peakSunHours: 4.20, kwhPerKwYear: 1226, avgInstallCostPerWatt: 2.80 },
  NE: { peakSunHours: 4.55, kwhPerKwYear: 1329, avgInstallCostPerWatt: 2.78 },
  NV: { peakSunHours: 6.41, kwhPerKwYear: 1872, avgInstallCostPerWatt: 2.58 },
  NH: { peakSunHours: 3.79, kwhPerKwYear: 1107, avgInstallCostPerWatt: 3.10 },
  NJ: { peakSunHours: 4.21, kwhPerKwYear: 1229, avgInstallCostPerWatt: 2.88 },
  NM: { peakSunHours: 6.33, kwhPerKwYear: 1848, avgInstallCostPerWatt: 2.60 },
  NY: { peakSunHours: 3.79, kwhPerKwYear: 1107, avgInstallCostPerWatt: 3.12 },
  NC: { peakSunHours: 4.71, kwhPerKwYear: 1375, avgInstallCostPerWatt: 2.70 },
  ND: { peakSunHours: 4.08, kwhPerKwYear: 1191, avgInstallCostPerWatt: 2.80 },
  OH: { peakSunHours: 3.69, kwhPerKwYear: 1077, avgInstallCostPerWatt: 2.85 },
  OK: { peakSunHours: 5.01, kwhPerKwYear: 1463, avgInstallCostPerWatt: 2.68 },
  OR: { peakSunHours: 3.72, kwhPerKwYear: 1086, avgInstallCostPerWatt: 2.82 },
  PA: { peakSunHours: 3.85, kwhPerKwYear: 1124, avgInstallCostPerWatt: 2.90 },
  RI: { peakSunHours: 3.91, kwhPerKwYear: 1142, avgInstallCostPerWatt: 3.05 },
  SC: { peakSunHours: 5.06, kwhPerKwYear: 1478, avgInstallCostPerWatt: 2.65 },
  SD: { peakSunHours: 4.44, kwhPerKwYear: 1296, avgInstallCostPerWatt: 2.78 },
  TN: { peakSunHours: 4.45, kwhPerKwYear: 1299, avgInstallCostPerWatt: 2.72 },
  TX: { peakSunHours: 5.35, kwhPerKwYear: 1562, avgInstallCostPerWatt: 2.60 },
  UT: { peakSunHours: 5.59, kwhPerKwYear: 1632, avgInstallCostPerWatt: 2.65 },
  VT: { peakSunHours: 3.61, kwhPerKwYear: 1054, avgInstallCostPerWatt: 3.10 },
  VA: { peakSunHours: 4.36, kwhPerKwYear: 1273, avgInstallCostPerWatt: 2.78 },
  WA: { peakSunHours: 3.57, kwhPerKwYear: 1042, avgInstallCostPerWatt: 2.85 },
  WV: { peakSunHours: 3.85, kwhPerKwYear: 1124, avgInstallCostPerWatt: 2.80 },
  WI: { peakSunHours: 3.73, kwhPerKwYear: 1089, avgInstallCostPerWatt: 2.88 },
  WY: { peakSunHours: 4.79, kwhPerKwYear: 1399, avgInstallCostPerWatt: 2.75 },
  DC: { peakSunHours: 4.25, kwhPerKwYear: 1241, avgInstallCostPerWatt: 3.00 },
};

/** National average solar production (kWh per kW installed per year) */
export const NATIONAL_AVG_SOLAR_PRODUCTION = 1300;

/** National average install cost per watt */
export const NATIONAL_AVG_COST_PER_WATT = 2.80;

/** Common home battery products for reference */
export const HOME_BATTERIES = [
  { name: "Tesla Powerwall 3", capacityKwh: 13.5, roundTripEfficiency: 0.975, costEstimate: 12500 },
  { name: "Enphase IQ Battery 5P", capacityKwh: 5, roundTripEfficiency: 0.96, costEstimate: 5500 },
  { name: "Enphase IQ Battery 10T", capacityKwh: 10, roundTripEfficiency: 0.96, costEstimate: 9500 },
  { name: "Franklin WH aPower", capacityKwh: 13.6, roundTripEfficiency: 0.965, costEstimate: 11000 },
  { name: "SolarEdge Home Battery", capacityKwh: 10, roundTripEfficiency: 0.945, costEstimate: 9000 },
  { name: "Generac PWRcell", capacityKwh: 9, roundTripEfficiency: 0.967, costEstimate: 10000 },
  { name: "EcoFlow DELTA Pro Ultra X", capacityKwh: 12, roundTripEfficiency: 0.95, costEstimate: 8000 },
  { name: "EcoFlow DELTA Pro Ultra", capacityKwh: 6, roundTripEfficiency: 0.95, costEstimate: 5500 },
];
