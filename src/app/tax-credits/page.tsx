"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import CalculatorShell from "@/components/CalculatorShell";
import SavingsVerdict from "@/components/SavingsVerdict";
import SavingsTile from "@/components/SavingsTile";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import EducationalContent from "@/components/EducationalContent";
import EmailCapture from "@/components/EmailCapture";
import { getDefaultStateCode } from "@/lib/useDefaultState";
import { useUrlSync } from "@/lib/useUrlState";
import { taxCreditFAQ } from "@/data/faq-data";
import { ELECTRICITY_RATES } from "@/data/electricity-rates";
import { STATE_INCENTIVES, FEDERAL_CREDITS } from "@/data/ev-incentives";

type VehicleType = "new" | "used";
type FilingStatus = "single" | "headOfHousehold" | "married";

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type CreditStatus = "eligible" | "expired" | "check" | "over_income" | "over_price" | "na";

interface CreditRow {
  name: string;
  amount: number;
  status: CreditStatus;
  notes: string;
}

const STATUS_LABELS: Record<CreditStatus, string> = {
  eligible: "ELIGIBLE",
  expired: "EXPIRED",
  check: "CHECK",
  over_income: "OVER INCOME",
  over_price: "OVER PRICE",
  na: "N/A",
};

export default function TaxCreditsPage() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("new");
  const [stateCode, setStateCode] = useState("CA");
  const [purchasePrice, setPurchasePrice] = useState(35000);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [agi, setAgi] = useState(75000);
  const [wantsCharger, setWantsCharger] = useState("no");
  const [chargerCost, setChargerCost] = useState(1300);

  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  useUrlSync(
    { type: vehicleType, state: stateCode, price: purchasePrice, filing: filingStatus },
    useCallback((p: Record<string, string>) => {
      if (p.type && ["new", "used"].includes(p.type)) setVehicleType(p.type as VehicleType);
      if (p.state) setStateCode(p.state);
      if (p.price) setPurchasePrice(Number(p.price));
      if (p.filing && ["single", "headOfHousehold", "married"].includes(p.filing)) setFilingStatus(p.filing as FilingStatus);
    }, [])
  );

  const stateOptions = Object.entries(ELECTRICITY_RATES)
    .sort((a, b) => a[1].state.localeCompare(b[1].state))
    .map(([code, data]) => ({
      value: code,
      label: data.state,
    }));

  const vehicleTypeOptions = [
    { value: "new", label: "New EV" },
    { value: "used", label: "Used EV" },
  ];

  const filingStatusOptions: { value: FilingStatus; label: string }[] = [
    { value: "single", label: "Single" },
    { value: "headOfHousehold", label: "Head of Household" },
    { value: "married", label: "Married Filing Jointly" },
  ];

  const chargerOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  // Update defaults when vehicle type changes
  const handleVehicleTypeChange = (val: string) => {
    setVehicleType(val as VehicleType);
    if (val === "used" && purchasePrice > 25000) {
      setPurchasePrice(15000);
    } else if (val === "new" && purchasePrice <= 25000) {
      setPurchasePrice(35000);
    }
  };

  const credits = useMemo(() => {
    const rows: CreditRow[] = [];

    // Federal new vehicle credit (30D) - expired Sept 30 2025
    if (vehicleType === "new") {
      rows.push({
        name: `Federal ${FEDERAL_CREDITS.newVehicle.name}`,
        amount: 0,
        status: "expired",
        notes: FEDERAL_CREDITS.newVehicle.expirationNote,
      });
    }

    // Federal used vehicle credit (25E)
    if (vehicleType === "used") {
      const usedCredit = FEDERAL_CREDITS.usedVehicle;
      const incomeLimit = usedCredit.incomeLimit[filingStatus];
      const overIncome = agi > incomeLimit;
      const overPrice = purchasePrice > usedCredit.priceLimit;
      const creditAmount = Math.min(
        usedCredit.maxAmount,
        Math.round(purchasePrice * 0.3)
      );

      let status: CreditStatus = "eligible";
      let notes = usedCredit.notes || "";
      if (overIncome) {
        status = "over_income";
        notes = `AGI exceeds ${fmt.format(incomeLimit)} limit for ${filingStatus === "married" ? "married filing jointly" : filingStatus === "headOfHousehold" ? "head of household" : "single"} filers.`;
      } else if (overPrice) {
        status = "over_price";
        notes = `Vehicle price exceeds the $25,000 limit for used EV credit.`;
      }

      rows.push({
        name: `Federal ${usedCredit.name}`,
        amount: status === "eligible" ? creditAmount : 0,
        status,
        notes,
      });
    }

    // State incentives
    const stateIncentive = STATE_INCENTIVES.find((s) => s.code === stateCode);
    if (stateIncentive && stateIncentive.credits.length > 0) {
      for (const credit of stateIncentive.credits) {
        if (!credit.active) continue;
        rows.push({
          name: `State: ${stateIncentive.state} ${credit.name}`,
          amount: 0, // State amounts vary; show as CHECK
          status: "check",
          notes: credit.notes,
        });
      }
    }

    // Charger installation credit (30C)
    if (wantsCharger === "yes") {
      const charger30C = FEDERAL_CREDITS.chargerInstallation;
      const creditAmount = Math.min(
        charger30C.maxAmount,
        Math.round(chargerCost * 0.3)
      );

      rows.push({
        name: `Federal ${charger30C.name}`,
        amount: creditAmount,
        status: "eligible",
        notes: charger30C.notes || "",
      });
    }

    return rows;
  }, [vehicleType, stateCode, purchasePrice, filingStatus, agi, wantsCharger, chargerCost]);

  // Bucket totals for tiles
  const federalVehicleCredit = useMemo(() => {
    return credits
      .filter((c) => c.status === "eligible" && c.name.startsWith("Federal") && !c.name.toLowerCase().includes("charger"))
      .reduce((sum, c) => sum + c.amount, 0);
  }, [credits]);

  const stateCreditCount = useMemo(
    () => credits.filter((c) => c.name.startsWith("State:")).length,
    [credits]
  );

  const chargerCredit = useMemo(() => {
    return credits
      .filter((c) => c.status === "eligible" && c.name.toLowerCase().includes("charger"))
      .reduce((sum, c) => sum + c.amount, 0);
  }, [credits]);

  const totalEstimate = useMemo(() => {
    return credits
      .filter((c) => c.status === "eligible")
      .reduce((sum, c) => sum + c.amount, 0);
  }, [credits]);

  const hasAnyEligible = totalEstimate > 0 || stateCreditCount > 0;
  const stateName = ELECTRICITY_RATES[stateCode]?.state ?? stateCode;

  const dialPercent =
    purchasePrice > 0
      ? Math.max(0, Math.min(100, (totalEstimate / purchasePrice) * 100))
      : 0;

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Vehicle type"
        value={vehicleType}
        onChange={handleVehicleTypeChange}
        options={vehicleTypeOptions}
      />
      <SelectInput
        label="Your state"
        value={stateCode}
        onChange={setStateCode}
        options={stateOptions}
      />
      <NumberInput
        label="Purchase price"
        value={purchasePrice}
        onChange={setPurchasePrice}
        min={1000}
        max={200000}
        step={500}
        unit="$"
        helpText={
          vehicleType === "used"
            ? "Used EV credit requires price \u2264 $25,000"
            : undefined
        }
      />
    </div>
  );

  const hero = (
    <SavingsVerdict
      headline={hasAnyEligible ? "YOU MIGHT GET" : "NO CURRENT CREDIT"}
      amount={totalEstimate}
      amountUnit={stateCreditCount > 0 ? " + state" : ""}
      sub={
        vehicleType === "new" ? (
          <>
            The federal Section 30D new EV credit was repealed for vehicles placed in service after September 30, 2025.
            State and utility programs in {stateName} may still apply.
            The Section 30C home charger credit remains active through 2032.
          </>
        ) : (
          <>
            The federal Section 25E used EV credit is still active (30% of price up to $4,000).
            Eligibility depends on AGI, filing status, and a $25,000 price cap.
            Check {stateName} state and utility programs for additional savings.
          </>
        )
      }
      dialPercent={dialPercent}
      dialLabel="SHARE OF PRICE"
    >
      <SavingsTile
        label="FEDERAL"
        value={federalVehicleCredit}
        prefix="$"
        unit={vehicleType === "new" ? " (30D repealed)" : " (25E used)"}
        tier={federalVehicleCredit > 0 ? "good" : "warn"}
        animate
      />
      <SavingsTile
        label="STATE"
        value={stateCreditCount}
        unit={stateCreditCount === 1 ? " program" : " programs"}
        tier={stateCreditCount > 0 ? "brand" : "mid"}
        animate
      />
      <SavingsTile
        label="UTILITY"
        value={0}
        unit=" check local"
        tier="mid"
        animate
      />
      <SavingsTile
        label="CHARGER"
        value={chargerCredit}
        prefix="$"
        unit=" (30C)"
        tier={chargerCredit > 0 ? "volt" : "mid"}
        animate
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Tax credits"
      title="EV Tax Credit Estimator"
      quickAnswer="The federal new EV credit (30D) was repealed Sept 30 2025. Used EVs (25E, up to $4,000) and home charger installs (30C, up to $1,000) still qualify."
      inputs={inputs}
      hero={hero}
    >
      <CalculatorSchema
        name="EV Tax Credit Estimator"
        description="Estimate federal and state EV tax credits for new and used electric vehicles, plus charger installation credits."
        url="https://chargemath.com/tax-credits"
      />
      <BreadcrumbSchema items={[{name: "Home", url: "https://chargemath.com"}, {name: "EV Tax Credit Estimator", url: "https://chargemath.com/tax-credits"}]} />

      {/* Post-30D disclaimer banner */}
      <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-800">
          The federal Section 30D new EV credit was repealed by the OBBBA for vehicles placed in service after September 30, 2025. If you are buying a 2026 or newer EV, expect $0 from the federal new-vehicle credit. The Section 25E used EV credit (30% up to $4,000) and Section 30C home charger credit (30% up to $1,000, through 2032) remain active. Consult a tax professional for your specific situation.
        </p>
      </div>

      {/* Advanced inputs */}
      <details className="group mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink-2)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Filing status"
            value={filingStatus}
            onChange={(v) => setFilingStatus(v as FilingStatus)}
            options={filingStatusOptions}
          />
          <NumberInput
            label="Adjusted Gross Income (AGI)"
            value={agi}
            onChange={setAgi}
            min={0}
            max={1000000}
            step={1000}
            unit="$"
            helpText="Your modified adjusted gross income from your tax return"
          />
          <SelectInput
            label="Planning to install home charger?"
            value={wantsCharger}
            onChange={setWantsCharger}
            options={chargerOptions}
          />
          {wantsCharger === "yes" && (
            <NumberInput
              label="Charger + installation cost"
              value={chargerCost}
              onChange={setChargerCost}
              min={100}
              max={10000}
              step={50}
              unit="$"
              helpText="Total cost including equipment and electrician"
            />
          )}
        </div>
      </details>

      {/* Credits table */}
      <div className="mt-6">
        <h2 className="cm-eyebrow mb-3">Credit breakdown</h2>
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-ink)]">
                  Credit
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-ink)]">
                  Amount
                </th>
                <th className="px-4 py-3 text-center font-semibold text-[var(--color-ink)]">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-ink)] md:table-cell">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {credits.map((credit, i) => (
                <tr
                  key={i}
                  className="border-b border-[var(--color-border)] last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--color-ink)]">
                    {credit.name}
                    <span className="block text-xs text-[var(--color-ink-3)] md:hidden">
                      {credit.notes}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      credit.status === "expired"
                        ? "text-red-400 line-through"
                        : credit.status === "check"
                          ? "text-amber-600"
                          : "text-[var(--color-ink)]"
                    }`}
                  >
                    {credit.status === "check"
                      ? "Varies"
                      : credit.amount > 0
                        ? fmt.format(credit.amount)
                        : "$0"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-ink-2)]">
                      {STATUS_LABELS[credit.status]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-[var(--color-ink-3)] md:table-cell">
                    {credit.notes}
                  </td>
                </tr>
              ))}

              <tr className="bg-[var(--color-surface-alt)]">
                <td className="px-4 py-3 font-bold text-[var(--color-ink)]">
                  Total eligible
                </td>
                <td className="px-4 py-3 text-right text-lg font-bold text-[var(--color-good-ink)]">
                  {fmt.format(totalEstimate)}
                  {credits.some((c) => c.status === "check") && "+"}
                </td>
                <td className="px-4 py-3" />
                <td className="hidden px-4 py-3 text-xs text-[var(--color-ink-3)] md:table-cell">
                  {credits.some((c) => c.status === "check") &&
                    "Plus state incentives (amounts vary by eligibility)"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Contextual cross-links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/gas-vs-electric" className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]">
          Compare gas vs electric savings
        </Link>
        <Link href="/charger-roi" className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]">
          Calculate charger ROI
        </Link>
        <Link href="/ev-charging-cost" className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]">
          Estimate your charging costs
        </Link>
      </div>

      <EducationalContent>
        <h2>How EV Tax Credits Work</h2>
        <p>
          Federal EV tax credits reduce your federal income tax liability dollar-for-dollar. A $4,000 credit means $4,000 less in taxes owed. These are nonrefundable credits, meaning they can reduce your tax bill to zero but won&apos;t generate a refund beyond that. Credits are claimed when you file your annual tax return using IRS Form 8936.
        </p>
        <h3>Current Federal Credit Status (2026)</h3>
        <p>
          The Section 30D new vehicle credit was repealed by the One Big Beautiful Bill Act for vehicles placed in service after September 30, 2025. It has not been renewed. If you bought a new EV in late 2025 or 2026, the federal new-vehicle credit is $0. The Section 25E used vehicle credit remains active: 30% of the purchase price up to $4,000 for qualifying used EVs priced under $25,000, subject to income limits. The Section 30C charger installation credit also remains active through 2032: 30% of equipment and installation costs up to $1,000 for residential installs.
        </p>
        <h3>State Incentives Vary Widely</h3>
        <ul>
          <li>California offers rebates up to $7,500 through CVRP for lower-income buyers, plus utility-specific programs worth $500-1,000.</li>
          <li>Colorado provides $5,000 state tax credits for new EVs, one of the most generous state programs.</li>
          <li>Some states (Connecticut, Delaware, Maine) offer point-of-sale rebates that reduce the purchase price directly, rather than tax credits claimed later.</li>
          <li>State programs change frequently. Check your state&apos;s energy office website for the most current information before purchasing.</li>
        </ul>
      </EducationalContent>
      <FAQSection questions={taxCreditFAQ} />
      <EmailCapture source="tax-credits" />
      <RelatedCalculators currentPath="/tax-credits" />
    </CalculatorShell>
  );
}
