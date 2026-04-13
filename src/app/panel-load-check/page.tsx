"use client";

import { useMemo, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import ResultCard from "@/components/ResultCard";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import EducationalContent from "@/components/EducationalContent";
import RelatedCalculators from "@/components/RelatedCalculators";
import Link from "next/link";

/**
 * NEC 220.83 (Existing Dwelling — Optional Calculation) + NEC 625.42
 * (EV supply equipment, continuous load at 125%).
 *
 * The 220.83 "other load" calc:
 *   First 8 kVA at 100%, remainder at 40%.
 *
 * If NEW space heating or AC is being added, 220.83(B) says:
 *   - 100% of AC / heat pump (whichever is larger of 220.82 list)
 *   - Plus first 8 kVA of other load at 100%
 *   - Plus remainder at 40%
 *
 * This tool uses 220.83(A) / (B) depending on whether a new AC/heat load is
 * flagged. EV charger is added per 625.42 at 125% of the continuous rating.
 */

const panelOptions = [
  { value: "100", label: "100 A" },
  { value: "125", label: "125 A" },
  { value: "150", label: "150 A" },
  { value: "200", label: "200 A" },
  { value: "225", label: "225 A" },
  { value: "320", label: "320 A (400A service)" },
  { value: "400", label: "400 A" },
];

const rangeOptions = [
  { value: "0", label: "Gas or none" },
  { value: "8000", label: "Electric range, ~8 kW" },
  { value: "12000", label: "Electric range + oven, ~12 kW" },
  { value: "16500", label: "Double oven / commercial, ~16.5 kW" },
];

const dryerOptions = [
  { value: "0", label: "Gas or none" },
  { value: "5000", label: "Electric dryer, 5 kW (NEC 220.54 min)" },
  { value: "5600", label: "Heat-pump dryer, 5.6 kW" },
];

const waterHeaterOptions = [
  { value: "0", label: "Gas, heat pump on 120V, or none" },
  { value: "4500", label: "Electric tank, 4.5 kW" },
  { value: "5500", label: "Electric tank, 5.5 kW" },
  { value: "27000", label: "Electric tankless, 27 kW" },
];

const evAmpOptions = [
  { value: "16", label: "16 A (Level 1, 12 A continuous)" },
  { value: "24", label: "24 A (portable 24 A EVSE)" },
  { value: "32", label: "32 A (common entry-level L2)" },
  { value: "40", label: "40 A (mid-range L2)" },
  { value: "48", label: "48 A (Tesla Wall Connector, high-end)" },
  { value: "50", label: "50 A (NEMA 14-50 hard-wired at 50A)" },
  { value: "60", label: "60 A (high-speed L2)" },
  { value: "80", label: "80 A (rare, two Powerwalls or HPWC legacy)" },
];

const fmt = (n: number, digits = 0) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export default function PanelLoadCheckPage() {
  const [panelAmps, setPanelAmps] = useState("200");
  const [sqft, setSqft] = useState(2000);
  const [smallAppCircuits, setSmallAppCircuits] = useState(2);
  const [laundryCircuit, setLaundryCircuit] = useState(1);
  const [rangeVa, setRangeVa] = useState("12000");
  const [dryerVa, setDryerVa] = useState("5600");
  const [waterHeaterVa, setWaterHeaterVa] = useState("4500");
  const [dishwasherVa, setDishwasherVa] = useState(1200);
  const [disposalVa, setDisposalVa] = useState(900);
  const [otherVa, setOtherVa] = useState(0);
  const [acAmps, setAcAmps] = useState(25);
  const [electricHeatKw, setElectricHeatKw] = useState(0);
  const [evChargerAmps, setEvChargerAmps] = useState("48");

  const r = useMemo(() => {
    const VOLTS = 240;

    // 3 VA/sqft general lighting + receptacle per 220.82/83
    const lightingVa = sqft * 3;
    const smallAppVa = smallAppCircuits * 1500;
    const laundryVa = laundryCircuit * 1500;

    const generalOtherVa =
      lightingVa +
      smallAppVa +
      laundryVa +
      Number(rangeVa) +
      Number(dryerVa) +
      Number(waterHeaterVa) +
      Number(dishwasherVa) +
      Number(disposalVa) +
      Number(otherVa);

    // 220.83(A): First 8 kVA at 100%, remainder at 40%
    const otherDemandVa =
      generalOtherVa <= 8000
        ? generalOtherVa
        : 8000 + (generalOtherVa - 8000) * 0.4;

    // Heating / AC: take the larger of AC or electric heat per 220.82(C)
    const acVa = acAmps * VOLTS;
    const heatVa = electricHeatKw * 1000;
    const hvacVa = Math.max(acVa, heatVa);

    // EV charger per NEC 625.42: continuous load at 125%
    const evAmpsVal = Number(evChargerAmps);
    const evContinuousA = evAmpsVal * 1.25;
    const evVa = evContinuousA * VOLTS;

    const totalVa = otherDemandVa + hvacVa + evVa;
    const totalAmps = totalVa / VOLTS;

    const panelAmpsVal = Number(panelAmps);
    const headroomA = panelAmpsVal - totalAmps;
    const utilizationPct = (totalAmps / panelAmpsVal) * 100;

    let verdict: "pass" | "tight" | "fail";
    let verdictText: string;
    if (totalAmps > panelAmpsVal) {
      verdict = "fail";
      verdictText = `Over capacity by ${fmt(totalAmps - panelAmpsVal, 1)} A. Panel upgrade or smaller EV charger required.`;
    } else if (utilizationPct > 80) {
      verdict = "tight";
      verdictText = `Passes, but uses ${fmt(utilizationPct, 0)}% of panel capacity. Consider a lower-amp charger or NEC 625.42(A) load-management device.`;
    } else {
      verdict = "pass";
      verdictText = `Passes NEC 220.83 with ${fmt(headroomA, 1)} A of headroom (${fmt(utilizationPct, 0)}% panel utilization).`;
    }

    // Suggest lower charger amps if fail
    let suggestedEvAmps: number | null = null;
    if (verdict === "fail") {
      const availableVa = panelAmpsVal * VOLTS - otherDemandVa - hvacVa;
      const availableA = availableVa / VOLTS;
      suggestedEvAmps = Math.max(0, Math.floor(availableA / 1.25));
    }

    return {
      lightingVa,
      smallAppVa,
      laundryVa,
      generalOtherVa,
      otherDemandVa,
      hvacVa,
      acVa,
      heatVa,
      evAmpsVal,
      evContinuousA,
      evVa,
      totalVa,
      totalAmps,
      panelAmpsVal,
      headroomA,
      utilizationPct,
      verdict,
      verdictText,
      suggestedEvAmps,
    };
  }, [
    panelAmps,
    sqft,
    smallAppCircuits,
    laundryCircuit,
    rangeVa,
    dryerVa,
    waterHeaterVa,
    dishwasherVa,
    disposalVa,
    otherVa,
    acAmps,
    electricHeatKw,
    evChargerAmps,
  ]);

  const verdictColor =
    r.verdict === "pass"
      ? "text-emerald-600"
      : r.verdict === "tight"
        ? "text-amber-600"
        : "text-rose-600";

  const verdictBg =
    r.verdict === "pass"
      ? "bg-emerald-50 border-emerald-200"
      : r.verdict === "tight"
        ? "bg-amber-50 border-amber-200"
        : "bg-rose-50 border-rose-200";

  return (
    <CalculatorLayout
      title="EV Panel Load Calculator (NEC 220.83)"
      description="Check if your home electrical panel can handle a new EV charger without a service upgrade. Uses the NEC 220.83 existing-dwelling optional calculation plus the 625.42 continuous-load multiplier."
      answerBlock={
        <>
          <p>
            <strong>Quick answer:</strong> Your panel can handle a new EV charger if your
            existing calculated load plus the charger (at 125% of its continuous rating) fits
            inside your panel&apos;s amperage. For a typical 2,000 sq ft home with a 200 A
            service, a 48 A Tesla Wall Connector adds 60 A of continuous demand and usually
            fits with 40-80 A of headroom. Tight panels (100 A or 125 A) almost always need a
            lower-amp charger or a load-management device per NEC 625.42(A).
          </p>
        </>
      }
      lastUpdated="April 2026"
    >
      <CalculatorSchema
        name="EV Panel Load Calculator (NEC 220.83)"
        description="Free NEC-compliant home electrical panel load calculator for EV charger installs. Uses 220.83 existing-dwelling method and 625.42 continuous load multiplier. Outputs a printable permit worksheet."
        url="https://chargemath.com/panel-load-check"
        featureList={[
          "NEC 220.83 existing-dwelling method",
          "NEC 625.42 EV continuous load multiplier",
          "Printable permit worksheet",
          "Panel sizes from 100 A to 400 A",
          "Free, no signup",
        ]}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Panel Load Check", url: "https://chargemath.com/panel-load-check" },
        ]}
      />

      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Service panel size"
          value={panelAmps}
          onChange={setPanelAmps}
          options={panelOptions}
          helpText="The main breaker rating on your panel"
        />

        <NumberInput
          label="Living area"
          value={sqft}
          onChange={setSqft}
          min={400}
          max={10000}
          step={100}
          unit="sq ft"
          helpText="Conditioned floor area. NEC uses 3 VA/sq ft general lighting + receptacle load."
        />

        <SelectInput
          label="Electric range / oven"
          value={rangeVa}
          onChange={setRangeVa}
          options={rangeOptions}
        />

        <SelectInput
          label="Electric dryer"
          value={dryerVa}
          onChange={setDryerVa}
          options={dryerOptions}
        />

        <SelectInput
          label="Electric water heater"
          value={waterHeaterVa}
          onChange={setWaterHeaterVa}
          options={waterHeaterOptions}
        />

        <NumberInput
          label="Central AC (nameplate amps, 240V)"
          value={acAmps}
          onChange={setAcAmps}
          min={0}
          max={80}
          step={1}
          unit="A"
          helpText="On the AC disconnect label. 0 if gas/none."
        />

        <NumberInput
          label="Electric space heating"
          value={electricHeatKw}
          onChange={setElectricHeatKw}
          min={0}
          max={30}
          step={0.5}
          unit="kW"
          helpText="Total kW of electric baseboard or furnace. 0 if gas."
        />

        <NumberInput
          label="Dishwasher nameplate"
          value={dishwasherVa}
          onChange={setDishwasherVa}
          min={0}
          max={3000}
          step={100}
          unit="VA"
        />

        <NumberInput
          label="Disposal / built-ins"
          value={disposalVa}
          onChange={setDisposalVa}
          min={0}
          max={3000}
          step={100}
          unit="VA"
        />

        <NumberInput
          label="Other fixed appliances"
          value={otherVa}
          onChange={setOtherVa}
          min={0}
          max={20000}
          step={500}
          unit="VA"
          helpText="Pool pump, well pump, hot tub, spa, etc."
        />

        <NumberInput
          label="Small-appliance circuits"
          value={smallAppCircuits}
          onChange={setSmallAppCircuits}
          min={2}
          max={4}
          step={1}
          unit="circuits"
          helpText="NEC 210.11 requires at least 2. Each counts as 1,500 VA."
        />

        <NumberInput
          label="Laundry branch circuits"
          value={laundryCircuit}
          onChange={setLaundryCircuit}
          min={0}
          max={2}
          step={1}
          unit="circuits"
        />

        <div className="sm:col-span-2">
          <SelectInput
            label="Proposed EV charger"
            value={evChargerAmps}
            onChange={setEvChargerAmps}
            options={evAmpOptions}
            helpText="NEC 625.42 treats this as a continuous load, computed at 125% of rating."
          />
        </div>
      </div>

      {/* Verdict */}
      <div
        className={`mt-10 rounded-2xl border-2 ${verdictBg} p-6 text-center shadow-sm`}
        data-verdict={r.verdict}
      >
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          NEC 220.83 verdict
        </div>
        <div className={`text-4xl font-black ${verdictColor}`}>
          {r.verdict === "pass"
            ? "PASS"
            : r.verdict === "tight"
              ? "TIGHT"
              : "FAIL"}
        </div>
        <p className="mt-3 text-base text-[var(--color-text)]">{r.verdictText}</p>
        {r.verdict === "fail" && r.suggestedEvAmps !== null && r.suggestedEvAmps > 0 && (
          <p className="mt-2 text-sm font-medium text-[var(--color-text)]">
            Largest EV charger that fits:{" "}
            <strong>{r.suggestedEvAmps} A continuous</strong> (about{" "}
            {Math.floor(r.suggestedEvAmps * 0.8)} A charger breaker).
          </p>
        )}
      </div>

      {/* Demand breakdown table — the permit worksheet */}
      <div
        className="mt-8 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white"
        data-permit-worksheet
      >
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-5 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text)]">
            NEC 220.83 Worksheet
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Printable load calculation. Use File &gt; Print or Ctrl+P to save as PDF.
          </p>
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[var(--color-border)]">
            <Row label={`General lighting & receptacles (${sqft} sq ft × 3 VA)`} va={r.lightingVa} />
            <Row
              label={`Small-appliance circuits (${smallAppCircuits} × 1,500 VA)`}
              va={r.smallAppVa}
            />
            <Row label={`Laundry circuit (${laundryCircuit} × 1,500 VA)`} va={r.laundryVa} />
            <Row label="Electric range / oven" va={Number(rangeVa)} />
            <Row label="Electric dryer" va={Number(dryerVa)} />
            <Row label="Electric water heater" va={Number(waterHeaterVa)} />
            <Row label="Dishwasher" va={Number(dishwasherVa)} />
            <Row label="Disposal / built-ins" va={Number(disposalVa)} />
            {otherVa > 0 && <Row label="Other fixed appliances" va={Number(otherVa)} />}
            <tr className="bg-[var(--color-surface-alt)] font-semibold">
              <td className="px-5 py-2.5">Total &ldquo;other&rdquo; load</td>
              <td className="px-5 py-2.5 text-right">{fmt(r.generalOtherVa)} VA</td>
            </tr>
            <tr>
              <td className="px-5 py-2.5 italic text-[var(--color-text-muted)]">
                First 8,000 VA at 100%
              </td>
              <td className="px-5 py-2.5 text-right">
                {fmt(Math.min(8000, r.generalOtherVa))} VA
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2.5 italic text-[var(--color-text-muted)]">
                Remainder at 40%
              </td>
              <td className="px-5 py-2.5 text-right">
                {fmt(Math.max(0, r.generalOtherVa - 8000) * 0.4)} VA
              </td>
            </tr>
            <tr className="bg-[var(--color-surface-alt)]">
              <td className="px-5 py-2.5 font-semibold">&ldquo;Other&rdquo; demand subtotal</td>
              <td className="px-5 py-2.5 text-right font-semibold">
                {fmt(r.otherDemandVa)} VA
              </td>
            </tr>
            <Row label={`HVAC (larger of AC ${fmt(r.acVa)} VA / heat ${fmt(r.heatVa)} VA)`} va={r.hvacVa} />
            <Row
              label={`EV charger per NEC 625.42 (${r.evAmpsVal} A × 125% = ${fmt(r.evContinuousA, 1)} A × 240 V)`}
              va={r.evVa}
            />
            <tr className="bg-[var(--color-primary)]/5 text-lg font-bold">
              <td className="px-5 py-3.5">TOTAL DEMAND</td>
              <td className="px-5 py-3.5 text-right">
                {fmt(r.totalVa)} VA / {fmt(r.totalAmps, 1)} A
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2.5">Service panel rating</td>
              <td className="px-5 py-2.5 text-right">{r.panelAmpsVal} A</td>
            </tr>
            <tr
              className={
                r.headroomA >= 0
                  ? "bg-emerald-50 font-semibold"
                  : "bg-rose-50 font-semibold"
              }
            >
              <td className="px-5 py-2.5">Headroom</td>
              <td className="px-5 py-2.5 text-right">{fmt(r.headroomA, 1)} A</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Headline results */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <ResultCard
          label="Calculated demand"
          value={`${fmt(r.totalAmps, 1)}`}
          unit="A"
          highlight={r.verdict !== "fail"}
          icon="⚡"
        />
        <ResultCard
          label="Panel utilization"
          value={`${fmt(r.utilizationPct, 0)}`}
          unit="%"
          icon="📊"
        />
        <ResultCard
          label="EV charger continuous"
          value={`${fmt(r.evContinuousA, 1)}`}
          unit="A"
          icon="🔌"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/charger-roi"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          How fast will a home charger pay back? →
        </Link>
        <Link
          href="/bill-impact"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Bill impact of this charger →
        </Link>
        <Link
          href="/tou-optimizer"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Best hours to charge →
        </Link>
      </div>

      <ShareResults
        title={`Panel Load Check: ${r.verdict.toUpperCase()}`}
        text={`My ${r.panelAmpsVal}A panel with a ${r.evAmpsVal}A EV charger computes to ${fmt(r.totalAmps, 1)}A demand (${fmt(r.utilizationPct, 0)}% utilization) per NEC 220.83.`}
        card={{
          headline: `${fmt(r.totalAmps, 1)} A`,
          label: `NEC 220.83 demand on a ${r.panelAmpsVal} A panel`,
          sub: `${r.evAmpsVal} A EV charger — ${r.verdict === "pass" ? "PASSES" : r.verdict === "tight" ? "TIGHT" : "OVER CAPACITY"}`,
          calc: "panel-load-check",
        }}
      />

      <EducationalContent>
        <h2>Why NEC 220.83 Is the Right Method for EV Charger Adds</h2>
        <p>
          When you add a new appliance like an EV charger to an existing home, NEC Article
          220 gives you two main options for calculating load: the standard method (220.40
          et seq.) and the optional existing-dwelling method (220.83). Inspectors and
          installers almost always use 220.83 for retrofits because it factors in the
          reality that not every appliance runs at the same time: the first 8 kVA of
          &ldquo;other&rdquo; load is taken at 100%, the remainder at 40%. The standard
          method produces artificially high numbers that fail panels that in practice
          handle the load every day.
        </p>
        <h3>How the 125% EV Continuous-Load Multiplier Works</h3>
        <p>
          NEC 625.42 classifies EV supply equipment as a continuous load because an EV draws
          near-maximum current for 3+ hours at a stretch. Continuous loads must be
          calculated at 125% of their rated current. A 48 A Tesla Wall Connector therefore
          computes to 60 A of continuous demand (48 × 1.25), which is why the recommended
          breaker for a 48 A charger is a 60 A breaker, not a 50 A. This calculator applies
          the 125% factor automatically.
        </p>
        <h3>When a Load Management Device Can Save You a Panel Upgrade</h3>
        <p>
          NEC 625.42(A) explicitly allows automatic load-management systems. Devices like
          the DCC-9, NeoCharge, or Wallbox Quasar-class chargers with built-in load
          management can sense when other heavy loads (oven, dryer, HVAC) are active and
          reduce or pause EV charging to stay inside panel capacity. If this calculator
          returns TIGHT or FAIL, a load-management device is usually much cheaper than a
          service upgrade, which can run $2,500-5,000 plus permit and utility reconnection
          fees.
        </p>
        <h3>What to Give Your Electrician / Inspector</h3>
        <ul>
          <li>Print this worksheet (Ctrl+P or File &gt; Print) as a starting point.</li>
          <li>
            Verify nameplate ratings on your actual equipment (range, dryer, water heater,
            AC). This calculator uses code defaults, but inspectors want the actual
            nameplate VA.
          </li>
          <li>
            Confirm your exact panel bus rating, not just the main breaker. Some 200 A main
            breakers sit on a 150 A bus from the utility.
          </li>
          <li>
            If you have a heat pump with electric strip backup, the strip heat is usually
            the larger of the two and drives the HVAC line.
          </li>
        </ul>
        <h3>Sources</h3>
        <ul>
          <li>NFPA 70 (NEC 2023) Article 220.83 &mdash; Existing Dwelling Optional Calculation</li>
          <li>NFPA 70 (NEC 2023) Article 625.42 &mdash; EV Supply Equipment Rating</li>
          <li>NFPA 70 (NEC 2023) Article 210.11 &mdash; Branch Circuit Requirements</li>
        </ul>
      </EducationalContent>
      <FAQSection questions={panelLoadFAQ} />
      <RelatedCalculators currentPath="/panel-load-check" />
    </CalculatorLayout>
  );
}

function Row({ label, va }: { label: string; va: number }) {
  return (
    <tr>
      <td className="px-5 py-2.5 text-[var(--color-text)]">{label}</td>
      <td className="px-5 py-2.5 text-right text-[var(--color-text-muted)]">
        {fmt(va)} VA
      </td>
    </tr>
  );
}

const panelLoadFAQ = [
  {
    question: "Do I really need a 200A panel for an EV charger?",
    answer:
      "Not always. The real question is whether your existing calculated load plus the charger fits inside your panel's rating under NEC 220.83. A 100 A service in a small home with gas heat, gas range, and gas dryer can easily fit a 32 A or even 40 A EV charger. What forces an upgrade is usually a combination of electric heat, electric range, electric dryer, and a high-amp EV charger on a small service.",
  },
  {
    question: "Why does NEC add 125% to my EV charger load?",
    answer:
      "NEC 625.42 classifies EV supply equipment as a continuous load because EVs pull near-peak current for 3+ hours at a time. Continuous loads must be calculated at 125% of their rating. A 48 A charger therefore appears as 60 A continuous in the load calculation. This is also why code requires a breaker sized to at least 125% of the charger's rating.",
  },
  {
    question: "What is a load management device and when does it help?",
    answer:
      "A load management device (sometimes called a power-sharing device) monitors your panel's total current draw in real time and automatically reduces or pauses EV charging when other large loads are active. NEC 625.42(A) explicitly permits these to let you install a larger EV charger than a strict load calculation would allow. Common options include the DCC-9 (around $500), NeoCharge splitters for dryer/range outlets, and some wallbox chargers with built-in load sensing.",
  },
  {
    question: "Does the calculator account for solar or a home battery?",
    answer:
      "No. NEC 220.83 is a worst-case demand calculation that assumes no generation. Solar and batteries reduce your utility-side consumption but do not reduce the demand your panel must be sized to handle. The inspector signs off on the panel load calculation, not the utility bill.",
  },
  {
    question: "Why does the worksheet say the largest HVAC load, not both?",
    answer:
      "NEC 220.82(C) lets you take the single largest HVAC load because heating and cooling don't run simultaneously in a residence. If your AC nameplate draws more watts than your electric heat, only the AC counts; otherwise heat counts. This reflects how homes actually use power.",
  },
  {
    question: "Is this permit-ready?",
    answer:
      "The printed worksheet is in the same format inspectors expect and follows the 220.83 optional method exactly. However, requirements vary by jurisdiction: some cities still require a licensed electrician's stamp on the calc, and some utilities will run their own demand study before approving service-sized loads. Use this as a planning tool and starting point — bring it to your electrician to verify nameplate VAs and local amendments.",
  },
];
