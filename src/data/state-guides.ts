import { ELECTRICITY_RATES, NATIONAL_AVERAGE_RATE } from "./electricity-rates";

export interface StateGuideData {
  code: string;
  slug: string;
  state: string;
  rate: number;
  rateVsNational: number; // percentage above/below national average
  monthlyCharging: number; // Tesla Model 3, 35 mi/day
  annualCharging: number;
  annualGasSavings: number;
  costPerMile: number;
  costPerFullCharge: number; // 60 kWh battery
  rank: number; // 1 = cheapest
}

// Tesla Model 3 defaults: 25 kWh/100mi, 60 kWh battery, 272 mi range
const KWH_PER_100MI = 25;
const BATTERY_KWH = 60;
const DAILY_MILES = 35;
const GAS_PRICE = 3.5;
const GAS_MPG = 28;

function slugify(state: string): string {
  return state.toLowerCase().replace(/\s+/g, "-");
}

export function getAllStateGuides(): StateGuideData[] {
  const entries = Object.entries(ELECTRICITY_RATES).map(([code, data]) => {
    const rate = data.residential / 100; // convert cents to dollars
    const dailyKwh = (DAILY_MILES / 100) * KWH_PER_100MI;
    const monthlyKwh = dailyKwh * 30;
    const monthlyCharging = monthlyKwh * rate;
    const annualCharging = monthlyCharging * 12;
    const gasMonthlyCost = ((DAILY_MILES * 30) / GAS_MPG) * GAS_PRICE;
    const annualGasSavings = (gasMonthlyCost - monthlyCharging) * 12;
    const costPerMile = rate * (KWH_PER_100MI / 100);
    const costPerFullCharge = BATTERY_KWH * rate;

    return {
      code,
      slug: slugify(data.state),
      state: data.state,
      rate: data.residential,
      rateVsNational: ((data.residential - NATIONAL_AVERAGE_RATE) / NATIONAL_AVERAGE_RATE) * 100,
      monthlyCharging,
      annualCharging,
      annualGasSavings,
      costPerMile,
      costPerFullCharge,
      rank: 0, // filled below
    };
  });

  // Sort by rate to assign rank
  const sorted = [...entries].sort((a, b) => a.rate - b.rate);
  sorted.forEach((e, i) => {
    e.rank = i + 1;
  });

  return entries;
}

export function getStateGuide(slug: string): StateGuideData | undefined {
  return getAllStateGuides().find((s) => s.slug === slug);
}

export function getStateSlugs(): string[] {
  return Object.values(ELECTRICITY_RATES).map((d) => slugify(d.state));
}
