"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Global calculator finder. Triggered by Cmd-K / Ctrl-K anywhere on
 * the site, or by clicking the header search button. Fuzzy-searches
 * every calculator + guide by title, category, and keyword. Arrow
 * keys navigate, Enter selects, Escape closes.
 */

interface Item {
  title: string;
  href: string;
  category: string;
  keywords: string;
}

const ITEMS: Item[] = [
  // Live + unique
  { title: "Will I Make It Home?", href: "/will-i-make-it-home", category: "Live", keywords: "panic arrival soc temperature speed" },
  { title: "Winter Range Forecast", href: "/winter-range-forecast", category: "Live", keywords: "zip 7 day weather noaa recurrent" },
  { title: "Charge Curve Simulator", href: "/charge-curve", category: "Live", keywords: "dcfc fast charging curve peak kw" },
  { title: "Panel Load Check", href: "/panel-load-check", category: "Live", keywords: "nec 220.83 625.42 permit worksheet panel amps" },
  { title: "EV Tire Cost", href: "/ev-tire-cost", category: "Live", keywords: "tire wear rolling resistance hidden cost" },

  // Cost & Savings
  { title: "EV Charging Cost", href: "/ev-charging-cost", category: "Cost", keywords: "monthly bill charging cost kwh home" },
  { title: "Gas vs Electric", href: "/gas-vs-electric", category: "Cost", keywords: "savings fuel comparison mpg dollars" },
  { title: "EV vs Hybrid", href: "/ev-vs-hybrid", category: "Cost", keywords: "plugin hybrid phev comparison" },
  { title: "Total Cost of Ownership", href: "/total-cost", category: "Cost", keywords: "tco 5 year depreciation maintenance insurance" },
  { title: "Lease vs Buy", href: "/lease-vs-buy", category: "Cost", keywords: "lease finance monthly payment" },
  { title: "Payback Period", href: "/payback-period", category: "Cost", keywords: "break even premium years" },
  { title: "Commute Cost", href: "/commute-cost", category: "Cost", keywords: "daily commute per trip" },
  { title: "Used EV Value", href: "/used-ev-value", category: "Cost", keywords: "residual battery health resale fair price" },
  { title: "Tax Credits", href: "/tax-credits", category: "Cost", keywords: "federal state 30d 30c incentive rebate" },

  // Charging
  { title: "Charging Time", href: "/charging-time", category: "Charging", keywords: "level 1 2 dc fast hours plug" },
  { title: "Charger ROI", href: "/charger-roi", category: "Charging", keywords: "home charger payback public nema install" },
  { title: "Bill Impact", href: "/bill-impact", category: "Charging", keywords: "electric bill rate plan tou" },
  { title: "Public Charging", href: "/public-charging", category: "Charging", keywords: "electrify america chargepoint evgo session" },
  { title: "TOU Optimizer", href: "/tou-optimizer", category: "Charging", keywords: "time of use off peak schedule" },

  // Range & Trips
  { title: "Range Calculator", href: "/range", category: "Range", keywords: "real world miles highway speed" },
  { title: "Winter Range", href: "/winter-range", category: "Range", keywords: "cold weather retention temperature" },
  { title: "Towing Range", href: "/towing-range", category: "Range", keywords: "trailer drag weight penalty" },
  { title: "Road Trip Planner", href: "/road-trip", category: "Range", keywords: "long trip dcfc stops session" },

  // Solar & Energy
  { title: "Solar + EV", href: "/solar-ev", category: "Solar", keywords: "solar panels array offset miles" },
  { title: "Solar Panel Sizing", href: "/solar-ev-sizing", category: "Solar", keywords: "kw roof peak sun hours" },
  { title: "Solar Payback", href: "/solar-payback", category: "Solar", keywords: "itc 30d 25d repealed cash" },
  { title: "Solar + Battery", href: "/solar-battery-ev", category: "Solar", keywords: "powerwall backup storage" },
  { title: "Solar vs Grid Cost", href: "/solar-vs-grid-ev", category: "Solar", keywords: "levelized cost lcoe" },
  { title: "Battery Degradation", href: "/battery-degradation", category: "Solar", keywords: "calendar cycle aging capacity fade" },
  { title: "Carbon Footprint", href: "/carbon-footprint", category: "Solar", keywords: "co2 grid mix lbs per year" },
  { title: "Fleet Calculator", href: "/fleet", category: "Solar", keywords: "business depot small fleet" },

  // Guides
  { title: "All State Guides", href: "/guides", category: "Guides", keywords: "state california texas new york rates" },
  { title: "All Calculators (directory)", href: "/calculators", category: "Guides", keywords: "index full directory list" },
];

function score(item: Item, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase().trim();
  const title = item.title.toLowerCase();
  const category = item.category.toLowerCase();
  const keywords = item.keywords.toLowerCase();

  if (title === q) return 1000;
  if (title.startsWith(q)) return 500;
  if (title.includes(q)) return 300;

  const terms = q.split(/\s+/).filter(Boolean);
  let s = 0;
  for (const t of terms) {
    if (title.includes(t)) s += 50;
    if (keywords.includes(t)) s += 20;
    if (category.includes(t)) s += 10;
  }
  return s;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  // Global keyboard trigger
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  // Focus input on open + reset state
  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      // defer so the input exists
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return ITEMS.slice(0, 12);
    }
    return ITEMS.map((item) => ({ item, s: score(item, query) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((r) => r.item);
  }, [query]);

  // Keep cursor in bounds
  useEffect(() => {
    if (cursor >= results.length) setCursor(0);
  }, [results.length, cursor]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = results[cursor];
      if (pick) {
        setOpen(false);
        router.push(pick.href);
      }
    }
  }

  // Trigger button (can be rendered anywhere)
  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Find a calculator (Cmd+K)"
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-1.5 text-sm text-[var(--color-ink-3)] transition-colors hover:border-[var(--color-border-hi)] hover:text-[var(--color-ink)]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <span className="hidden sm:inline">Find a calculator</span>
      <span className="hidden sm:inline rounded border border-[var(--color-border)] bg-white px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-ink-3)]">
        ⌘K
      </span>
    </button>
  );

  return (
    <>
      {trigger}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh] sm:pt-[15vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Calculator finder"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[var(--color-surface-ink)]/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          {/* Panel */}
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-2xl">
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Find a calculator…"
                className="flex-1 bg-transparent text-base text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="cm-mono rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-ink-3)] hover:bg-[var(--color-surface-alt)]"
              >
                esc
              </button>
            </div>

            {results.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--color-ink-3)]">
                Nothing matches that. Try a simpler term like &quot;solar&quot;, &quot;range&quot;, or &quot;payback&quot;.
              </div>
            ) : (
              <ul ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
                {results.map((item, i) => {
                  const active = i === cursor;
                  return (
                    <li key={item.href}>
                      <button
                        type="button"
                        onMouseEnter={() => setCursor(i)}
                        onClick={() => {
                          setOpen(false);
                          router.push(item.href);
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          active
                            ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)]"
                            : "text-[var(--color-ink)] hover:bg-[var(--color-surface-alt)]"
                        }`}
                      >
                        <span
                          className="cm-eyebrow w-16 shrink-0"
                          style={{ color: active ? "var(--color-brand)" : "var(--color-ink-4)" }}
                        >
                          {item.category}
                        </span>
                        <span className="flex-1 text-sm font-semibold">{item.title}</span>
                        <span className="cm-mono text-[var(--color-ink-4)]">{item.href}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-2">
              <span className="cm-mono text-[var(--color-ink-3)]">
                {results.length} {results.length === 1 ? "result" : "results"}
              </span>
              <span className="cm-mono text-[var(--color-ink-3)]">
                ↑↓ navigate · ↵ open · esc close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
