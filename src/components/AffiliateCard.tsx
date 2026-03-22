import type { ReactNode } from "react";

interface AffiliateCardProps {
  title: string;
  description: string;
  priceRange: string;
  amazonTag: string;
  searchQuery: string;
  imageAlt: string;
  icon?: string;
  slug?: string;
}

// Product category icons — simple inline SVGs that load instantly
const PRODUCT_ICONS: Record<string, { bg: string; svg: ReactNode }> = {
  charger: {
    bg: "from-sky-50 to-blue-100",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
        <rect x="20" y="10" width="24" height="44" rx="4" stroke="#0ea5e9" strokeWidth="2.5" fill="#e0f2fe" />
        <rect x="26" y="18" width="12" height="6" rx="1.5" fill="#0ea5e9" />
        <rect x="26" y="28" width="12" height="6" rx="1.5" fill="#0ea5e9" />
        <path d="M32 40V54" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="57" r="3" fill="#0ea5e9" />
        <path d="M29 6L32 10L35 6" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  cable: {
    bg: "from-emerald-50 to-green-100",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
        <path d="M16 32C16 20 24 14 32 14C40 14 48 20 48 32C48 44 40 50 32 50C24 50 16 44 16 32Z" stroke="#10b981" strokeWidth="2.5" fill="#d1fae5" />
        <path d="M28 24V40" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <path d="M36 24V40" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 50V58" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  gauge: {
    bg: "from-amber-50 to-yellow-100",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
        <circle cx="32" cy="34" r="20" stroke="#f59e0b" strokeWidth="2.5" fill="#fef3c7" />
        <path d="M32 34L24 22" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M20 40A16 16 0 0 1 18 34" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <path d="M18 34A16 16 0 0 1 32 18" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 18A16 16 0 0 1 46 34" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="34" r="3" fill="#f59e0b" />
      </svg>
    ),
  },
  monitor: {
    bg: "from-violet-50 to-purple-100",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
        <rect x="12" y="12" width="40" height="28" rx="4" stroke="#8b5cf6" strokeWidth="2.5" fill="#ede9fe" />
        <path d="M20 24H44" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 30H36" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 36H28" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 40V48" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 48H40" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  winter: {
    bg: "from-cyan-50 to-sky-100",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
        <path d="M32 8V56" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M8 32H56" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M15 15L49 49" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
        <path d="M49 15L15 49" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="32" r="6" fill="#bae6fd" stroke="#0ea5e9" strokeWidth="2" />
        <circle cx="32" cy="14" r="2.5" fill="#0ea5e9" />
        <circle cx="32" cy="50" r="2.5" fill="#0ea5e9" />
        <circle cx="14" cy="32" r="2.5" fill="#0ea5e9" />
        <circle cx="50" cy="32" r="2.5" fill="#0ea5e9" />
      </svg>
    ),
  },
  towing: {
    bg: "from-orange-50 to-amber-100",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
        <rect x="6" y="24" width="32" height="18" rx="3" stroke="#f59e0b" strokeWidth="2.5" fill="#fef3c7" />
        <rect x="38" y="30" width="16" height="12" rx="2" stroke="#f59e0b" strokeWidth="2.5" fill="#fef3c7" />
        <circle cx="16" cy="46" r="5" stroke="#f59e0b" strokeWidth="2.5" fill="#fff" />
        <circle cx="48" cy="46" r="5" stroke="#f59e0b" strokeWidth="2.5" fill="#fff" />
        <circle cx="16" cy="46" r="2" fill="#f59e0b" />
        <circle cx="48" cy="46" r="2" fill="#f59e0b" />
      </svg>
    ),
  },
  book: {
    bg: "from-rose-50 to-pink-100",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
        <path d="M12 12H48C50 12 52 14 52 16V52C52 54 50 56 48 56H16C14 56 12 54 12 52V12Z" stroke="#ec4899" strokeWidth="2.5" fill="#fce7f3" />
        <path d="M20 12V56" stroke="#ec4899" strokeWidth="2" />
        <path d="M28 24H44" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
        <path d="M28 30H40" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
        <path d="M28 36H36" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  bag: {
    bg: "from-teal-50 to-emerald-100",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
        <path d="M14 20H50L46 54H18L14 20Z" stroke="#14b8a6" strokeWidth="2.5" fill="#ccfbf1" />
        <path d="M24 20V16C24 12 28 8 32 8C36 8 40 12 40 16V20" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 30H42" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 38H40" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
};

function getIconForProduct(searchQuery: string): { bg: string; svg: ReactNode } {
  const q = searchQuery.toLowerCase();
  if (q.includes("charger") || q.includes("charging")) return PRODUCT_ICONS.charger;
  if (q.includes("cable") || q.includes("organizer")) return PRODUCT_ICONS.cable;
  if (q.includes("gauge") || q.includes("pressure")) return PRODUCT_ICONS.gauge;
  if (q.includes("monitor") || q.includes("energy")) return PRODUCT_ICONS.monitor;
  if (q.includes("winter") || q.includes("cold")) return PRODUCT_ICONS.winter;
  if (q.includes("tow") || q.includes("hitch")) return PRODUCT_ICONS.towing;
  if (q.includes("book") || q.includes("guide")) return PRODUCT_ICONS.book;
  if (q.includes("bag")) return PRODUCT_ICONS.bag;
  return PRODUCT_ICONS.charger;
}

export default function AffiliateCard({
  title,
  description,
  priceRange,
  amazonTag,
  searchQuery,
  imageAlt,
  slug,
}: AffiliateCardProps) {
  const href = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=${amazonTag}${slug ? `&ascsubtag=${slug}` : ''}`;
  const productIcon = getIconForProduct(searchQuery);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="group block overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all hover:border-[var(--color-primary)]/30 hover:shadow-md"
      aria-label={imageAlt}
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
          {title}
        </h3>
        <p className="mt-1 text-sm leading-snug text-[var(--color-text-muted)]">
          {description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--color-text)]">
            {priceRange}
          </span>
          <span className="text-sm font-medium text-[var(--color-primary)] group-hover:underline">
            View on Amazon &rarr;
          </span>
        </div>
      </div>
    </a>
  );
}
