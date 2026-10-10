"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import CalculatorShell from "@/components/CalculatorShell";
import SavingsVerdict from "@/components/SavingsVerdict";
import SavingsTile from "@/components/SavingsTile";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import EducationalContent from "@/components/EducationalContent";
import EmailCapture from "@/components/EmailCapture";
import { useUrlSync } from "@/lib/useUrlState";

// EPA combined MPG, fueleconomy.gov (vehicle ids in comments). Premium = base MSRP hybrid trim minus gas trim, before destination:
// 2027 Corolla LE MPG 32/41/35 is Toyota's manufacturer estimate for the LE grade (pressroom.toyota.com 2027 Corolla release, read 2026-10-10).
// 2027 Corolla LE $23,325 vs Hybrid LE $25,175 (toyota.com, read 2026-10-09); 2026 Corolla Cross LE (FWD) $27,665 vs Hybrid S (AWD standard) $29,795 (toyota.com, read 2026-10-09; part of that premium buys AWD);
// 2026 Accord LX $28,395 vs Hybrid EX-L $35,095 (hondanews.com '2026 Honda Accord Pricing & EPA Ratings' release, 10-09; the 48 MPG hybrid is the EX-L, which also adds equipment).
const EXAMPLE_PAIRS = [
  { name: "Toyota Corolla", year: 2027, gasLabel: "Corolla LE", gasMpg: 35, gasCity: 32, gasHwy: 41, hybridLabel: "Corolla Hybrid LE", hybridMpg: 50, hybridCity: 53, hybridHwy: 46, premium: 1850 }, // gas LE: Toyota pressroom 2027 release (EPA lists only one gas 2027 Corolla, 50740, 33 MPG, not the LE); hybrid LE FWD 50735
  { name: "Toyota Corolla Cross", year: 2026, gasLabel: "Corolla Cross LE", gasMpg: 32, gasCity: 31, gasHwy: 33, hybridLabel: "Corolla Cross Hybrid S AWD", hybridMpg: 42, hybridCity: 46, hybridHwy: 39, premium: 2130 }, // 49846, 49870
  { name: "Honda Accord", year: 2026, gasLabel: "Accord LX", gasMpg: 32, gasCity: 29, gasHwy: 37, hybridLabel: "Accord Hybrid EX-L", hybridMpg: 48, hybridCity: 51, hybridHwy: 44, premium: 6700 }, // 50070, 50071
];
// Two tiles share a 390px row; four-digit and negative dollar values need a smaller number there.
const TILE_FIT = "max-sm:[&_.cm-result-number]:!text-[1.6rem]";
const EXAMPLE_MILES = 12000;
const EXAMPLE_PRICES = [3, 3.5, 4];

// Gallons add per mile, so a city/highway split blends MPG harmonically.
function blendMpg(city: number, hwy: number, cityShare: number) {
  if (city <= 0 || hwy <= 0) return 0;
  return 1 / (cityShare / city + (1 - cityShare) / hwy);
}

function annualSavings(miles: number, gasMpg: number, hybridMpg: number, price: number) {
  if (gasMpg <= 0 || hybridMpg <= 0) return 0;
  return (miles / gasMpg - miles / hybridMpg) * price;
}

const hybridVsGasFAQ = [
  {
    question: "How much does a hybrid save on gas per year?",
    answer:
      `It depends on miles driven, the MPG gap and the gas price. At 12,000 miles a year and $3.50 a gallon, a 2027 Corolla Hybrid (50 MPG combined) uses about 103 fewer gallons than the gas Corolla LE (35 MPG), which is roughly $360 a year. A 2026 Corolla Cross Hybrid (42 MPG) versus the gas Corolla Cross (32 MPG) saves about $313 a year at the same price.`,
  },
  {
    question: "How do I calculate hybrid payback?",
    answer:
      "Divide the extra price you pay for the hybrid by its annual fuel savings. Annual fuel savings are (miles / gas MPG minus miles / hybrid MPG) times the price per gallon. A $1,850 premium with $360 a year in savings pays back in about 5.1 years.",
  },
  {
    question: "Is a hybrid worth it if I drive few miles?",
    answer:
      "Fuel savings scale with miles. At 6,000 miles a year the savings are half of what they are at 12,000, so the payback period doubles. Low-mileage drivers who pay a large premium may never earn it back on fuel alone.",
  },
  {
    question: "Why can a bigger MPG gap save less gas?",
    answer:
      "Fuel use is gallons per mile, not miles per gallon, so each extra MPG saves less as cars get more efficient. Going from 25 to 35 MPG (a 10 MPG gap) saves about 137 gallons over 12,000 miles, while going from 40 to 55 MPG (a 15 MPG gap) saves only about 82. Compare gallons used, which is what this calculator does.",
  },
  {
    question: "Where do the example MPG figures come from?",
    answer:
      `They are EPA combined ratings from fueleconomy.gov for the model year each example names, except the 2027 gas Corolla LE: EPA has not yet listed a separate LE record, so its 35 MPG is the estimate Toyota publishes for that grade. Real-world mileage varies with speed, temperature and driving style, so enter your own figures if you know them.`,
  },
];

export default function HybridVsGasPage() {
  const [annualMiles, setAnnualMiles] = useState(12000);
  const [gasMpg, setGasMpg] = useState(35);
  const [hybridMpg, setHybridMpg] = useState(50);
  const [gasPrice, setGasPrice] = useState(3.5);
  const [premium, setPremium] = useState(1850);
  const [years, setYears] = useState(8);
  const [useMix, setUseMix] = useState(false);
  const [cityPct, setCityPct] = useState(55);
  const [gasCity, setGasCity] = useState(32);
  const [gasHwy, setGasHwy] = useState(41);
  const [hybridCity, setHybridCity] = useState(53);
  const [hybridHwy, setHybridHwy] = useState(46);

  useUrlSync(
    { miles: annualMiles, gmpg: gasMpg, hmpg: hybridMpg, price: gasPrice, prem: premium, yrs: years, mix: useMix ? 1 : 0, city: cityPct, gc: gasCity, gh: gasHwy, hc: hybridCity, hh: hybridHwy },
    (p) => {
      if (p.miles) setAnnualMiles(Number(p.miles));
      if (p.gmpg) setGasMpg(Number(p.gmpg));
      if (p.hmpg) setHybridMpg(Number(p.hmpg));
      if (p.price) setGasPrice(Number(p.price));
      if (p.prem) setPremium(Number(p.prem));
      if (p.yrs) setYears(Number(p.yrs));
      if (p.mix) setUseMix(p.mix === "1");
      if (p.city) setCityPct(Number(p.city));
      if (p.gc) setGasCity(Number(p.gc));
      if (p.gh) setGasHwy(Number(p.gh));
      if (p.hc) setHybridCity(Number(p.hc));
      if (p.hh) setHybridHwy(Number(p.hh));
    }
  );

  const r = useMemo(() => {
    const share = cityPct / 100;
    const gEff = useMix ? blendMpg(gasCity, gasHwy, share) : gasMpg;
    const hEff = useMix ? blendMpg(hybridCity, hybridHwy, share) : hybridMpg;
    const gasGallons = gEff > 0 ? annualMiles / gEff : 0;
    const hybridGallons = hEff > 0 ? annualMiles / hEff : 0;
    const gasCost = gasGallons * gasPrice;
    const hybridCost = hybridGallons * gasPrice;
    const savings = gasCost - hybridCost;
    const paybackYears = savings > 0 ? premium / savings : Infinity;
    const netOverOwnership = savings * years - premium;
    return { gEff, hEff, gasGallons, hybridGallons, gasCost, hybridCost, savings, paybackYears, netOverOwnership };
  }, [annualMiles, gasMpg, hybridMpg, gasPrice, premium, years, useMix, cityPct, gasCity, gasHwy, hybridCity, hybridHwy]);

  const paybackText = Number.isFinite(r.paybackYears)
    ? r.paybackYears > years
      ? `${r.paybackYears.toFixed(1)} years, longer than the ${years} years you plan to keep the car`
      : `${r.paybackYears.toFixed(1)} years`
    : "never on fuel alone";

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl bg-[var(--color-brand-soft)] px-3 py-2 text-sm font-semibold text-[var(--color-ink)] sm:hidden" aria-live="polite">
        Hybrid saves ${Math.round(Math.max(0, r.savings)).toLocaleString()} a year on gas. Payback: {paybackText}.
      </div>
      <div className="sm:col-span-2">
        <div className="mb-2 text-sm font-medium">Start from a real pair (fills MPG and price premium)</div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PAIRS.map((pair) => (
            <button
              key={pair.name}
              type="button"
              onClick={() => {
                setGasMpg(pair.gasMpg);
                setHybridMpg(pair.hybridMpg);
                setPremium(pair.premium);
                setGasCity(pair.gasCity);
                setGasHwy(pair.gasHwy);
                setHybridCity(pair.hybridCity);
                setHybridHwy(pair.hybridHwy);
              }}
              className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm hover:border-[var(--color-accent)]"
            >
              {pair.year} {pair.name}
            </button>
          ))}
        </div>
      </div>
      <SliderInput
        label="Miles driven per year"
        value={annualMiles}
        onChange={setAnnualMiles}
        min={2000}
        max={40000}
        step={500}
        unit="mi"
        showValue
      />
      <NumberInput
        label="Gas price"
        value={gasPrice}
        onChange={setGasPrice}
        min={1}
        max={10}
        step={0.05}
        unit="$/gal"
        helpText="Enter what you pay locally"
      />
      <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
        <input type="checkbox" checked={useMix} onChange={(e) => setUseMix(e.target.checked)} className="h-4 w-4" />
        Split by city and highway driving (hybrids gain most in town)
      </label>
      {useMix ? (
        <>
          <div className="sm:col-span-2">
            <SliderInput label="Share of miles in city driving" value={cityPct} onChange={setCityPct} min={0} max={100} step={5} unit="%" showValue />
          </div>
          <NumberInput label="Gas car city MPG" value={gasCity} onChange={setGasCity} min={5} max={80} step={1} unit="MPG" />
          <NumberInput label="Gas car highway MPG" value={gasHwy} onChange={setGasHwy} min={5} max={80} step={1} unit="MPG" />
          <NumberInput label="Hybrid city MPG" value={hybridCity} onChange={setHybridCity} min={5} max={80} step={1} unit="MPG" />
          <NumberInput label="Hybrid highway MPG" value={hybridHwy} onChange={setHybridHwy} min={5} max={80} step={1} unit="MPG" />
          <p className="text-xs text-[var(--color-text-muted)] sm:col-span-2">
            Effective MPG at this mix: gas car {r.gEff.toFixed(1)}, hybrid {r.hEff.toFixed(1)}. EPA&apos;s combined rating assumes 55% city.
          </p>
        </>
      ) : (
        <>
          <NumberInput label="Gas car MPG (combined)" value={gasMpg} onChange={setGasMpg} min={5} max={80} step={1} unit="MPG" />
          <NumberInput label="Hybrid MPG (combined)" value={hybridMpg} onChange={setHybridMpg} min={5} max={80} step={1} unit="MPG" />
        </>
      )}
      <NumberInput
        label="Extra price paid for the hybrid"
        value={premium}
        onChange={setPremium}
        min={0}
        max={20000}
        step={100}
        unit="$"
        helpText="Hybrid sticker price minus the gas version's"
      />
      <SliderInput
        label="Years you will keep the car"
        value={years}
        onChange={setYears}
        min={1}
        max={20}
        step={1}
        unit="yr"
        showValue
      />
    </div>
  );

  const hero = (
    <SavingsVerdict
      headline="HYBRID SAVES"
      amount={Math.max(0, r.savings)}
      amountUnit="/year"
      sub={
        <>
          On gas at {annualMiles.toLocaleString()} miles a year. The ${premium.toLocaleString()} premium pays back in {paybackText}.
        </>
      }
      dialPercent={r.gasCost > 0 ? Math.max(0, Math.min(100, (r.savings / r.gasCost) * 100)) : 0}
      dialLabel="FUEL CUT"
    >
      <SavingsTile className={TILE_FIT} label="GAS CAR FUEL" value={r.gasCost} prefix="$" sub="per year" tier="warn" animate />
      <SavingsTile className={TILE_FIT} label="HYBRID FUEL" value={r.hybridCost} prefix="$" sub="per year" tier="volt" animate />
      {Number.isFinite(r.paybackYears) ? (
        <SavingsTile className={TILE_FIT} label="PAYBACK" value={r.paybackYears} decimals={1} sub="years" tier="brand" animate />
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
          <div className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)]">PAYBACK</div>
          <div className="mt-1 text-2xl font-bold text-[var(--color-warn-ink)]">Never</div>
          <div className="mt-1 text-xs text-[var(--color-text-muted)]">The hybrid saves no gas at these MPG figures</div>
        </div>
      )}
      <SavingsTile
        className={TILE_FIT}
        label={`${years} YR NET`}
        value={Math.abs(r.netOverOwnership)}
        prefix={r.netOverOwnership < 0 ? "-$" : "$"}
        sub={r.netOverOwnership < 0 ? "lost after the premium" : "saved after the premium"}
        tier={r.netOverOwnership >= 0 ? "good" : "warn"}
        animate
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Cost comparison"
      title="Hybrid vs Gas Calculator"
      quickAnswer="At 12,000 miles a year and $3.50 gas, a 50 MPG hybrid saves about $360 a year over a 35 MPG gas car, so a $1,850 hybrid premium pays back in about 5 years."
      inputs={inputs}
      hero={hero}
    >
      <CalculatorSchema
        name="Hybrid vs Gas Fuel Savings and Payback Calculator"
        description="Annual gas savings, payback years on the hybrid price premium, and net savings over the years you keep the car, for a hybrid versus a gas car."
        url="https://chargemath.com/hybrid-vs-gas"
        datePublished="2026-10-10"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Hybrid vs Gas Calculator", url: "https://chargemath.com/hybrid-vs-gas" },
        ]}
      />

      <h2 className="cm-eyebrow mt-8 mb-3">Hybrid vs gas: real model pairs</h2>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white" style={{ overflowX: "auto" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Model</th>
              <th className="p-3">Gas MPG</th>
              <th className="p-3">Hybrid MPG</th>
              <th className="p-3">Gallons saved / yr</th>
              <th className="p-3">Hybrid premium</th>
              {EXAMPLE_PRICES.map((p) => (
                <th key={p} className="p-3">Saved / yr at ${p.toFixed(2)}</th>
              ))}
              <th className="p-3">Payback at $3.50</th>
            </tr>
          </thead>
          <tbody>
            {EXAMPLE_PAIRS.map((pair) => (
              <tr key={pair.name} className="border-t border-[var(--color-border)]">
                <td className="p-3">{pair.year} {pair.gasLabel} vs {pair.hybridLabel}</td>
                <td className="p-3">{pair.gasMpg}</td>
                <td className="p-3">{pair.hybridMpg}</td>
                <td className="p-3">{Math.round(EXAMPLE_MILES / pair.gasMpg - EXAMPLE_MILES / pair.hybridMpg)}</td>
                <td className="p-3">${pair.premium.toLocaleString()}</td>
                {EXAMPLE_PRICES.map((p) => (
                  <td key={p} className="p-3">
                    ${Math.round(annualSavings(EXAMPLE_MILES, pair.gasMpg, pair.hybridMpg, p)).toLocaleString()}
                  </td>
                ))}
                <td className="p-3">{(pair.premium / annualSavings(EXAMPLE_MILES, pair.gasMpg, pair.hybridMpg, 3.5)).toFixed(1)} years</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        EPA combined ratings, for the model year shown on each row, from fueleconomy.gov (2027 gas Corolla LE: Toyota's published estimate for the LE grade). {` ${EXAMPLE_MILES.toLocaleString()} miles a year. `}Premium is the base MSRP gap between the two trims before destination, from Toyota, Honda and Edmunds listings for the same model years; dealer prices vary. The gas Corolla Cross LE is front-wheel drive and the hybrid has all-wheel drive as standard, so part of its premium buys AWD. The Accord&apos;s 48 MPG hybrid is the EX-L, which also adds equipment the LX lacks, so part of that premium buys features, not fuel savings.
      </p>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/ev-vs-hybrid"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Add an EV to the comparison
        </Link>
        <Link
          href="/payback-period"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          EV payback period vs gas
        </Link>
        <Link
          href="/gas-vs-electric"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Gas vs electric cost
        </Link>
      </div>

      <EducationalContent>
        <h2>How the hybrid vs gas calculation works</h2>
        <p>
          Yearly gallons for each car are your annual miles divided by its combined MPG. The difference in gallons times your gas price is the yearly fuel saving. Payback is the hybrid&apos;s extra purchase price divided by that saving, and the net figure is your years of ownership times the yearly saving, minus the premium.
        </p>
        <h2>What the calculator leaves out</h2>
        <p>
          It compares fuel only. Insurance, resale value, financing and maintenance can move the answer either way, and city driving usually favors hybrids more than highway driving because regenerative braking recovers energy in stop-and-go traffic. If most of your miles are in town or on the highway, tick "Split by city and highway driving" and set your share of city miles.
        </p>
      </EducationalContent>

      <FAQSection questions={hybridVsGasFAQ} />
      <EmailCapture source="hybrid-vs-gas" />
      <RelatedCalculators currentPath="/hybrid-vs-gas" />
    </CalculatorShell>
  );
}
