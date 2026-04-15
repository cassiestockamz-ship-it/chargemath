import { ReactNode } from "react";

interface CalculatorLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  lastUpdated?: string;
  intro?: string;
  answerBlock?: ReactNode;
  eyebrow?: string;
}

/**
 * Tool-first calculator layout. The compact header reserves at most
 * ~160px above the fold so the calculator body sits inside the first
 * 500px of the mobile viewport. The "Quick answer" block now renders
 * at the BOTTOM of the calculator body as a methodology footer, not
 * as a paragraph wedged between the H1 and the first input.
 *
 * Existing ~40 calculator pages pass the same props and inherit the
 * fix automatically. Anchor pages that want the full SavingsVerdict
 * treatment should use CalculatorShell instead.
 */
export default function CalculatorLayout({
  title,
  description,
  children,
  lastUpdated,
  intro,
  answerBlock,
  eyebrow,
}: CalculatorLayoutProps) {
  const effectiveAnswer = answerBlock ?? (intro ? <p>{intro}</p> : null);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8 lg:px-8">
      {/* Compact header — left-aligned, tight. No centered hero text. */}
      <header className="mb-4 flex flex-col gap-1">
        {eyebrow && <span className="cm-eyebrow">{eyebrow}</span>}
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-[var(--color-ink)] sm:text-[32px]">
          {title}
        </h1>
        <p
          className="mt-1 max-w-prose text-sm text-[var(--color-ink-3)]"
          data-speakable="true"
        >
          {description}
        </p>
      </header>

      {/* Calculator body — THE tool, above the fold. */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm sm:p-7">
        {children}
      </div>

      {/* Methodology / quick-answer block — now BELOW the widget. */}
      {effectiveAnswer && (
        <aside
          className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5 sm:p-6"
          aria-label="Methodology"
        >
          <div className="mb-2 cm-eyebrow" style={{ color: "var(--color-brand)" }}>
            How this number is calculated
          </div>
          <div className="prose prose-sm max-w-none text-[var(--color-ink-2)] [&>p]:my-0 [&_a]:text-[var(--color-brand)] [&_a]:underline">
            {effectiveAnswer}
          </div>
          {lastUpdated && (
            <p className="mt-3 cm-mono" style={{ color: "var(--color-ink-4)" }}>
              Data last updated: {lastUpdated}
            </p>
          )}
        </aside>
      )}
    </div>
  );
}
