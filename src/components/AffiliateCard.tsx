interface AffiliateCardProps {
  title: string;
  description: string;
  priceRange: string;
  amazonTag: string;
  searchQuery: string;
  imageAlt: string;
}

export default function AffiliateCard({
  title,
  description,
  priceRange,
  amazonTag,
  searchQuery,
  imageAlt,
}: AffiliateCardProps) {
  const href = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=${amazonTag}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:border-[var(--color-primary)]/30 hover:shadow-md"
      aria-label={imageAlt}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Recommended for you
        </span>
        <span className="rounded-full bg-[var(--color-surface-alt)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
          Ad
        </span>
      </div>
      <h3 className="text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        {description}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-text)]">
          {priceRange}
        </span>
        <span className="text-sm font-medium text-[var(--color-primary)] group-hover:underline">
          View on Amazon &rarr;
        </span>
      </div>
    </a>
  );
}
