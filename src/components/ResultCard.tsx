interface ResultCardProps {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
  icon?: string;
}

/**
 * Legacy result tile used by the non-anchor calculator pages. Kept
 * drop-in compatible (same props) and repainted in Voltline: brand
 * rail by default, volt rail when highlighted, display-font result
 * number, mono unit suffix. Non-anchor pages inherit the upgrade
 * without any per-page edits.
 */
export default function ResultCard({
  label,
  value,
  unit,
  highlight = false,
  icon,
}: ResultCardProps) {
  const rail = highlight ? "rail-volt" : "rail-brand";
  const numberColor = highlight ? "var(--color-ink)" : "var(--color-ink)";
  return (
    <article
      className={`${rail} relative flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-white p-5`}
      aria-live="polite"
      role="status"
    >
      <div className="flex items-center gap-1.5 cm-eyebrow">
        {icon && (
          <span className="text-base not-italic" aria-hidden>
            {icon}
          </span>
        )}
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="cm-result-number"
          style={{ color: numberColor }}
        >
          {value}
        </span>
        {unit && <span className="cm-mono">{unit}</span>}
      </div>
    </article>
  );
}
