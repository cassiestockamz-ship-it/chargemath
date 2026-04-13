import { ReactNode } from "react";

interface CalculatorLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  lastUpdated?: string;
  intro?: string;
  answerBlock?: ReactNode;
}

export default function CalculatorLayout({
  title,
  description,
  children,
  lastUpdated,
  intro,
  answerBlock,
}: CalculatorLayoutProps) {
  // Auto-upgrade intro text into AIO-optimized answer block if no
  // custom answerBlock was passed. This gives every existing calculator
  // a plain-English answer above the widget without per-page edits.
  const effectiveAnswer = answerBlock ?? (intro ? <p>{intro}</p> : null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--color-text-muted)]">
          {description}
        </p>
        {lastUpdated && (
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Data last updated: {lastUpdated}
          </p>
        )}
      </div>

      {/* Answer block above the widget — AIO citation target */}
      {effectiveAnswer && (
        <div
          className="mb-6 rounded-2xl border-l-4 border-[var(--color-primary)] bg-[var(--color-surface-alt)] p-5 sm:p-6"
          data-speakable="true"
        >
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            Quick answer
          </div>
          <div className="prose prose-sm max-w-none text-[var(--color-text)] [&>p]:my-0">
            {effectiveAnswer}
          </div>
        </div>
      )}

      {/* Calculator content */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
