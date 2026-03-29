"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import ResultCard from "@/components/ResultCard";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import EducationalContent from "@/components/EducationalContent";
import EmailCapture from "@/components/EmailCapture";
import { getDefaultStateCode } from "@/lib/useDefaultState";
import { useUrlSync } from "@/lib/useUrlState";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtShort = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface NetworkInfo {
  name: string;
  avgRate: number;
  note: string;
}

const CHARGING_NETWORKS: NetworkInfo[] = [
  { name: "Tesla Supercharger", avgRate: 0.35, note: "Tesla owners only; some sites open to other EVs via adapter" },
  { name: "Electrify America", avgRate: 0.43, note: "Nationwide DC fast charging; membership drops rate to ~$0.31/kWh" },
  { name: "ChargePoint", avgRate: 0.30, note: "Pricing varies by station owner; ranges from $0.20-$0.60/kWh" },
  { name: "EVgo", avgRate: 0.35, note: "Pay-as-you-go or membership plans; widespread in metro areas" },
];

const publicChargingFAQ = [
  {
    question: "How much does it cost to charge an EV at a public station?",
    answer:
      "Public charging costs vary widely by network and charging speed. Level 2 public chargers typically cost $0.20-$0.35 per kWh, while DC fast chargers range from $0.30-$0.60 per kWh. Many stations also charge a per-session fee of $1-$2. On average, a full DC fast charge costs 2-3x more than charging the same amount at home.",
  },
  {
    question: "Is it cheaper to charge at home or at a public station?",
    answer:
      "Home charging is almost always cheaper. The national average residential electricity rate is about 16 cents per kWh, while public Level 2 chargers average 25 cents per kWh and DC fast chargers average 35-45 cents per kWh. Home charging can save you 40-70% compared to public charging, which is why most EV owners do the majority of their charging at home.",
  },
  {
    question: "Why do DC fast chargers cost more than Level 2?",
    answer:
      "DC fast chargers require expensive equipment (often $100,000+ per unit), high-capacity electrical connections, and demand charges from utilities. These infrastructure costs get passed on to consumers. The convenience of charging in 20-40 minutes instead of several hours also commands a premium price.",
  },
  {
    question: "Do public charging session fees add up significantly?",
    answer:
      "Yes, session fees can meaningfully increase your cost. A $1.00 fee on 8 sessions per month adds $96 per year. For drivers who only top up small amounts at public chargers, the per-session fee can effectively double the per-kWh cost. Look for networks that waive session fees with a membership plan.",
  },
  {
    question: "How can I reduce my public charging costs?",
    answer:
      "Sign up for network memberships (Electrify America Plus, EVgo Plus) to get lower per-kWh rates. Use apps like PlugShare to find the cheapest nearby stations. Charge during off-peak hours when some stations offer discounts. If your workplace offers Level 2 charging, that is often free or low-cost. Finally, maximize home charging to reduce how often you need public stations.",
  },
];

export default function PublicChargingCostPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [publicPercent, setPublicPercent] = useState(30);
  const [level2Rate, setLevel2Rate] = useState(25);
  const [dcFastRate, setDcFastRate] = useState(40);
  const [sessionFee, setSessionFee] = useState(1.0);
  const [sessionsPerMonth, setSessionsPerMonth] = useState(8);
  const [dailyMiles, setDailyMiles] = useState(35);

  // Auto-detect state from timezone on first visit
  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  // Sync state to/from URL for shareable links
  useUrlSync(
    {
      vehicle: vehicleId,
      state: stateCode,
      pub: String(publicPercent),
      l2: String(level2Rate),
      dc: String(dcFastRate),
      fee: String(sessionFee),
      sess: String(sessionsPerMonth),
      miles: dailyMiles,
    },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
      if (p.pub) setPublicPercent(Number(p.pub));
      if (p.l2) setLevel2Rate(Number(p.l2));
      if (p.dc) setDcFastRate(Number(p.dc));
      if (p.fee) setSessionFee(Number(p.fee));
      if (p.sess) setSessionsPerMonth(Number(p.sess));
      if (p.miles) setDailyMiles(Number(p.miles));
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const homeRate = useMemo(() => {
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  }, [stateCode]);

  // Blended public rate: assume 40% Level 2, 60% DC fast for public sessions
  const blendedPublicRate = useMemo(() => {
    return (level2Rate * 0.4 + dcFastRate * 0.6) / 100;
  }, [level2Rate, dcFastRate]);

  const results = useMemo(() => {
    const dailyKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles;
    const monthlyKwh = dailyKwh * 30;

    const publicFraction = publicPercent / 100;
    const homeFraction = 1 - publicFraction;

    const monthlySessionFees = sessionFee * sessionsPerMonth;

    // Scenario 1: 100% home charging
    const homeOnlyMonthly = monthlyKwh * homeRate;
    const homeOnlyAnnual = homeOnlyMonthly * 12;
    const homeOnlyCostPerMile = homeRate * (vehicle.kwhPer100Miles / 100);

    // Scenario 2: Current mix
    const mixHomeKwh = monthlyKwh * homeFraction;
    const mixPublicKwh = monthlyKwh * publicFraction;
    const mixMonthly = mixHomeKwh * homeRate + mixPublicKwh * blendedPublicRate + monthlySessionFees;
    const mixAnnual = mixMonthly * 12;
    const mixCostPerMile = mixMonthly / (dailyMiles * 30);

    // Scenario 3: 100% public charging
    const publicOnlyMonthly = monthlyKwh * blendedPublicRate + monthlySessionFees;
    const publicOnlyAnnual = publicOnlyMonthly * 12;
    const publicOnlyCostPerMile = publicOnlyMonthly / (dailyMiles * 30);

    // Extra cost of public vs home
    const extraMonthlyCost = mixMonthly - homeOnlyMonthly;
    const extraAnnualCost = extraMonthlyCost * 12;

    return {
      homeOnlyMonthly,
      homeOnlyAnnual,
      homeOnlyCostPerMile,
      mixMonthly,
      mixAnnual,
      mixCostPerMile,
      publicOnlyMonthly,
      publicOnlyAnnual,
      publicOnlyCostPerMile,
      extraMonthlyCost,
      extraAnnualCost,
      monthlyKwh,
    };
  }, [dailyMiles, vehicle, homeRate, blendedPublicRate, publicPercent, sessionFee, sessionsPerMonth]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const stateOptions = Object.entries(ELECTRICITY_RATES)
    .sort((a, b) => a[1].state.localeCompare(b[1].state))
    .map(([code, data]) => ({
      value: code,
      label: `${data.state} (${data.residential}\u00A2/kWh)`,
    }));

  // Bar widths for comparison chart
  const maxMonthly = Math.max(results.homeOnlyMonthly, results.mixMonthly, results.publicOnlyMonthly);
  const homeBarWidth = (results.homeOnlyMonthly / maxMonthly) * 100;
  const mixBarWidth = (results.mixMonthly / maxMonthly) * 100;
  const publicBarWidth = (results.publicOnlyMonthly / maxMonthly) * 100;

  return (
    <CalculatorLayout
      title="Public Charging Cost Calculator"
      description="Compare the cost of public EV charging vs home charging. See how your mix of home and public charging affects your monthly and annual costs."
      lastUpdated="March 2026"
      intro="Public EV charging typically costs 2-3x more than home charging. The national average home rate is about 16 cents/kWh, while public Level 2 averages 25 cents/kWh and DC fast charging averages 35-45 cents/kWh. This calculator helps you estimate how much your public charging habit really costs and find the right balance."
    >
      <CalculatorSchema name="Public Charging Cost Calculator" description="Compare public EV charging costs vs home charging. Estimate monthly costs for different mixes of home, Level 2, and DC fast charging." url="https://chargemath.com/public-charging" />
      <BreadcrumbSchema items={[{ name: "Home", url: "https://chargemath.com" }, { name: "Public Charging Cost Calculator", url: "https://chargemath.com/public-charging" }]} />

      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.batteryCapacityKwh} kWh battery \u2022 ${vehicle.epaRangeMiles} mi EPA range \u2022 ${vehicle.kwhPer100Miles} kWh/100mi`}
        />

        <SelectInput
          label="Your State (Home Rate)"
          value={stateCode}
          onChange={setStateCode}
          options={stateOptions}
          helpText={`Home rate: ${(homeRate * 100).toFixed(1)}\u00A2/kWh from EIA data`}
        />

        <div className="sm:col-span-2">
          <SliderInput
            label="% of Charging at Public Stations"
            value={publicPercent}
            onChange={setPublicPercent}
            min={0}
            max={100}
            step={5}
            unit="%"
            showValue
          />
        </div>

        <NumberInput
          label="Level 2 Public Rate"
          value={level2Rate}
          onChange={setLevel2Rate}
          min={5}
          max={80}
          step={1}
          unit={"¢/kWh"}
          helpText="Typical range: 20-35¢/kWh"
        />

        <NumberInput
          label="DC Fast Charging Rate"
          value={dcFastRate}
          onChange={setDcFastRate}
          min={10}
          max={100}
          step={1}
          unit={"¢/kWh"}
          helpText="Typical range: 30-60¢/kWh"
        />

        <NumberInput
          label="Session Fee"
          value={sessionFee}
          onChange={setSessionFee}
          min={0}
          max={5}
          step={0.25}
          unit={"$/session"}
          helpText="Per-session connection fee (some networks charge $0-$2)"
        />

        <NumberInput
          label="Public Sessions per Month"
          value={sessionsPerMonth}
          onChange={setSessionsPerMonth}
          min={0}
          max={30}
          step={1}
          unit={"sessions"}
          helpText="How often you charge at public stations"
        />

        <div className="sm:col-span-2">
          <SliderInput
            label="Daily Miles Driven"
            value={dailyMiles}
            onChange={setDailyMiles}
            min={10}
            max={150}
            step={5}
            unit="miles"
            showValue
          />
        </div>
      </div>

      {/* Results: Three Scenarios */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Cost Comparison: Home vs Public Charging
        </h2>

        {/* Scenario: 100% Home */}
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-ev-green)]">
          Scenario 1: 100% Home Charging
        </h3>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <ResultCard
            label="Monthly Cost"
            value={fmt.format(results.homeOnlyMonthly)}
            unit="/month"
            highlight
            icon="🏠"
          />
          <ResultCard
            label="Annual Cost"
            value={fmt.format(results.homeOnlyAnnual)}
            unit="/year"
            icon="📅"
          />
          <ResultCard
            label="Cost Per Mile"
            value={`$${results.homeOnlyCostPerMile.toFixed(3)}`}
            unit="/mile"
            icon="⚡"
          />
        </div>

        {/* Scenario: Current Mix */}
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-primary)]">
          Scenario 2: Your Mix ({publicPercent}% Public / {100 - publicPercent}% Home)
        </h3>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <ResultCard
            label="Monthly Cost"
            value={fmt.format(results.mixMonthly)}
            unit="/month"
            highlight
            icon="🔌"
          />
          <ResultCard
            label="Annual Cost"
            value={fmt.format(results.mixAnnual)}
            unit="/year"
            icon="📅"
          />
          <ResultCard
            label="Cost Per Mile"
            value={`$${results.mixCostPerMile.toFixed(3)}`}
            unit="/mile"
            icon="🔋"
          />
        </div>

        {/* Scenario: 100% Public */}
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-gas-red)]">
          Scenario 3: 100% Public Charging
        </h3>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <ResultCard
            label="Monthly Cost"
            value={fmt.format(results.publicOnlyMonthly)}
            unit="/month"
            highlight
            icon="🏪"
          />
          <ResultCard
            label="Annual Cost"
            value={fmt.format(results.publicOnlyAnnual)}
            unit="/year"
            icon="📅"
          />
          <ResultCard
            label="Cost Per Mile"
            value={`$${results.publicOnlyCostPerMile.toFixed(3)}`}
            unit="/mile"
            icon="💳"
          />
        </div>

        {/* Extra Cost Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="Extra Monthly Cost vs Home Only"
            value={fmt.format(results.extraMonthlyCost)}
            unit="/month"
            icon="📊"
          />
          <ResultCard
            label="Extra Annual Cost vs Home Only"
            value={fmt.format(results.extraAnnualCost)}
            unit="/year"
            highlight
            icon="💰"
          />
        </div>

        {/* Comparison Bar Chart */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Monthly Cost Comparison
          </h3>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-ev-green)]">
                  100% Home
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {fmt.format(results.homeOnlyMonthly)}
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-ev-green)] transition-all duration-500"
                  style={{ width: `${homeBarWidth}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-primary)]">
                  Your Mix ({publicPercent}% Public)
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {fmt.format(results.mixMonthly)}
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                  style={{ width: `${mixBarWidth}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-gas-red)]">
                  100% Public
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {fmt.format(results.publicOnlyMonthly)}
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-gas-red)] transition-all duration-500"
                  style={{ width: `${publicBarWidth}%` }}
                />
              </div>
            </div>
          </div>
          {results.extraMonthlyCost > 0 ? (
            <p className="mt-4 text-center text-sm font-semibold text-[var(--color-ev-green)]">
              Your public charging mix costs you an extra {fmt.format(results.extraMonthlyCost)}/month vs charging at home
            </p>
          ) : (
            <p className="mt-4 text-center text-sm font-semibold text-[var(--color-ev-green)]">
              You&apos;re charging 100% at home. Nice savings!
            </p>
          )}
        </div>

        {/* Contextual Cross-Links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/ev-charging-cost" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5">
            Calculate home charging costs →
          </Link>
          <Link href="/charging-time" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5">
            How long does charging take? →
          </Link>
          <Link href="/gas-vs-electric" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5">
            Compare gas vs electric costs →
          </Link>
        </div>

        <ShareResults
          title={`Public Charging Cost: ${fmt.format(results.mixMonthly)}/month`}
          text={`My ${vehicle.year} ${vehicle.make} ${vehicle.model} costs ${fmt.format(results.mixMonthly)}/month with ${publicPercent}% public charging. That's ${fmt.format(results.extraAnnualCost)}/year more than charging 100% at home.`}
        />
      </div>

      {/* Charging Network Comparison */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Major Charging Network Pricing
        </h2>
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">
          Rates shown are approximate national averages for DC fast charging as of early 2026. Actual prices vary by location, membership status, and time of day.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {CHARGING_NETWORKS.map((network) => {
            const fullChargeCost = vehicle.batteryCapacityKwh * network.avgRate;
            const costPer100Miles = (vehicle.kwhPer100Miles * network.avgRate);
            return (
              <div
                key={network.name}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">
                    {network.name}
                  </h3>
                  <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
                    ~${network.avgRate.toFixed(2)}/kWh
                  </span>
                </div>
                <div className="mb-2 grid grid-cols-2 gap-2 text-xs text-[var(--color-text-muted)]">
                  <div>
                    <span className="block text-[var(--color-text)] font-medium">{fmt.format(fullChargeCost)}</span>
                    Full charge ({vehicle.batteryCapacityKwh} kWh)
                  </div>
                  <div>
                    <span className="block text-[var(--color-text)] font-medium">{fmt.format(costPer100Miles)}</span>
                    Per 100 miles
                  </div>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {network.note}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Network costs shown for your {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.kwhPer100Miles} kWh/100mi). Membership plans can reduce per-kWh rates by 15-25%.
        </p>
      </div>

      <EducationalContent>
        <h2>Understanding Public Charging Costs</h2>
        <p>
          Public EV charging costs more than home charging for several reasons: station operators must recoup their investment in equipment ($50,000-$150,000 per DC fast charger), pay commercial electricity rates and demand charges, maintain the hardware, and earn a profit. These costs add up, making public charging roughly 2-3x more expensive per kWh than plugging in at home.
        </p>
        <h3>How This Calculator Works</h3>
        <p>
          We calculate your monthly energy consumption based on your vehicle&apos;s EPA efficiency rating and daily mileage. Then we split that energy between home and public charging based on your selected percentage. For public charging, we use a blended rate of 40% Level 2 and 60% DC fast charging, plus per-session fees. This gives you three clear scenarios to compare: all home, your current mix, and all public.
        </p>
        <h3>Tips to Save on Public Charging</h3>
        <ul>
          <li>Join network membership programs. Electrify America&apos;s Pass+ membership ($4/month) drops DC fast rates from ~$0.43 to ~$0.31/kWh, paying for itself after about 3-4 sessions.</li>
          <li>Use Level 2 public chargers when you have time. They cost 30-50% less than DC fast chargers and are gentler on your battery.</li>
          <li>Check for free workplace charging. Many employers offer Level 2 chargers as a perk, which can eliminate your public charging costs entirely on work days.</li>
          <li>Charge at home overnight whenever possible. Even shifting 10% of your charging from public to home saves $100-$200 per year for the average driver.</li>
          <li>Use apps like PlugShare or ABRP to compare prices at nearby stations before you charge. Prices can vary by $0.10-$0.20/kWh between stations just a few miles apart.</li>
        </ul>
        <h3>When Public Charging Makes Sense</h3>
        <p>
          Not everyone can charge at home. Apartment dwellers, renters, and people without a garage often rely on public charging for most or all of their needs. If that describes you, focus on finding the most affordable network in your area and consider a membership plan. Some cities also offer subsidized public charging rates for residents who lack home charging access.
        </p>
      </EducationalContent>

      <FAQSection questions={publicChargingFAQ} />
      <EmailCapture source="public-charging" />
      <RelatedCalculators currentPath="/public-charging" />
    </CalculatorLayout>
  );
}
