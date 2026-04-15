"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import CalculatorShell from "@/components/CalculatorShell";
import SavingsVerdict from "@/components/SavingsVerdict";
import SavingsTile from "@/components/SavingsTile";
import SavingsMeter from "@/components/SavingsMeter";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import EducationalContent from "@/components/EducationalContent";
import EmailCapture from "@/components/EmailCapture";
import { useUrlSync } from "@/lib/useUrlState";

const leaseVsBuyFAQ = [
  {
    question: "Is it better to lease or buy an electric vehicle?",
    answer:
      "It depends on your driving habits and financial goals. Buying is usually cheaper long-term because you build equity and eventually own the car outright. Leasing works well if you prefer lower monthly payments, want a new EV every 2-3 years to get the latest battery tech, or drive under 12,000 miles per year. Run the numbers for your specific situation using the calculator above.",
  },
  {
    question: "Can you claim the EV tax credit when leasing?",
    answer:
      "When you lease, the leasing company (not you) technically claims the federal EV tax credit because they own the vehicle. However, many lessors pass the savings on to you as a reduced capitalized cost or lower monthly payment. Check your lease terms carefully to see if the $7,500 credit is reflected in your deal.",
  },
  {
    question: "What happens if I go over the mileage limit on an EV lease?",
    answer:
      "You will pay an excess mileage fee for every mile over your limit, typically $0.15 to $0.30 per mile. On a 36-month lease with a 12,000-mile annual limit, going 5,000 miles over would cost $1,250 to $1,500 at turn-in. If you expect to drive more, negotiate a higher mileage limit upfront since it costs less per mile than the overage penalty.",
  },
  {
    question: "How does EV battery depreciation affect lease vs buy decisions?",
    answer:
      "EVs depreciate faster than gas cars in the first few years, partly due to rapid battery technology improvements. This makes leasing attractive because you avoid the depreciation risk. If you buy, you take on the risk that newer EVs with longer range and faster charging could reduce your car's resale value. However, if you plan to keep the car for 8+ years, the depreciation curve flattens and buying becomes clearly cheaper.",
  },
  {
    question: "What residual value should I expect for a leased EV?",
    answer:
      "EV residual values on leases typically range from 45% to 60% of MSRP after 36 months, depending on the brand and model. Tesla tends to hold value better (55-65%), while some other brands may be lower (40-50%). A higher residual value means lower monthly lease payments because you are financing a smaller portion of the vehicle's depreciation.",
  },
];

export default function LeaseVsBuyPage() {
  const [msrp, setMsrp] = useState(40000);
  const [buyDownPayment, setBuyDownPayment] = useState(5000);
  const [loanTermYears, setLoanTermYears] = useState(5);
  const [loanApr, setLoanApr] = useState(5.5);
  const [leaseTermMonths, setLeaseTermMonths] = useState(36);
  const [leaseMonthlyPayment, setLeaseMonthlyPayment] = useState(450);
  const [leaseDownPayment, setLeaseDownPayment] = useState(2000);
  const [residualPct, setResidualPct] = useState(55);
  const [annualMilesLimit, setAnnualMilesLimit] = useState(12000);
  const [excessMileFee, setExcessMileFee] = useState(0.25);
  const [actualAnnualMiles, setActualAnnualMiles] = useState(12000);

  useUrlSync(
    {
      msrp,
      buyDown: buyDownPayment,
      loanYrs: loanTermYears,
      apr: loanApr,
      leaseMo: leaseTermMonths,
      leasePmt: leaseMonthlyPayment,
      leaseDown: leaseDownPayment,
      residual: residualPct,
      mileLimit: annualMilesLimit,
      excessFee: excessMileFee,
      miles: actualAnnualMiles,
    },
    useCallback((p: Record<string, string>) => {
      if (p.msrp) setMsrp(Number(p.msrp));
      if (p.buyDown) setBuyDownPayment(Number(p.buyDown));
      if (p.loanYrs) setLoanTermYears(Number(p.loanYrs));
      if (p.apr) setLoanApr(Number(p.apr));
      if (p.leaseMo) setLeaseTermMonths(Number(p.leaseMo));
      if (p.leasePmt) setLeaseMonthlyPayment(Number(p.leasePmt));
      if (p.leaseDown) setLeaseDownPayment(Number(p.leaseDown));
      if (p.residual) setResidualPct(Number(p.residual));
      if (p.mileLimit) setAnnualMilesLimit(Number(p.mileLimit));
      if (p.excessFee) setExcessMileFee(Number(p.excessFee));
      if (p.miles) setActualAnnualMiles(Number(p.miles));
    }, [])
  );

  const results = useMemo(() => {
    // --- Buy calculations ---
    const loanAmount = msrp - buyDownPayment;
    const monthlyRate = loanApr / 100 / 12;
    const loanTermMonths = loanTermYears * 12;

    // Standard amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    let monthlyLoanPayment: number;
    if (monthlyRate === 0) {
      monthlyLoanPayment = loanAmount / loanTermMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, loanTermMonths);
      monthlyLoanPayment = loanAmount * (monthlyRate * factor) / (factor - 1);
    }

    // Total cost to buy over the lease term period (for apples-to-apples comparison)
    const buyTotalOverLeaseTerm =
      buyDownPayment + monthlyLoanPayment * leaseTermMonths;

    // Remaining loan balance after leaseTermMonths payments
    let remainingBalance: number;
    if (monthlyRate === 0) {
      remainingBalance = loanAmount - monthlyLoanPayment * leaseTermMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, loanTermMonths);
      const factorPartial = Math.pow(1 + monthlyRate, leaseTermMonths);
      remainingBalance =
        loanAmount * (factor - factorPartial) / (factor - 1);
    }
    remainingBalance = Math.max(0, remainingBalance);

    // Vehicle value at end of lease term (using residual %)
    const vehicleValueAtLeaseEnd = msrp * (residualPct / 100);

    // Equity = vehicle value - remaining loan balance
    const equityAtLeaseEnd = vehicleValueAtLeaseEnd - remainingBalance;

    // --- Lease calculations ---
    const leaseTotalCost =
      leaseDownPayment + leaseMonthlyPayment * leaseTermMonths;

    // Excess mileage penalty
    const totalLeaseMiles = annualMilesLimit * (leaseTermMonths / 12);
    const totalActualMiles = actualAnnualMiles * (leaseTermMonths / 12);
    const excessMiles = Math.max(0, totalActualMiles - totalLeaseMiles);
    const mileagePenalty = excessMiles * excessMileFee;
    const leaseTotalWithPenalty = leaseTotalCost + mileagePenalty;

    // --- Net cost comparison ---
    // Buy net cost = total paid - equity built
    const buyNetCost = buyTotalOverLeaseTerm - equityAtLeaseEnd;
    // Lease net cost = total paid + penalties (no equity)
    const leaseNetCost = leaseTotalWithPenalty;

    const savings = Math.abs(buyNetCost - leaseNetCost);
    const winner: "buy" | "lease" | "tie" =
      buyNetCost < leaseNetCost ? "buy" : buyNetCost > leaseNetCost ? "lease" : "tie";

    // Breakeven: find the month where buying becomes cheaper than leasing
    // cumulative buy cost - equity > cumulative lease cost at each month
    let breakevenMonth: number | null = null;
    for (let m = 1; m <= leaseTermMonths; m++) {
      // Cumulative buy cost at month m
      const buyCum = buyDownPayment + monthlyLoanPayment * m;

      // Remaining balance at month m
      let balAtM: number;
      if (monthlyRate === 0) {
        balAtM = loanAmount - monthlyLoanPayment * m;
      } else {
        const factor = Math.pow(1 + monthlyRate, loanTermMonths);
        const factorM = Math.pow(1 + monthlyRate, m);
        balAtM = loanAmount * (factor - factorM) / (factor - 1);
      }
      balAtM = Math.max(0, balAtM);

      // Simple linear depreciation for mid-term vehicle value
      const depRate = (1 - residualPct / 100) / leaseTermMonths;
      const valueAtM = msrp * (1 - depRate * m);
      const equityAtM = valueAtM - balAtM;
      const buyNetAtM = buyCum - equityAtM;

      // Cumulative lease cost at month m (prorate mileage penalty)
      const leaseCumAtM = leaseDownPayment + leaseMonthlyPayment * m;
      const actualMilesAtM = actualAnnualMiles * (m / 12);
      const limitMilesAtM = annualMilesLimit * (m / 12);
      const excessAtM = Math.max(0, actualMilesAtM - limitMilesAtM);
      const penaltyAtM = excessAtM * excessMileFee;
      const leaseNetAtM = leaseCumAtM + penaltyAtM;

      if (buyNetAtM < leaseNetAtM && breakevenMonth === null) {
        breakevenMonth = m;
      }
    }

    return {
      monthlyLoanPayment,
      buyTotalOverLeaseTerm,
      remainingBalance,
      vehicleValueAtLeaseEnd,
      equityAtLeaseEnd,
      leaseTotalCost,
      leaseTotalWithPenalty,
      mileagePenalty,
      excessMiles,
      buyNetCost,
      leaseNetCost,
      savings,
      winner,
      breakevenMonth,
    };
  }, [
    msrp,
    buyDownPayment,
    loanTermYears,
    loanApr,
    leaseTermMonths,
    leaseMonthlyPayment,
    leaseDownPayment,
    residualPct,
    annualMilesLimit,
    excessMileFee,
    actualAnnualMiles,
  ]);

  const leaseYears = leaseTermMonths / 12;
  const headline =
    results.winner === "buy"
      ? "BUYING SAVES"
      : results.winner === "lease"
        ? "LEASING SAVES"
        : "IT IS A TIE";

  const loserNetCost = Math.max(results.buyNetCost, results.leaseNetCost);
  const dialPercent =
    loserNetCost > 0
      ? Math.max(0, Math.min(100, (results.savings / loserNetCost) * 100))
      : 0;

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <NumberInput
        label="Vehicle MSRP"
        value={msrp}
        onChange={setMsrp}
        min={15000}
        max={200000}
        step={1000}
        unit="$"
      />
      <NumberInput
        label="Lease monthly payment"
        value={leaseMonthlyPayment}
        onChange={setLeaseMonthlyPayment}
        min={100}
        max={2000}
        step={25}
        unit="$"
      />
      <SliderInput
        label="Actual annual miles"
        value={actualAnnualMiles}
        onChange={setActualAnnualMiles}
        min={5000}
        max={30000}
        step={1000}
        unit="mi"
        showValue
      />
    </div>
  );

  const hero = (
    <SavingsVerdict
      headline={headline}
      amount={results.savings}
      amountUnit={` over ${leaseYears} yr`}
      sub={
        <>
          Net cost comparison over the {leaseTermMonths}-month lease term on a {`$${msrp.toLocaleString()}`} EV.
          Buying nets {`$${Math.round(results.buyNetCost).toLocaleString()}`} after equity.
          Leasing costs {`$${Math.round(results.leaseNetCost).toLocaleString()}`} out of pocket.
        </>
      }
      dialPercent={dialPercent}
      dialLabel="COST CUT"
    >
      <SavingsTile
        label="LEASE TOTAL"
        value={results.leaseTotalWithPenalty}
        prefix="$"
        unit=" out"
        tier="warn"
        animate
      />
      <SavingsTile
        label="BUY TOTAL"
        value={results.buyTotalOverLeaseTerm}
        prefix="$"
        unit=" out"
        tier="brand"
        animate
      />
      <SavingsTile
        label="LEASE /MO"
        value={leaseMonthlyPayment}
        prefix="$"
        unit="/mo"
        tier="mid"
        animate
      />
      <SavingsTile
        label="BUY /MO"
        value={results.monthlyLoanPayment}
        prefix="$"
        unit="/mo"
        tier="volt"
        animate
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Lease vs buy"
      title="Lease vs Buy EV Calculator"
      quickAnswer="Buying usually wins if you drive 12,000+ miles a year or plan to keep the car 5+ years. Leasing wins on low-mileage 2 to 3 year cycles."
      inputs={inputs}
      hero={hero}
    >
      <CalculatorSchema
        name="Lease vs Buy EV Calculator"
        description="Compare the total cost of leasing versus buying an electric vehicle. Includes monthly payments, equity, mileage penalties, and breakeven analysis."
        url="https://chargemath.com/lease-vs-buy"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Lease vs Buy", url: "https://chargemath.com/lease-vs-buy" },
        ]}
      />

      {/* Advanced inputs (collapsed by default) */}
      <details className="group mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink-2)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Buy down payment"
            value={buyDownPayment}
            onChange={setBuyDownPayment}
            min={0}
            max={100000}
            step={500}
            unit="$"
          />
          <SliderInput
            label="Loan term"
            value={loanTermYears}
            onChange={setLoanTermYears}
            min={3}
            max={7}
            step={1}
            unit="years"
            showValue
          />
          <NumberInput
            label="Loan APR"
            value={loanApr}
            onChange={setLoanApr}
            min={0}
            max={20}
            step={0.1}
            unit="%"
          />
          <SliderInput
            label="Lease term"
            value={leaseTermMonths}
            onChange={setLeaseTermMonths}
            min={24}
            max={48}
            step={6}
            unit="months"
            showValue
          />
          <NumberInput
            label="Lease down payment"
            value={leaseDownPayment}
            onChange={setLeaseDownPayment}
            min={0}
            max={20000}
            step={500}
            unit="$"
          />
          <NumberInput
            label="Residual value"
            value={residualPct}
            onChange={setResidualPct}
            min={20}
            max={80}
            step={1}
            unit="%"
            helpText="Percentage of MSRP the vehicle is worth at lease end"
          />
          <NumberInput
            label="Annual lease mileage limit"
            value={annualMilesLimit}
            onChange={setAnnualMilesLimit}
            min={5000}
            max={25000}
            step={1000}
            unit="mi/yr"
          />
          <NumberInput
            label="Excess mile fee"
            value={excessMileFee}
            onChange={setExcessMileFee}
            min={0.05}
            max={0.5}
            step={0.05}
            unit="$/mi"
          />
        </div>
      </details>

      {/* Signature live meter: LEASE vs BUY net cost */}
      <SavingsMeter
        leftLabel="LEASE"
        leftValue={results.leaseNetCost}
        rightLabel="BUY"
        rightValue={results.buyNetCost}
        period={`/${leaseTermMonths}mo`}
      />

      {/* Contextual cross-links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/tax-credits"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Check EV tax credits
        </Link>
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Estimate charging costs
        </Link>
        <Link
          href="/gas-vs-electric"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Compare gas vs electric
        </Link>
      </div>

      <EducationalContent>
        <h2>How the Lease vs Buy Calculation Works</h2>
        <p>
          This calculator compares both options over the same time period (the lease term) so you get an apples-to-apples comparison. For buying, it calculates your monthly loan payment using the standard amortization formula, then determines how much equity you have built at the end of the lease term by subtracting the remaining loan balance from the vehicle&apos;s depreciated value. For leasing, it totals your down payment plus monthly payments plus any excess mileage fees.
        </p>
        <p>
          The &quot;net cost&quot; for buying is what you paid minus your equity (since you could sell the car). The net cost for leasing is simply everything you paid, since you return the vehicle with no equity. The winner is whichever option has the lower net cost.
        </p>
        <h3>Key Factors to Consider</h3>
        <ul>
          <li>Depreciation is the biggest factor. EVs with strong resale values (like Tesla) tend to favor buying because you retain more equity. Models with steep depreciation curves favor leasing since you avoid that loss.</li>
          <li>The federal EV tax credit ($7,500) can apply to both options, but works differently. When buying, you claim it directly. When leasing, the lessor claims it and may or may not pass the savings to you.</li>
          <li>Mileage matters significantly for leases. If you consistently drive over 12,000 miles per year, excess mileage fees add up quickly. High-mileage drivers almost always benefit from buying.</li>
          <li>Interest rates change the math. Low loan rates make buying more attractive. If rates are high, leasing effectively lets the manufacturer subsidize your cost through competitive lease rates.</li>
        </ul>
        <h3>When Leasing Makes Sense for EVs</h3>
        <p>
          EV technology is improving rapidly. Battery range, charging speed, and software features improve meaningfully every 2-3 years. Leasing lets you upgrade to the latest technology without worrying about selling a depreciating asset. It also protects you from the risk that battery degradation or technology shifts reduce your car&apos;s resale value more than expected.
        </p>
        <h3>When Buying Makes Sense for EVs</h3>
        <p>
          If you plan to keep the vehicle for 5+ years, buying is almost always cheaper. Once the loan is paid off, you drive payment-free while the car still has significant life. EV batteries are warrantied for 8 years/100,000 miles by federal mandate, and many last well beyond that. You also avoid mileage restrictions and end-of-lease wear-and-tear charges.
        </p>
      </EducationalContent>

      <FAQSection questions={leaseVsBuyFAQ} />
      <EmailCapture source="lease-vs-buy" />
      <RelatedCalculators currentPath="/lease-vs-buy" />
    </CalculatorShell>
  );
}
