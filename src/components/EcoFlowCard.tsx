import type { ReactNode } from "react";

/* ── CJ Affiliate Tracking ── */
const CJ_BASE = "https://www.tkqlhce.com/click-101714807-15735883";
const CJ_PIXEL = "https://www.lduhtrp.net/image-101714807-15735883";

/** Build a CJ deep link to a specific EcoFlow product page */
function buildCjLink(productPath: string, sid: string) {
  const dest = encodeURIComponent(`https://us.ecoflow.com${productPath}`);
  return `${CJ_BASE}?url=${dest}&sid=${sid}`;
}

/* ── Product icons (inline SVG, zero external requests) ── */
const ICONS: Record<string, { bg: string; svg: ReactNode }> = {
  battery: {
    bg: "from-emerald-50 to-green-100",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
        <rect x="18" y="14" width="28" height="40" rx="4" stroke="#10b981" strokeWidth="2.5" fill="#d1fae5" />
        <rect x="26" y="8" width="12" height="6" rx="2" fill="#10b981" />
        <rect x="24" y="24" width="16" height="4" rx="1" fill="#10b981" />
        <rect x="24" y="32" width="16" height="4" rx="1" fill="#10b981" />
        <rect x="24" y="40" width="10" height="4" rx="1" fill="#10b981" opacity="0.5" />
      </svg>
    ),
  },
  solar: {
    bg: "from-amber-50 to-yellow-100",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
        <rect x="10" y="20" width="44" height="28" rx="3" stroke="#f59e0b" strokeWidth="2.5" fill="#fef3c7" />
        <line x1="10" y1="30" x2="54" y2="30" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="10" y1="38" x2="54" y2="38" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="25" y1="20" x2="25" y2="48" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="39" y1="20" x2="39" y2="48" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="32" cy="10" r="3" fill="#f59e0b" />
        <path d="M32 13V17" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M24 10L21 7" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M40 10L43 7" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  charger: {
    bg: "from-sky-50 to-blue-100",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
        <rect x="14" y="12" width="24" height="40" rx="4" stroke="#0ea5e9" strokeWidth="2.5" fill="#e0f2fe" />
        <path d="M24 24L28 30H22L26 36" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M38 28H46V38H38" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M46 32H52" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="52" cy="32" r="3" fill="#0ea5e9" />
      </svg>
    ),
  },
};

function getIcon(type: string) {
  return ICONS[type] ?? ICONS.battery;
}

/* ── Types ── */
export interface EcoFlowProduct {
  title: string;
  description: string;
  priceRange: string;
  /** Path on us.ecoflow.com, e.g. "/products/delta-pro-ultra-portable-power-station" */
  productPath: string;
  /** Icon key: "battery" | "solar" | "charger" */
  icon: "battery" | "solar" | "charger";
}

interface EcoFlowCardProps {
  product: EcoFlowProduct;
  /** Page slug for SID tracking, e.g. "solar-battery-ev" */
  sid: string;
}

export default function EcoFlowCard({ product, sid }: EcoFlowCardProps) {
  const href = buildCjLink(product.productPath, sid);
  const productIcon = getIcon(product.icon);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="group block overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all hover:border-[var(--color-primary)]/30 hover:shadow-md"
      aria-label={`${product.title} on EcoFlow`}
      data-affiliate-card
    >
      {/* Product Image Area */}
      <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${productIcon.bg}`}>
        <div className="h-20 w-20 transition-transform duration-300 group-hover:scale-110">
          {productIcon.svg}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Recommended for you
          </span>
          <span className="rounded-full bg-[var(--color-surface-alt)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
            Ad
          </span>
        </div>
        <h3 className="text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
          {product.title}
        </h3>
        <p className="mt-1 text-sm leading-snug text-[var(--color-text-muted)]">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--color-text)]">
            {product.priceRange}
          </span>
          <span className="text-sm font-medium text-[var(--color-primary)] group-hover:underline">
            View on EcoFlow &rarr;
          </span>
        </div>
      </div>

      {/* CJ impression pixel — 1x1 transparent, no layout impact */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CJ_PIXEL}
        width={1}
        height={1}
        alt=""
        aria-hidden="true"
        className="absolute"
        loading="lazy"
      />
    </a>
  );
}

/* ── Pre-defined product catalog ── */
export const ECOFLOW_PRODUCTS = {
  deltaProUltraX: {
    title: "EcoFlow DELTA Pro Ultra X",
    description: "12-36 kW whole-home backup. 12-180 kWh expandable. Pairs with Smart Home Panel for seamless grid switching.",
    priceRange: "$6,499 - $10,597",
    productPath: "/products/delta-pro-ultra-x-portable-power-station",
    icon: "battery" as const,
  },
  deltaProUltra: {
    title: "EcoFlow DELTA Pro Ultra",
    description: "6-90 kWh modular home battery. 7.2-21.6 kW output. Works with Smart Home Panel 2 for whole-home backup.",
    priceRange: "$4,319 - $7,997",
    productPath: "/products/delta-pro-ultra-portable-power-station",
    icon: "battery" as const,
  },
  deltaPro3: {
    title: "EcoFlow DELTA Pro 3",
    description: "4 kWh portable power station, expandable to 48 kWh. 4-12 kW output. Solar charging compatible.",
    priceRange: "$1,999 - $3,699",
    productPath: "/products/delta-pro-3-portable-power-station",
    icon: "battery" as const,
  },
  solarPanel400W: {
    title: "EcoFlow 400W Portable Solar Panel",
    description: "High-efficiency monocrystalline panel. Foldable, waterproof design. Charges DELTA series in hours.",
    priceRange: "$599 - $1,199",
    productPath: "/products/400w-portable-solar-panel",
    icon: "solar" as const,
  },
  solarPanel220WBifacial: {
    title: "EcoFlow 220W Bifacial Solar Panel (2-Pack)",
    description: "Dual-sided panels capture reflected light for up to 25% more output. Portable and self-standing.",
    priceRange: "$499 - $1,298",
    productPath: "/products/220w-bifacial-portable-solar-panel",
    icon: "solar" as const,
  },
  powerPulseEvCharger: {
    title: "EcoFlow PowerPulse EV Charger",
    description: "9.6 kW Level 2 charger. 40A, adds ~35 mi/hr. NEMA 14-50 plug-and-play. Includes NACS adapter for Tesla.",
    priceRange: "$695 - $899",
    productPath: "/products/powerpulse-level-2-ev-charger",
    icon: "charger" as const,
  },
} satisfies Record<string, EcoFlowProduct>;
