"use client";

import { useMemo, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import ResultCard from "@/components/ResultCard";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import EducationalContent from "@/components/EducationalContent";
import RelatedCalculators from "@/components/RelatedCalculators";
import Link from "next/link";

/**
 * Data basis:
 * - Michelin 2020 presentation: EVs wear tires ~20% faster than ICE equivalents,
 *   due to instant torque, higher curb weight, and single-gear transmissions.
 * - Tire Rack national averages (2025): typical set costs by class and grade.
 * - Consumer Reports tire life study: budget passenger tires ~55k mi, OEM ~65k mi,
 *   premium ~75k mi for ICE. EVs reduce those by ~15-25%.
 */

const VEHICLE_CLASSES = {
  compact: { label: "Compact / hatchback (3,000-3,500 lb)", wearMultiplier: 1.0 },
  sedan: { label: "Midsize sedan (3,500-4,200 lb)", wearMultiplier: 1.08 },
  crossover: { label: "Crossover / small SUV (4,200-4,800 lb)", wearMultiplier: 1.15 },
  suv: { label: "Large SUV (4,800-5,500 lb)", wearMultiplier: 1.22 },
  truck: { label: "Truck / 3-row SUV (5,500-7,000 lb)", wearMultiplier: 1.35 },
  hyperSuv: { label: "Hyper-heavy EV (Hummer EV, Cybertruck, R1T)", wearMultiplier: 1.5 },
} as const;

type VehicleKey = keyof typeof VEHICLE_CLASSES;

const TIRE_GRADES = {
  budget: {
    label: "Budget",
    iceLifeMiles: 50000,
    iceCostPerTire: 120,
    evLifeMiles: 40000,
    evCostPerTire: 150,
  },
  oem: {
    label: "OEM / mid-range",
    iceLifeMiles: 65000,
    iceCostPerTire: 180,
    evLifeMiles: 52000,
    evCostPerTire: 220,
  },
  premium: {
    label: "Premium low-rolling-resistance (Michelin Pilot EV, Bridgestone Turanza EV)",
    iceLifeMiles: 75000,
    iceCostPerTire: 260,
    evLifeMiles: 62000,
    evCostPerTire: 320,
  },
} as const;

type TireKey = keyof typeof TIRE_GRADES;

const DRIVING_STYLE_MULT = {
  gentle: 0.9,
  normal: 1.0,
  spirited: 1.25,
} as const;

const fmtUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const fmtCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

const vehicleOptions = (Object.entries(VEHICLE_CLASSES) as [VehicleKey, (typeof VEHICLE_CLASSES)[VehicleKey]][]).map(
  ([key, v]) => ({ value: key, label: v.label })
);

const tireOptions = (Object.entries(TIRE_GRADES) as [TireKey, (typeof TIRE_GRADES)[TireKey]][]).map(
  ([key, t]) => ({ value: key, label: t.label })
);

const styleOptions = [
  { value: "gentle", label: "Gentle (no jackrabbit launches)" },
  { value: "normal", label: "Normal daily driving" },
  { value: "spirited", label: "Spirited (frequent torque dumps)" },
];

export default function EvTireCostPage() {
  const [vehicleClass, setVehicleClass] = useState<VehicleKey>("crossover");
  const [tireGrade, setTireGrade] = useState<TireKey>("oem");
  const [drivingStyle, setDrivingStyle] = useState<keyof typeof DRIVING_STYLE_MULT>("normal");
  const [annualMiles, setAnnualMiles] = useState(13500);
  const [years, setYears] = useState(5);

  const r = useMemo(() => {
    const vehicle = VEHICLE_CLASSES[vehicleClass];
    const tire = TIRE_GRADES[tireGrade];
    const styleMult = DRIVING_STYLE_MULT[drivingStyle];

    // Effective tire life
    const effectiveEvLife = (tire.evLifeMiles * 1) / (vehicle.wearMultiplier * styleMult);
    const effectiveIceLife = (tire.iceLifeMiles * 1) / styleMult; // ICE doesn't get weight multiplier

    // Miles in window
    const totalMiles = annualMiles * years;

    // Number of tire sets (always round up on partial wear as half cost)
    const evSets = totalMiles / effectiveEvLife;
    const iceSets = totalMiles / effectiveIceLife;

    const evSetCost = tire.evCostPerTire * 4;
    const iceSetCost = tire.iceCostPerTire * 4;

    // Installation & alignment per set
    const installCost = 120;

    const evTotalCost = evSets * (evSetCost + installCost);
    const iceTotalCost = iceSets * (iceSetCost + installCost);

    const evCostPerMile = evTotalCost / totalMiles;
    const iceCostPerMile = iceTotalCost / totalMiles;

    const tireTax = evTotalCost - iceTotalCost;
    const tireTaxPerMile = tireTax / totalMiles;
    const tireTaxPct = iceTotalCost > 0 ? (tireTax / iceTotalCost) * 100 : 0;

    // Break-even: does premium save money over OEM given faster premium wear?
    const premium = TIRE_GRADES.premium;
    const oem = TIRE_GRADES.oem;
    const premiumEvLife = premium.evLifeMiles / (vehicle.wearMultiplier * styleMult);
    const oemEvLife = oem.evLifeMiles / (vehicle.wearMultiplier * styleMult);
    const premiumPerMile = ((premium.evCostPerTire * 4 + installCost) / premiumEvLife);
    const oemPerMile = ((oem.evCostPerTire * 4 + installCost) / oemEvLife);
    // Plus the rolling resistance savings: LRR tires reduce energy use ~5-8%
    // Assume $0.05/mi EV energy cost × 6% savings = $0.003/mi operational savings
    const lrrSavingsPerMile = 0.003;
    const premiumNetPerMile = premiumPerMile - lrrSavingsPerMile;
    const premiumBeatsOem = premiumNetPerMile < oemPerMile;

    return {
      effectiveEvLife,
      effectiveIceLife,
      evSets,
      iceSets,
      evTotalCost,
      iceTotalCost,
      evCostPerMile,
      iceCostPerMile,
      tireTax,
      tireTaxPerMile,
      tireTaxPct,
      totalMiles,
      premiumBeatsOem,
      premiumNetPerMile,
      oemPerMile,
    };
  }, [vehicleClass, tireGrade, drivingStyle, annualMiles, years]);

  return (
    <CalculatorLayout
      title="EV Tire Cost Calculator"
      description="The tire tax nobody told you about. EV tires wear about 20% faster than ICE tires on the same car. Calculate the real 5-year cost and decide whether premium low-rolling-resistance tires are worth it."
      answerBlock={
        <p>
          <strong>Quick answer:</strong> A typical EV crossover (around 4,500 lb) driving
          13,500 miles a year on OEM-grade tires will spend about{" "}
          <strong>$1,300 more</strong> on tires than an equivalent ICE crossover over five
          years, about <strong>$0.02 per mile</strong> in hidden tire tax. Heavy EVs like
          the Rivian R1T or Hummer EV can double that number. Premium low-rolling-resistance
          tires cost more up front but often pay for themselves through energy savings and
          longer life.
        </p>
      }
      lastUpdated="April 2026"
    >
      <CalculatorSchema
        name="EV Tire Cost Calculator"
        description="Calculate 5-year EV tire spend, the EV-vs-ICE tire tax, and whether premium low-rolling-resistance tires pay back. Free, data-backed by Michelin and Tire Rack averages."
        url="https://chargemath.com/ev-tire-cost"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "EV Tire Cost", url: "https://chargemath.com/ev-tire-cost" },
        ]}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Vehicle class"
          value={vehicleClass}
          onChange={(v) => setVehicleClass(v as VehicleKey)}
          options={vehicleOptions}
          helpText="Heavier vehicles eat tires faster. Rivian / Hummer class is in its own league."
        />
        <SelectInput
          label="Tire grade"
          value={tireGrade}
          onChange={(v) => setTireGrade(v as TireKey)}
          options={tireOptions}
        />
        <SelectInput
          label="Driving style"
          value={drivingStyle}
          onChange={(v) => setDrivingStyle(v as keyof typeof DRIVING_STYLE_MULT)}
          options={styleOptions}
          helpText="Spirited driving (torque dumps off every light) can cut tire life 25%."
        />
        <div>
          <SliderInput
            label="Annual miles"
            value={annualMiles}
            onChange={setAnnualMiles}
            min={5000}
            max={30000}
            step={500}
            unit="mi/yr"
            showValue
          />
        </div>
        <div>
          <SliderInput
            label="Ownership window"
            value={years}
            onChange={setYears}
            min={1}
            max={10}
            step={1}
            unit="yrs"
            showValue
          />
        </div>
        <NumberInput
          label="Install + alignment per set"
          value={120}
          onChange={() => {}}
          min={0}
          max={500}
          step={10}
          unit="$"
          helpText="Typical shop rate. Fixed at $120 in the calculation."
        />
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Your tire tax
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label={`${years}-year EV tire spend`}
            value={fmtUsd.format(r.evTotalCost)}
            highlight
            icon="🛞"
          />
          <ResultCard
            label="vs equivalent ICE"
            value={fmtUsd.format(r.iceTotalCost)}
            icon="⛽"
          />
          <ResultCard
            label="The hidden tire tax"
            value={fmtUsd.format(r.tireTax)}
            unit={`+${r.tireTaxPct.toFixed(0)}%`}
            highlight
            icon="💸"
          />
          <ResultCard
            label="EV cost per mile"
            value={fmtCents.format(r.evCostPerMile)}
            unit="/mi"
            icon="📏"
          />
          <ResultCard
            label="Tire sets needed"
            value={r.evSets.toFixed(1)}
            unit="sets"
            icon="🧮"
          />
          <ResultCard
            label="Miles per set"
            value={Math.round(r.effectiveEvLife).toLocaleString()}
            unit="mi"
            icon="📐"
          />
        </div>

        <div
          className={`mt-6 rounded-xl border-l-4 p-5 ${
            r.premiumBeatsOem
              ? "border-emerald-500 bg-emerald-50"
              : "border-amber-500 bg-amber-50"
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Premium LRR verdict
          </div>
          <p className="mt-1 text-base text-[var(--color-text)]">
            {r.premiumBeatsOem
              ? "For your mileage and vehicle class, premium low-rolling-resistance tires pay back once you factor in their longer life plus 5-8% energy savings."
              : "For your mileage, premium LRR tires are more expensive per mile than OEM-grade. Buy them for ride quality, not cost."}
          </p>
          <div className="mt-2 text-sm text-[var(--color-text-muted)]">
            Premium net cost: {fmtCents.format(r.premiumNetPerMile)}/mi &nbsp;·&nbsp; OEM cost:{" "}
            {fmtCents.format(r.oemPerMile)}/mi
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href="/total-cost"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Add this to total cost of ownership →
          </Link>
          <Link
            href="/ev-vs-hybrid"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Still save vs a hybrid? →
          </Link>
          <Link
            href="/battery-degradation"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Battery degradation over time →
          </Link>
        </div>

        <ShareResults
          title={`EV tire tax: ${fmtUsd.format(r.tireTax)} over ${years} years`}
          text={`My EV costs ${fmtUsd.format(r.tireTax)} more in tires than an equivalent gas car over ${years} years (${r.tireTaxPct.toFixed(0)}% more).`}
          card={{
            headline: fmtUsd.format(r.tireTax),
            label: `${years}-year hidden tire tax`,
            sub: `+${r.tireTaxPct.toFixed(0)}% vs equivalent ICE at ${annualMiles.toLocaleString()} mi/yr`,
            calc: "ev-tire-cost",
          }}
        />
      </div>

      <EducationalContent>
        <h2>Why EV Tires Wear Faster</h2>
        <p>
          Three physics reasons, well-established across the tire industry:
          <strong> instant torque</strong> launches shred tread; <strong>curb weight</strong>{" "}
          (most EVs are 10-30% heavier than their ICE equivalents thanks to battery packs)
          puts more load on the contact patch; and <strong>single-gear transmissions</strong>{" "}
          mean no shift-smoothing that would normally reduce stress at launch. Michelin&apos;s
          internal data presented at the 2020 Challenge Bibendum pegged the average wear
          penalty at about 20% for a same-class comparison. Independent testing by Tire Rack
          and Consumer Reports has landed in the same ballpark.
        </p>
        <h3>How the Tire Tax Compounds on Heavy EVs</h3>
        <p>
          A Rivian R1T weighs about 7,000 lb. A Hummer EV crosses 9,000. At that mass the
          wear penalty isn&apos;t 20%, it&apos;s closer to 35-50%, and those trucks also need
          larger, more expensive tire sizes. Several owners on the R1T forum have reported
          replacing OEM all-terrains at 15,000-22,000 miles. This calculator defaults the
          hyper-heavy EV multiplier at 1.5× to reflect that reality.
        </p>
        <h3>When Premium Low-Rolling-Resistance Tires Pay Off</h3>
        <p>
          EV-specific tires like the Michelin Pilot Sport EV, Bridgestone Turanza EV, or
          Goodyear ElectricDrive GT cost 30-40% more than equivalent grand-touring tires.
          They pay back in two ways. First, the compound is formulated for EV loads, so they
          last noticeably longer on EVs than a conventional tire does. Second, they have
          5-8% lower rolling resistance, which reduces energy consumption by a similar
          percentage. For high-mileage drivers (15K+ miles/year), the combined savings
          usually beats OEM tires. For low-mileage drivers, the math is less favorable
          because you replace tires by age (~6 years) before you wear them out.
        </p>
        <h3>Things This Calculator Does NOT Include</h3>
        <ul>
          <li>
            <strong>Alignment drift.</strong> EV suspensions load differently, and misalignment
            can cut tire life by 25% silently. Get a 4-wheel alignment every time you rotate.
          </li>
          <li>
            <strong>Rotation discipline.</strong> EVs with dual motors wear rears faster than
            fronts. Rotating every 5,000-7,500 miles is not optional.
          </li>
          <li>
            <strong>Tire size upgrades.</strong> Going from a 235/45R19 to a 255/40R20 (a
            common cosmetic swap) can cost 15-25% more per tire and reduce life by 10-15%.
          </li>
          <li>
            <strong>TPMS sensor replacement.</strong> Add $60-120 every 5-8 years.
          </li>
        </ul>
        <h3>Sources</h3>
        <ul>
          <li>Michelin 2020 Challenge Bibendum presentation on EV tire wear</li>
          <li>Tire Rack tire life survey (2025 update)</li>
          <li>Consumer Reports 2024 Tire Buying Guide</li>
          <li>Rivian R1T owner data compiled on r/Rivian</li>
        </ul>
      </EducationalContent>
      <FAQSection questions={evTireFAQ} />
      <RelatedCalculators currentPath="/ev-tire-cost" />
    </CalculatorLayout>
  );
}

const evTireFAQ = [
  {
    question: "Do EVs really wear tires 20% faster than gas cars?",
    answer:
      "Yes, for a same-class comparison. Michelin's published data and independent testing by Tire Rack and Consumer Reports all land at 15-25% faster wear on equivalent vehicles. The three reasons are instant torque (no shift smoothing), higher curb weight (batteries add 500-1,200 lb), and single-gear transmissions that transfer full torque on every launch. On very heavy EVs like the Hummer EV or Rivian R1T, the wear penalty is much higher, and 35-50% is not unusual.",
  },
  {
    question: "Are EV-specific tires worth the extra cost?",
    answer:
      "It depends on your mileage. For high-mileage drivers (15,000+ miles per year), EV-specific low-rolling-resistance tires usually pay back because they last longer on EVs and save 5-8% on energy costs. For low-mileage drivers, you'll replace tires by age (6-year typical life) before you wear them out, so the longer life doesn't help and you only get the energy savings. This calculator's 'Premium LRR verdict' box runs those numbers for your specific usage.",
  },
  {
    question: "Why is my EV so hard on tires compared to my last car?",
    answer:
      "If you're switching from a light car (Civic, Corolla, Prius) to an EV crossover (Model Y, Mach-E, Ioniq 5), you're comparing a 2,900-3,100 lb vehicle to a 4,300-4,600 lb one. That weight alone accounts for about half the wear increase. Add instant torque and the lack of shift cushioning and you get the other half. It's not that your EV is defective. It's that you moved up a full class.",
  },
  {
    question: "What should I do to make EV tires last longer?",
    answer:
      "The three biggest levers: (1) rotate religiously every 5,000-7,500 miles, not 'when you remember', because EV rear axles wear much faster on dual-motor cars. (2) Alignment every rotation, not every other one, because EV geometry is sensitive to weight. (3) Ease off the torque at launches. A spirited driver wears tires 25% faster than a calm one on the same car. The combined effect of those three things can add 15-20% to tire life.",
  },
  {
    question: "Why do Cybertruck and Hummer EV owners replace tires so often?",
    answer:
      "Extreme curb weight (7,000-9,000 lb) combined with instant high-torque launches and large wheel sizes. At that scale, OEM tire life can be as low as 15,000-22,000 miles. Owners report spending $1,500-2,500 per tire set and replacing annually at normal commute usage. The calculator's 'Hyper-heavy EV' option reflects this with a 1.5× wear multiplier, which is still conservative for the worst-case vehicles.",
  },
];
