/**
 * Curated DC fast-charging curves for popular EVs. All data synthesized from
 * publicly available tests by InsideEVs, Out of Spec Studios, Bjorn Nyland,
 * and Fastned network statistics. Numbers are representative of a well-
 * preconditioned battery at moderate ambient temperature; cold-start or
 * hot-battery curves differ significantly.
 *
 * Each curve is an array of [SOC %, kW] control points. The interpolator
 * uses a piecewise-linear fit between points. Peak kW is the maximum point.
 */

export interface ChargeCurve {
  id: string;
  make: string;
  model: string;
  year: number;
  batteryKwh: number;
  voltageArchitecture: 400 | 800;
  // [soc%, kW] control points, sorted ascending by SOC
  curve: Array<[number, number]>;
  notes?: string;
}

export const CHARGE_CURVES: ChargeCurve[] = [
  {
    id: "tesla-model-3-lr-2024",
    make: "Tesla",
    model: "Model 3 Long Range",
    year: 2024,
    batteryKwh: 75,
    voltageArchitecture: 400,
    curve: [
      [0, 170],
      [10, 250],
      [20, 250],
      [30, 230],
      [40, 180],
      [50, 140],
      [60, 115],
      [70, 90],
      [80, 65],
      [90, 45],
      [100, 0],
    ],
  },
  {
    id: "tesla-model-y-lr-2024",
    make: "Tesla",
    model: "Model Y Long Range",
    year: 2024,
    batteryKwh: 75,
    voltageArchitecture: 400,
    curve: [
      [0, 170],
      [10, 250],
      [20, 250],
      [30, 225],
      [40, 175],
      [50, 135],
      [60, 110],
      [70, 88],
      [80, 62],
      [90, 42],
      [100, 0],
    ],
  },
  {
    id: "hyundai-ioniq-5-2024",
    make: "Hyundai",
    model: "Ioniq 5 (800V)",
    year: 2024,
    batteryKwh: 77,
    voltageArchitecture: 800,
    curve: [
      [0, 180],
      [5, 230],
      [10, 235],
      [20, 235],
      [30, 235],
      [40, 230],
      [50, 220],
      [55, 155],
      [60, 135],
      [70, 105],
      [80, 50],
      [90, 35],
      [100, 0],
    ],
    notes: "Very flat peak thanks to 800V architecture, then sharp step-down at ~55%",
  },
  {
    id: "kia-ev6-2024",
    make: "Kia",
    model: "EV6 (800V)",
    year: 2024,
    batteryKwh: 77,
    voltageArchitecture: 800,
    curve: [
      [0, 180],
      [5, 233],
      [10, 233],
      [20, 233],
      [30, 233],
      [40, 227],
      [50, 215],
      [55, 150],
      [60, 130],
      [70, 100],
      [80, 48],
      [90, 33],
      [100, 0],
    ],
  },
  {
    id: "ford-mustang-mach-e-2024",
    make: "Ford",
    model: "Mustang Mach-E ER",
    year: 2024,
    batteryKwh: 91,
    voltageArchitecture: 400,
    curve: [
      [0, 100],
      [10, 150],
      [20, 150],
      [30, 140],
      [40, 110],
      [50, 95],
      [60, 75],
      [70, 55],
      [80, 40],
      [90, 28],
      [100, 0],
    ],
  },
  {
    id: "chevy-bolt-euv-2023",
    make: "Chevy",
    model: "Bolt EUV",
    year: 2023,
    batteryKwh: 65,
    voltageArchitecture: 400,
    curve: [
      [0, 50],
      [10, 55],
      [20, 55],
      [30, 55],
      [40, 52],
      [50, 48],
      [55, 38],
      [60, 32],
      [70, 25],
      [80, 22],
      [90, 18],
      [100, 0],
    ],
    notes: "Notorious for slow charging. Below ~70% is tolerable, above is painful.",
  },
  {
    id: "nissan-leaf-60-2024",
    make: "Nissan",
    model: "Leaf Plus (CHAdeMO)",
    year: 2024,
    batteryKwh: 62,
    voltageArchitecture: 400,
    curve: [
      [0, 50],
      [10, 50],
      [20, 48],
      [30, 45],
      [40, 38],
      [50, 32],
      [60, 25],
      [70, 18],
      [80, 12],
      [90, 8],
      [100, 0],
    ],
    notes: "Passive cooling. Second session on the same day drops 30-40% vs first.",
  },
  {
    id: "lucid-air-pure-2024",
    make: "Lucid",
    model: "Air Pure",
    year: 2024,
    batteryKwh: 88,
    voltageArchitecture: 800,
    curve: [
      [0, 220],
      [5, 300],
      [10, 300],
      [20, 300],
      [30, 290],
      [40, 250],
      [50, 215],
      [60, 170],
      [70, 125],
      [80, 70],
      [90, 45],
      [100, 0],
    ],
  },
  {
    id: "porsche-taycan-2024",
    make: "Porsche",
    model: "Taycan (Performance Plus)",
    year: 2024,
    batteryKwh: 93,
    voltageArchitecture: 800,
    curve: [
      [0, 200],
      [5, 270],
      [10, 270],
      [20, 270],
      [30, 265],
      [40, 240],
      [50, 200],
      [60, 160],
      [70, 120],
      [80, 70],
      [90, 45],
      [100, 0],
    ],
  },
  {
    id: "vw-id4-pro-2024",
    make: "VW",
    model: "ID.4 Pro",
    year: 2024,
    batteryKwh: 82,
    voltageArchitecture: 400,
    curve: [
      [0, 120],
      [10, 170],
      [20, 170],
      [30, 155],
      [40, 125],
      [50, 100],
      [60, 80],
      [70, 60],
      [80, 45],
      [90, 30],
      [100, 0],
    ],
  },
  {
    id: "rivian-r1t-lg-2024",
    make: "Rivian",
    model: "R1T Large",
    year: 2024,
    batteryKwh: 135,
    voltageArchitecture: 400,
    curve: [
      [0, 180],
      [10, 220],
      [20, 220],
      [30, 200],
      [40, 170],
      [50, 140],
      [60, 110],
      [70, 85],
      [80, 55],
      [90, 35],
      [100, 0],
    ],
  },
  {
    id: "polestar-2-lr-2024",
    make: "Polestar",
    model: "Polestar 2 LR Single",
    year: 2024,
    batteryKwh: 82,
    voltageArchitecture: 400,
    curve: [
      [0, 120],
      [10, 155],
      [20, 155],
      [30, 145],
      [40, 115],
      [50, 95],
      [60, 75],
      [70, 55],
      [80, 40],
      [90, 28],
      [100, 0],
    ],
  },
  {
    id: "bmw-i4-m50-2024",
    make: "BMW",
    model: "i4 M50",
    year: 2024,
    batteryKwh: 84,
    voltageArchitecture: 400,
    curve: [
      [0, 180],
      [10, 205],
      [20, 200],
      [30, 185],
      [40, 160],
      [50, 130],
      [60, 100],
      [70, 75],
      [80, 55],
      [90, 35],
      [100, 0],
    ],
  },
  {
    id: "cadillac-lyriq-2024",
    make: "Cadillac",
    model: "Lyriq (Ultium)",
    year: 2024,
    batteryKwh: 102,
    voltageArchitecture: 400,
    curve: [
      [0, 140],
      [10, 190],
      [20, 190],
      [30, 175],
      [40, 145],
      [50, 115],
      [60, 90],
      [70, 68],
      [80, 48],
      [90, 32],
      [100, 0],
    ],
  },
  {
    id: "equinox-ev-lt-2024",
    make: "Chevy",
    model: "Equinox EV LT",
    year: 2024,
    batteryKwh: 85,
    voltageArchitecture: 400,
    curve: [
      [0, 100],
      [10, 155],
      [20, 155],
      [30, 145],
      [40, 120],
      [50, 95],
      [60, 75],
      [70, 58],
      [80, 42],
      [90, 28],
      [100, 0],
    ],
  },
  {
    id: "honda-prologue-2024",
    make: "Honda",
    model: "Prologue (Ultium)",
    year: 2024,
    batteryKwh: 85,
    voltageArchitecture: 400,
    curve: [
      [0, 100],
      [10, 150],
      [20, 150],
      [30, 140],
      [40, 115],
      [50, 92],
      [60, 72],
      [70, 55],
      [80, 40],
      [90, 26],
      [100, 0],
    ],
  },
];

/**
 * Piecewise-linear interpolation of a curve at a given SOC.
 */
export function interpolateKw(curve: ChargeCurve["curve"], socPct: number): number {
  if (socPct <= curve[0][0]) return curve[0][1];
  if (socPct >= curve[curve.length - 1][0]) return curve[curve.length - 1][1];
  for (let i = 0; i < curve.length - 1; i++) {
    const [s0, k0] = curve[i];
    const [s1, k1] = curve[i + 1];
    if (socPct >= s0 && socPct <= s1) {
      const frac = (socPct - s0) / (s1 - s0);
      return k0 + frac * (k1 - k0);
    }
  }
  return 0;
}

/**
 * Simulate a charging session from startSoc to endSoc, capped by a charger max power.
 * Returns time in minutes, energy added kWh, and minute-by-minute telemetry.
 */
export function simulateChargeSession(
  car: ChargeCurve,
  startSoc: number,
  endSoc: number,
  chargerMaxKw: number
): {
  totalMinutes: number;
  kwhAdded: number;
  telemetry: Array<{ minute: number; soc: number; kw: number; kwhCum: number }>;
} {
  if (endSoc <= startSoc) {
    return { totalMinutes: 0, kwhAdded: 0, telemetry: [] };
  }
  const stepSec = 10; // 10-second integration steps
  let currentSoc = startSoc;
  let totalSec = 0;
  let kwhAdded = 0;
  const telemetry: Array<{
    minute: number;
    soc: number;
    kw: number;
    kwhCum: number;
  }> = [];
  const maxIter = 36000; // 100 minutes cap
  let lastMinuteLogged = -1;
  for (let i = 0; i < maxIter; i++) {
    const curveKw = interpolateKw(car.curve, currentSoc);
    const deliveredKw = Math.min(curveKw, chargerMaxKw);
    if (deliveredKw <= 0) break;
    const deltaKwh = (deliveredKw * stepSec) / 3600;
    kwhAdded += deltaKwh;
    currentSoc += (deltaKwh / car.batteryKwh) * 100;
    totalSec += stepSec;
    const minute = Math.floor(totalSec / 60);
    if (minute !== lastMinuteLogged) {
      telemetry.push({
        minute,
        soc: Math.min(100, currentSoc),
        kw: deliveredKw,
        kwhCum: kwhAdded,
      });
      lastMinuteLogged = minute;
    }
    if (currentSoc >= endSoc) break;
  }
  return {
    totalMinutes: totalSec / 60,
    kwhAdded,
    telemetry,
  };
}
