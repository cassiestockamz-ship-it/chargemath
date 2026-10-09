"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

// Lazy-load each calculator to keep initial bundle small
const calculators: Record<string, ReturnType<typeof dynamic>> = {
  "ev-charging-cost": dynamic(() => import("@/app/(site)/ev-charging-cost/page")),
  "gas-vs-electric": dynamic(() => import("@/app/(site)/gas-vs-electric/page")),
  "charging-time": dynamic(() => import("@/app/(site)/charging-time/page")),
  "charger-roi": dynamic(() => import("@/app/(site)/charger-roi/page")),
  range: dynamic(() => import("@/app/(site)/range/page")),
  "tax-credits": dynamic(() => import("@/app/(site)/tax-credits/page")),
  "bill-impact": dynamic(() => import("@/app/(site)/bill-impact/page")),
};

export default function EmbedCalculatorPage() {
  const params = useParams();
  const slug = params.calculator as string;
  const Calculator = calculators[slug];

  if (!Calculator) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8 text-center">
        <p className="text-[var(--color-text-muted)]">Calculator not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Calculator />
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-center">
        <Link
          href={`https://chargemath.com/${slug}`}
          target="_blank"
          rel="noopener"
          className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
        >
          Powered by <span className="font-semibold">ChargeMath</span>
        </Link>
      </div>
    </div>
  );
}
