"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const categories = [
  {
    label: "Cost & Savings",
    items: [
      { title: "Charging Cost", href: "/ev-charging-cost" },
      { title: "Gas vs Electric", href: "/gas-vs-electric" },
      { title: "EV vs Hybrid", href: "/ev-vs-hybrid" },
      { title: "Total Cost of Ownership", href: "/total-cost" },
      { title: "Lease vs Buy", href: "/lease-vs-buy" },
      { title: "Payback Period", href: "/payback-period" },
      { title: "Commute Cost", href: "/commute-cost" },
      { title: "Used EV Value", href: "/used-ev-value" },
      { title: "Tax Credits", href: "/tax-credits" },
    ],
  },
  {
    label: "Charging",
    items: [
      { title: "Charging Time", href: "/charging-time" },
      { title: "Charger ROI", href: "/charger-roi" },
      { title: "Bill Impact", href: "/bill-impact" },
      { title: "Public Charging", href: "/public-charging" },
      { title: "TOU Optimizer", href: "/tou-optimizer" },
    ],
  },
  {
    label: "Range & Trips",
    items: [
      { title: "Range Calculator", href: "/range" },
      { title: "Winter Range", href: "/winter-range" },
      { title: "Towing Range", href: "/towing-range" },
      { title: "Road Trip Planner", href: "/road-trip" },
    ],
  },
  {
    label: "Solar & Energy",
    items: [
      { title: "Solar + EV", href: "/solar-ev" },
      { title: "Solar Panel Sizing", href: "/solar-ev-sizing" },
      { title: "Solar Payback", href: "/solar-payback" },
      { title: "Solar + Battery", href: "/solar-battery-ev" },
      { title: "Solar vs Grid Cost", href: "/solar-vs-grid-ev" },
      { title: "Battery Degradation", href: "/battery-degradation" },
      { title: "Carbon Footprint", href: "/carbon-footprint" },
      { title: "Fleet Calculator", href: "/fleet" },
    ],
  },
];

export default function NavDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]"
      >
        Calculators
        <svg className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl"
          style={{ width: "min(680px, 90vw)" }}
        >
          <div className="grid grid-cols-4 gap-5">
            {categories.map((cat) => (
              <div key={cat.label}>
                <div className="mb-2.5 flex h-7 items-end border-b-2 border-[var(--color-primary)]/20 pb-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                    {cat.label}
                  </h3>
                </div>
                <ul className="space-y-1">
                  {cat.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block rounded px-2 py-1 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-primary)]"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-[var(--color-border)] pt-3 text-center">
            <Link
              href="/calculators"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              View all 26 calculators &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
