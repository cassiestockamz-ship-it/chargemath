"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/ev-charging-cost", label: "Charging Cost", icon: "🔌" },
  { href: "/gas-vs-electric", label: "Gas vs Electric", icon: "⚖️" },
  { href: "/charging-time", label: "Charging Time", icon: "⏱️" },
  { href: "/charger-roi", label: "Charger ROI", icon: "💰" },
  { href: "/range", label: "Range", icon: "🗺️" },
  { href: "/tax-credits", label: "Tax Credits", icon: "🏛️" },
  { href: "/bill-impact", label: "Bill Impact", icon: "📄" },
  { href: "/ev-vs-hybrid", label: "EV vs Hybrid", icon: "🔄" },
  { href: "/lease-vs-buy", label: "Lease vs Buy", icon: "🔑" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden" data-mobile-menu>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          <nav className="mx-auto max-w-6xl px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]"
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
