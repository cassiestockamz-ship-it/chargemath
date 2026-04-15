import { ReactNode } from "react";

interface Props {
  /** Short eyebrow over the title, e.g. "EV cost" */
  eyebrow?: string;
  /** Tight H1. Left-aligned, single line on mobile when possible */
  title: string;
  /** One-line quick answer. Gets data-speakable="true". */
  quickAnswer?: ReactNode;
  /** The compact above-the-fold input strip (3 inputs max) */
  inputs: ReactNode;
  /** The one-screen hero result (pass a SavingsVerdict, SavingsMeter, or SavingsTile variant="hero") */
  hero: ReactNode;
  /** Everything below the fold */
  children?: ReactNode;
}

/**
 * The tool-first template. Every anchor calculator uses this. Above
 * the fold on mobile 390w within 500px: eyebrow, tight H1, quick
 * answer, compact inputs, hero result. Everything else goes below in
 * the children slot.
 */
export default function CalculatorShell({
  eyebrow,
  title,
  quickAnswer,
  inputs,
  hero,
  children,
}: Props) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8">
      {/* Above the fold */}
      <header className="mb-4 flex flex-col gap-1">
        {eyebrow && <span className="cm-eyebrow">{eyebrow}</span>}
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-[var(--color-ink)] sm:text-3xl">
          {title}
        </h1>
        {quickAnswer && (
          <p
            className="mt-1 max-w-prose text-sm text-[var(--color-ink-3)]"
            data-speakable="true"
          >
            {quickAnswer}
          </p>
        )}
      </header>

      {/* Compact input strip — 3 primary inputs, rest in an Advanced accordion */}
      <div className="mb-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5">
        {inputs}
      </div>

      {/* Hero result */}
      <div className="mb-6">{hero}</div>

      {/* Below the fold */}
      {children}
    </div>
  );
}
