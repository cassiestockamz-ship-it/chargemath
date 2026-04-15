"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ELECTRICITY_RATES } from "@/data/electricity-rates";

const slugFor = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Fast "jump to my state guide" dropdown. Lives next to the primary
 * "View all 51 state guides" CTA so a user on the homepage who knows
 * their state can land directly on their guide in one click.
 */
export default function StateJump() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const options = Object.entries(ELECTRICITY_RATES)
    .sort((a, b) => a[1].state.localeCompare(b[1].state))
    .map(([c, d]) => ({ code: c, state: d.state }));

  function onChange(next: string) {
    setCode(next);
    if (!next) return;
    const entry = ELECTRICITY_RATES[next];
    if (!entry) return;
    router.push(`/guides/${slugFor(entry.state)}`);
  }

  return (
    <label className="mx-auto mt-4 flex max-w-xs items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-left shadow-sm">
      <span className="cm-eyebrow whitespace-nowrap">Jump to</span>
      <select
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm font-semibold text-[var(--color-ink)] focus:outline-none"
        aria-label="Jump to your state guide"
      >
        <option value="">Your state...</option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.state}
          </option>
        ))}
      </select>
    </label>
  );
}
