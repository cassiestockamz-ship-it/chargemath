import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChargeMath — EV Calculators & Charging Cost Tools",
  description:
    "Free EV charging cost calculators. Compare gas vs electric costs, estimate monthly charging expenses, and find savings with real EPA vehicle data and state electricity rates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-[var(--color-text)]"
            >
              <span className="text-2xl" aria-hidden="true">
                &#9889;
              </span>
              ChargeMath
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/ev-charging-cost"
                className="whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] sm:px-3 sm:text-sm"
              >
                Charging Cost
              </Link>
              <Link
                href="/gas-vs-electric"
                className="whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] sm:px-3 sm:text-sm"
              >
                Gas vs Electric
              </Link>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-medium text-[var(--color-text)]">
                &#9889; ChargeMath
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Built with public data from EPA &amp; EIA
              </p>
              <p className="max-w-lg text-xs text-[var(--color-text-muted)]">
                Disclaimer: Calculations are estimates based on average
                electricity rates and EPA-rated vehicle efficiency. Actual costs
                may vary based on your utility plan, charging habits, climate,
                and driving conditions.
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                &copy; {new Date().getFullYear()} ChargeMath. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
