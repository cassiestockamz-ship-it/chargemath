"use client";

import Link from "next/link";

const calculators = [
  { title: "EV Charging Cost Calculator", href: "/ev-charging-cost", icon: "🔌" },
  { title: "Gas vs Electric Comparison", href: "/gas-vs-electric", icon: "⚖️" },
  { title: "Charging Time Estimator", href: "/charging-time", icon: "⏱️" },
  { title: "Home Charger ROI Calculator", href: "/charger-roi", icon: "💰" },
  { title: "Range Calculator", href: "/range", icon: "🗺️" },
  { title: "EV Tax Credit Estimator", href: "/tax-credits", icon: "🏛️" },
  { title: "Electricity Bill Impact", href: "/bill-impact", icon: "📄" },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="text-6xl font-extrabold text-[var(--color-primary)]">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-text)]">
        Page Not Found
      </h1>
      <p className="mt-3 text-lg text-[var(--color-text-muted)]">
        The calculator you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[var(--color-primary-dark)]"
      >
        Back to Homepage
      </Link>

      <div className="mt-12">
        <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">
          Try one of our calculators
        </h2>
        <ul className="space-y-3 text-left">
          {calculators.map((calc) => (
            <li key={calc.href}>
              <Link
                href={calc.href}
                className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-alt)]"
              >
                <span className="text-lg">{calc.icon}</span>
                {calc.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
