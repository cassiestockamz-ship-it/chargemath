"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Calc {
  title: string;
  description: string;
  href: string;
  icon: string;
}

const ALL_CALCULATORS: Calc[] = [
  { title: "Charging Cost", description: "Monthly & annual charging estimates", href: "/ev-charging-cost", icon: "🔌" },
  { title: "Gas vs Electric", description: "Side-by-side cost & CO2 comparison", href: "/gas-vs-electric", icon: "⚖️" },
  { title: "EV vs Hybrid", description: "Three-way EV, hybrid & gas comparison", href: "/ev-vs-hybrid", icon: "🔄" },
  { title: "Total Cost of Ownership", description: "Full cost: fuel, insurance, maintenance", href: "/total-cost", icon: "📋" },
  { title: "Lease vs Buy", description: "Compare leasing vs buying an EV", href: "/lease-vs-buy", icon: "🔑" },
  { title: "Payback Period", description: "When does your EV pay for itself?", href: "/payback-period", icon: "📊" },
  { title: "Commute Cost", description: "Daily commute savings with an EV", href: "/commute-cost", icon: "🏢" },
  { title: "Used EV Value", description: "Estimate used EV value & battery health", href: "/used-ev-value", icon: "🏷️" },
  { title: "Tax Credits", description: "Federal & state EV incentives", href: "/tax-credits", icon: "🏛️" },
  { title: "Charging Time", description: "How long to charge at any level", href: "/charging-time", icon: "⏱️" },
  { title: "Charger ROI", description: "Home charger payback calculator", href: "/charger-roi", icon: "🏠" },
  { title: "Bill Impact", description: "How much your electric bill goes up", href: "/bill-impact", icon: "📄" },
  { title: "Public Charging", description: "Public vs home charging costs", href: "/public-charging", icon: "⚡" },
  { title: "TOU Optimizer", description: "Find the cheapest time to charge", href: "/tou-optimizer", icon: "🕐" },
  { title: "Range Calculator", description: "Real-world range by conditions", href: "/range", icon: "🗺️" },
  { title: "Winter Range", description: "Cold weather range impact", href: "/winter-range", icon: "❄️" },
  { title: "Towing Range", description: "Range while towing a trailer", href: "/towing-range", icon: "🚛" },
  { title: "Road Trip Planner", description: "EV road trip cost & charging stops", href: "/road-trip", icon: "🛣️" },
  { title: "Battery Degradation", description: "Estimate battery capacity over time", href: "/battery-degradation", icon: "🔋" },
  { title: "Carbon Footprint", description: "CO2 savings vs a gas car", href: "/carbon-footprint", icon: "🌱" },
  { title: "Solar + EV", description: "Solar panel offset for EV charging", href: "/solar-ev", icon: "☀️" },
  { title: "Fleet Calculator", description: "Fleet electrification ROI", href: "/fleet", icon: "🚐" },
];

export default function CalculatorSearch() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_CALCULATORS.filter(
      (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="relative mx-auto max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search calculators..."
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
      {query.trim() && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          {results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto py-2">
              {results.map((calc) => (
                <li key={calc.href}>
                  <Link
                    href={calc.href}
                    onClick={() => setQuery("")}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--color-surface-alt)]"
                  >
                    <span className="text-lg">{calc.icon}</span>
                    <div>
                      <div className="font-medium text-[var(--color-text)]">{calc.title}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{calc.description}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
              No calculators found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
