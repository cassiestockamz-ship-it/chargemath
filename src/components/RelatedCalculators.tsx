import Link from "next/link";

interface Calc {
  title: string;
  description: string;
  href: string;
  icon: string;
  category: string;
}

const ALL_CALCULATORS: Calc[] = [
  // Cost & Savings
  { title: "Charging Cost", description: "Monthly & annual charging estimates", href: "/ev-charging-cost", icon: "🔌", category: "cost" },
  { title: "Gas vs Electric", description: "Side-by-side cost & CO2 comparison", href: "/gas-vs-electric", icon: "⚖️", category: "cost" },
  { title: "EV vs Hybrid", description: "Three-way EV, hybrid & gas comparison", href: "/ev-vs-hybrid", icon: "🔄", category: "cost" },
  { title: "Total Cost of Ownership", description: "Full cost: fuel, insurance, maintenance", href: "/total-cost", icon: "📋", category: "cost" },
  { title: "Lease vs Buy", description: "Compare leasing vs buying an EV", href: "/lease-vs-buy", icon: "🔑", category: "cost" },
  { title: "Payback Period", description: "When does your EV pay for itself?", href: "/payback-period", icon: "📊", category: "cost" },
  { title: "Commute Cost", description: "Daily commute savings with an EV", href: "/commute-cost", icon: "🏢", category: "cost" },
  { title: "Used EV Value", description: "Estimate used EV value & battery health", href: "/used-ev-value", icon: "🏷️", category: "cost" },
  { title: "Tax Credits", description: "Federal & state EV incentives", href: "/tax-credits", icon: "🏛️", category: "cost" },
  // Charging
  { title: "Charging Time", description: "How long to charge at any level", href: "/charging-time", icon: "⏱️", category: "charging" },
  { title: "Charger ROI", description: "Home charger payback calculator", href: "/charger-roi", icon: "🏠", category: "charging" },
  { title: "Bill Impact", description: "How much your electric bill goes up", href: "/bill-impact", icon: "📄", category: "charging" },
  { title: "Public Charging", description: "Public vs home charging costs", href: "/public-charging", icon: "⚡", category: "charging" },
  { title: "TOU Optimizer", description: "Find the cheapest time to charge", href: "/tou-optimizer", icon: "🕐", category: "charging" },
  // Range & Trips
  { title: "Range Calculator", description: "Real-world range by conditions", href: "/range", icon: "🗺️", category: "range" },
  { title: "Winter Range", description: "Cold weather range impact", href: "/winter-range", icon: "❄️", category: "range" },
  { title: "Towing Range", description: "Range while towing a trailer", href: "/towing-range", icon: "🚛", category: "range" },
  { title: "Road Trip Planner", description: "EV road trip cost & charging stops", href: "/road-trip", icon: "🛣️", category: "range" },
  // Battery & Energy
  { title: "Battery Degradation", description: "Estimate battery capacity over time", href: "/battery-degradation", icon: "🔋", category: "battery" },
  { title: "Carbon Footprint", description: "CO2 savings vs a gas car", href: "/carbon-footprint", icon: "🌱", category: "battery" },
  { title: "Solar + EV", description: "Solar panel offset for EV charging", href: "/solar-ev", icon: "☀️", category: "battery" },
  { title: "Solar Panel Sizing", description: "How many panels to charge your EV", href: "/solar-ev-sizing", icon: "🔢", category: "battery" },
  { title: "Fleet Calculator", description: "Fleet electrification ROI", href: "/fleet", icon: "🚐", category: "battery" },
];

export default function RelatedCalculators({
  currentPath,
}: {
  currentPath: string;
}) {
  const current = ALL_CALCULATORS.find((c) => c.href === currentPath);
  const currentCategory = current?.category || "cost";
  const others = ALL_CALCULATORS.filter((c) => c.href !== currentPath);
  const sameCategory = others.filter((c) => c.category === currentCategory);
  const diffCategory = others.filter((c) => c.category !== currentCategory);
  const related = [...sameCategory, ...diffCategory].slice(0, 6);

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
      <div className="mt-6 text-center">
        <Link href="/calculators" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
          View all {ALL_CALCULATORS.length} calculators &rarr;
        </Link>
      </div>
    </div>
  );
}
