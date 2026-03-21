import Link from "next/link";

const ALL_CALCULATORS = [
  {
    title: "Charging Cost",
    description: "Monthly & annual charging estimates",
    href: "/ev-charging-cost",
    icon: "🔌",
  },
  {
    title: "Gas vs Electric",
    description: "Side-by-side cost & CO2 comparison",
    href: "/gas-vs-electric",
    icon: "⚖️",
  },
  {
    title: "Charging Time",
    description: "How long to charge at any level",
    href: "/charging-time",
    icon: "⏱️",
  },
  {
    title: "Charger ROI",
    description: "Home charger payback calculator",
    href: "/charger-roi",
    icon: "💰",
  },
];

export default function RelatedCalculators({
  currentPath,
}: {
  currentPath: string;
}) {
  const related = ALL_CALCULATORS.filter((c) => c.href !== currentPath);

  return (
    <div className="mt-12 border-t border-[var(--color-border)] pt-10">
      <h2 className="mb-5 text-center text-xl font-bold text-[var(--color-text)]">
        Try Our Other Calculators
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {related.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center transition-all hover:border-[var(--color-primary)]/30 hover:shadow-md"
          >
            <span className="mb-2 block text-2xl">{calc.icon}</span>
            <h3 className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
              {calc.title}
            </h3>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {calc.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
