"use client";

import { ReactNode } from "react";
import CountUp from "./CountUp";
import PayoffDial from "./PayoffDial";

interface Props {
  /** Eyebrow over the headline, default "Savings verdict" */
  eyebrow?: string;
  /** Line 1 headline, e.g. "YOU SAVE" or "YOU PAY" */
  headline: string;
  /** The big animated dollar figure */
  amount: number;
  /** What the amount means, e.g. "/year", "/month", " over 5 years" */
  amountUnit?: string;
  /** Short sub-line explainer, ideally one line */
  sub?: ReactNode;
  /** 0-100 dial percentage, e.g. "share of fuel cost eliminated" */
  dialPercent?: number;
  /** Label under the dial */
  dialLabel?: string;
  /** Children slot for a compact 2x2 tile grid under the headline */
  children?: ReactNode;
  /** Mark the big number for View Transitions morph (default true) */
  morphHero?: boolean;
}

/**
 * The one-screen hero. Sits directly under the compact input strip
 * on every anchor calculator. Giant count-up number, optional dial,
 * optional tile grid slot. Mirrors recallscanner's SafetyVerdict.
 */
export default function SavingsVerdict({
  eyebrow = "Savings verdict",
  headline,
  amount,
  amountUnit = "/year",
  sub,
  dialPercent,
  dialLabel = "SAVINGS",
  children,
  morphHero = true,
}: Props) {
  return (
    <section
      className="rail-volt relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-5 sm:p-8"
      aria-labelledby="cm-verdict-headline"
    >
      {/* Soft volt gradient wash behind the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "linear-gradient(180deg, var(--color-volt-soft), transparent)",
        }}
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
        {/* Left: headline + amount */}
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            <span
              className="animate-pulse-once grid h-9 w-9 place-items-center rounded-lg shadow-sm"
              style={{ background: "var(--color-volt)", color: "var(--color-volt-ink)" }}
              aria-hidden
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></svg>
            </span>
            <span className="cm-eyebrow">{eyebrow}</span>
          </div>

          <h1
            id="cm-verdict-headline"
            className="cm-hero-number text-[var(--color-ink)]"
            data-speakable="true"
          >
            <span className="block text-[0.4em] font-bold uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
              {headline}
            </span>
            <span className={morphHero ? "vt-hero-number" : ""}>
              <CountUp
                value={amount}
                duration={950}
                prefix="$"
                decimals={amount >= 100 ? 0 : 2}
              />
            </span>
            <span className="text-[0.35em] font-medium text-[var(--color-ink-3)]">
              {amountUnit}
            </span>
          </h1>

          {sub && (
            <p className="max-w-prose text-sm text-[var(--color-ink-2)] sm:text-base">
              {sub}
            </p>
          )}
        </div>

        {/* Right: optional PayoffDial */}
        {typeof dialPercent === "number" && (
          <div className="shrink-0 self-center sm:self-start">
            <PayoffDial percent={dialPercent} label={dialLabel} />
          </div>
        )}
      </div>

      {/* Optional tile-grid slot under the hero */}
      {children && (
        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {children}
        </div>
      )}
    </section>
  );
}
