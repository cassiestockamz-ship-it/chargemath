import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import MobileMenu from "@/components/MobileMenu";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://chargemath.com'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: "ChargeMath — EV Calculators & Charging Cost Tools",
    template: "%s — ChargeMath",
  },
  description:
    "Free EV charging cost calculators. Compare gas vs electric costs, estimate monthly charging expenses, and find savings with real EPA vehicle data and state electricity rates.",
  openGraph: {
    type: "website",
    siteName: "ChargeMath",
    title: "ChargeMath — Free EV Charging Calculators",
    description: "Calculate EV charging costs, compare gas vs electric, estimate range, and find tax credits. Powered by real EPA data and state electricity rates.",
    url: "https://chargemath.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChargeMath — Free EV Charging Calculators",
    description: "Calculate EV charging costs, compare gas vs electric, estimate range, and find tax credits.",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "fo-verify": "10d80926-1f78-4e3d-b169-f64f1f8bf4e4",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7557739369186741" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-screen flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              name: "ChargeMath",
              url: "https://chargemath.com",
              description: "Free EV charging calculators powered by real EPA vehicle data and state electricity rates.",
              publisher: { "@id": "https://chargemath.com/#organization" },
            },
            {
              "@type": "Organization",
              "@id": "https://chargemath.com/#organization",
              name: "ChargeMath",
              url: "https://chargemath.com",
              sameAs: ["https://github.com/cassiestockamz-ship-it/chargemath"],
            },
          ],
        }) }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=sessionStorage.getItem('_sid');if(!s){s=Math.random().toString(36).slice(2)+Date.now().toString(36);sessionStorage.setItem('_sid',s)}var d=screen.width<768?'mobile':screen.width<1024?'tablet':'desktop';fetch('https://project-dash-psi.vercel.app/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site_id:'4f06f8f8-19b6-4d60-9e14-8b539e38bb4a',path:location.pathname,referrer:document.referrer||null,device_type:d,session_id:s}),keepalive:true}).catch(function(){})}catch(e){}})();` }} />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:rounded focus:shadow-lg">
          Skip to content
        </a>
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
            <nav className="hidden items-center gap-0.5 md:flex">
              <Link href="/ev-charging-cost" className="whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] lg:px-2.5 lg:py-2 lg:text-sm">
                Cost
              </Link>
              <Link href="/gas-vs-electric" className="whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] lg:px-2.5 lg:py-2 lg:text-sm">
                Gas vs EV
              </Link>
              <Link href="/charging-time" className="whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] lg:px-2.5 lg:py-2 lg:text-sm">
                Time
              </Link>
              <Link href="/charger-roi" className="whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] lg:px-2.5 lg:py-2 lg:text-sm">
                ROI
              </Link>
              <Link href="/range" className="whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] lg:px-2.5 lg:py-2 lg:text-sm">
                Range
              </Link>
              <Link href="/tax-credits" className="whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] lg:px-2.5 lg:py-2 lg:text-sm">
                Credits
              </Link>
              <Link href="/bill-impact" className="whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] lg:px-2.5 lg:py-2 lg:text-sm">
                Bill Impact
              </Link>
            </nav>
            <MobileMenu />
          </div>
        </header>

        {/* Main content */}
        <main id="main-content" className="flex-1">{children}</main>

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
                Some links are affiliate links. See our{" "}
                <Link href="/disclosure" className="underline hover:text-[var(--color-text)] transition-colors">disclosure</Link>.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--color-text-muted)]">
                <Link href="/guides" className="hover:text-[var(--color-text)] transition-colors">State Guides</Link>
                <Link href="/embed" className="hover:text-[var(--color-text)] transition-colors">Embed</Link>
                <Link href="/about" className="hover:text-[var(--color-text)] transition-colors">About</Link>
                <Link href="/disclosure" className="hover:text-[var(--color-text)] transition-colors">Disclosure</Link>
                <Link href="/dashboard" className="hover:text-[var(--color-text)] transition-colors">Analytics</Link>
              </div>
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
