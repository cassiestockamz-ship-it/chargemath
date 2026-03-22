"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import AffiliateCard from "@/components/AffiliateCard";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import { taxCreditFAQ } from "@/data/faq-data";
import { ELECTRICITY_RATES } from "@/data/electricity-rates";
import { STATE_INCENTIVES, FEDERAL_CREDITS } from "@/data/ev-incentives";

const AMAZON_TAG = "kawaiiguy0f-cm-20";

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

const STATUS_COLORS: Record<CreditStatus, string> = {
  eligible: "text-green-600 bg-green-50 border-green-200",
  expired: "text-red-500 bg-red-50 border-red-200 line-through",
  check: "text-amber-600 bg-amber-50 border-amber-200",
  over_income: "text-red-500 bg-red-50 border-red-200",
  over_price: "text-red-500 bg-red-50 border-red-200",
  na: "text-gray-400 bg-gray-50 border-gray-200",
};

export default function TaxCreditsPage() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("new");
  const [stateCode, setStateCode] = useState("CA");
  const [purchasePrice, setPurchasePrice] = useState(35000);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [agi, setAgi] = useState(75000);
  const [wantsCharger, setWantsCharger] = useState("no");
  const [chargerCost, setChargerCost] = useState(1300);

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

    // Federal new vehicle credit (30D) - expired
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

        // For used vehicle type, only show if notes mention "used"
        // For simplicity, show all state credits with "CHECK" status
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

  const totalEstimate = useMemo(() => {
    return credits
      .filter((c) => c.status === "eligible")
      .reduce((sum, c) => sum + c.amount, 0);
  }, [credits]);

  return (
    <CalculatorLayout
      title="EV Tax Credit Estimator"
      description="Estimate your federal and state EV tax credits, rebates, and charger installation incentives."
      lastUpdated="March 2026"
    >
      <CalculatorSchema
        name="EV Tax Credit Estimator"
        description="Estimate federal and state EV tax credits for new and used electric vehicles, plus charger installation credits."
        url="https://chargemath.com/tax-credits"
      />
      <BreadcrumbSchema items={[{name: "Home", url: "https://chargemath.com"}, {name: "EV Tax Credit Estimator", url: "https://chargemath.com/tax-credits"}]} />

      {/* Disclaimer Banner */}
      <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-800">
          Tax credit information changes frequently. This calculator provides
          estimates only. Consult a tax professional for advice specific to your
          situation. The federal 30D credit for new EVs expired September 30, 2025.
          The used EV credit (25E) and charger credit (30C) remain active.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Vehicle Type"
          value={vehicleType}
          onChange={handleVehicleTypeChange}
          options={vehicleTypeOptions}
        />

        <SelectInput
          label="Your State"
          value={stateCode}
          onChange={setStateCode}
          options={stateOptions}
        />

        <NumberInput
          label="Purchase Price"
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

        <SelectInput
          label="Filing Status"
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
          label="Planning to Install Home Charger?"
          value={wantsCharger}
          onChange={setWantsCharger}
          options={chargerOptions}
        />

        {wantsCharger === "yes" && (
          <NumberInput
            label="Charger + Installation Cost"
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

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Your Estimated Credits & Incentives
        </h2>

        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                  Credit
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                  Amount
                </th>
                <th className="px-4 py-3 text-center font-semibold text-[var(--color-text)]">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-text)] md:table-cell">
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
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                    {credit.name}
                    <span className="block text-xs text-[var(--color-text-muted)] md:hidden">
                      {credit.notes}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      credit.status === "expired"
                        ? "text-red-400 line-through"
                        : credit.status === "check"
                          ? "text-amber-600"
                          : "text-[var(--color-text)]"
                    }`}
                  >
                    {credit.status === "check"
                      ? "Varies"
                      : credit.amount > 0
                        ? fmt.format(credit.amount)
                        : "$0"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[credit.status]}`}
                    >
                      {STATUS_LABELS[credit.status]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-[var(--color-text-muted)] md:table-cell">
                    {credit.notes}
                  </td>
                </tr>
              ))}

              {/* Total row */}
              <tr className="bg-[var(--color-surface-alt)]">
                <td className="px-4 py-3 font-bold text-[var(--color-text)]">
                  Total Estimated Credits
                </td>
                <td className="px-4 py-3 text-right text-lg font-bold text-[var(--color-ev-green)]">
                  {fmt.format(totalEstimate)}
                  {credits.some((c) => c.status === "check") && "+"}
                </td>
                <td className="px-4 py-3" />
                <td className="hidden px-4 py-3 text-xs text-[var(--color-text-muted)] md:table-cell">
                  {credits.some((c) => c.status === "check") &&
                    "Plus state incentives (amounts vary by eligibility)"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Key for status badges */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
            ELIGIBLE = You likely qualify
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
            CHECK = Income/eligibility requirements apply
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
            EXPIRED / OVER INCOME / OVER PRICE = Not available
          </div>
        </div>
      </div>

      <ShareResults
        title={`EV Tax Credits: ${fmt.format(totalEstimate)}`}
        text={`I may qualify for ${fmt.format(totalEstimate)} in EV tax credits for a ${vehicleType === "new" ? "new" : "used"} EV in ${ELECTRICITY_RATES[stateCode]?.state ?? stateCode}.${wantsCharger === "yes" ? ` Plus a charger installation credit!` : ""}`}
      />

      {/* Affiliate Cards */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Recommended Products
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {wantsCharger === "yes" && (
            <AffiliateCard
              title="ChargePoint Home Flex"
              description="Adjustable amperage (16-50A), works with all EVs, WiFi-enabled with app control and energy tracking."
              priceRange="$399 - $549"
              amazonTag={AMAZON_TAG}
              searchQuery="ChargePoint Home Flex ev charger"
              imageAlt="ChargePoint Home Flex EV charger on Amazon"
              slug="tax-credits"
            />
          )}
          <AffiliateCard
            title="EV Tax Preparation Guide"
            description="Comprehensive guide to claiming EV tax credits, understanding eligibility, and maximizing your savings at tax time."
            priceRange="$10 - $25"
            amazonTag={AMAZON_TAG}
            searchQuery="electric vehicle tax credit guide book"
            imageAlt="EV tax credit guide book on Amazon"
            slug="tax-credits"
          />
        </div>
      </div>

      <FAQSection questions={taxCreditFAQ} />
      <RelatedCalculators currentPath="/tax-credits" />
    </CalculatorLayout>
  );
}
