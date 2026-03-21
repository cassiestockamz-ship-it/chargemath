import { ReactNode } from "react";

interface CalculatorLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  lastUpdated?: string;
}

export default function CalculatorLayout({
  title,
  description,
  children,
  lastUpdated,
}: CalculatorLayoutProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-8 text-center">
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

      {/* Calculator content */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
