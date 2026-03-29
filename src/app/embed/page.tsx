"use client";

import { useState } from "react";
import type { Metadata } from "next";

const CALCULATORS = [
  { slug: "ev-charging-cost", title: "EV Charging Cost Calculator", icon: "🔌" },
  { slug: "gas-vs-electric", title: "Gas vs Electric Comparison", icon: "⚖️" },
  { slug: "charging-time", title: "Charging Time Estimator", icon: "⏱️" },
  { slug: "charger-roi", title: "Home Charger ROI Calculator", icon: "💰" },
  { slug: "range", title: "Range Calculator", icon: "🗺️" },
  { slug: "tax-credits", title: "Tax Credit Estimator", icon: "🏛️" },
  { slug: "bill-impact", title: "Bill Impact Calculator", icon: "📄" },
];

function EmbedCodeBlock({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const code = `<iframe src="https://chargemath.com/embed/${slug}" width="100%" height="800" style="border:none;border-radius:12px;" title="${title}" loading="lazy"></iframe>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h3 className="mb-2 text-base font-semibold text-[var(--color-text)]">
        {title}
      </h3>
      <div className="relative">
        <pre className="overflow-x-auto rounded-lg bg-[var(--color-surface-alt)] p-3 text-xs text-[var(--color-text-muted)]">
          <code>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 rounded-md bg-[var(--color-surface)] px-2 py-1 text-xs font-medium text-[var(--color-primary)] shadow-sm transition-colors hover:bg-[var(--color-primary)]/10"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <a
        href={`/embed/${slug}`}
        target="_blank"
        rel="noopener"
        className="mt-2 inline-block text-xs text-[var(--color-primary)] hover:underline"
      >
        Preview embed →
      </a>
    </div>
  );
}

export default function EmbedShowcasePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-4xl">
          Embed ChargeMath Calculators
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--color-text-muted)]">
          Add free EV calculators to your website. Each embed includes real EPA
          vehicle data and state electricity rates. Just copy the code and paste
          it into your site.
        </p>
      </div>

      <div className="space-y-5">
        {CALCULATORS.map((calc) => (
          <EmbedCodeBlock key={calc.slug} slug={calc.slug} title={calc.title} />
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-6">
        <h2 className="mb-3 text-lg font-bold text-[var(--color-text)]">
          Embed Guidelines
        </h2>
        <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
          <li>
            Embeds are free for any website — commercial, educational, or personal.
          </li>
          <li>
            The &quot;Powered by ChargeMath&quot; attribution must remain visible. This is our
            only requirement.
          </li>
          <li>
            Adjust the <code className="rounded bg-[var(--color-surface)] px-1 text-xs">height</code> attribute
            if the calculator is clipped on your page (800px works for most).
          </li>
          <li>
            Questions? Contact us at the email on our{" "}
            <a
              href="/about"
              className="text-[var(--color-primary)] hover:underline"
            >
              About page
            </a>
            .
          </li>
        </ul>
      </div>
    </div>
  );
}
