import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ChargeMath privacy policy: what the calculators collect, how analytics, email signup and advertising cookies work, and how to opt out.",
  alternates: { canonical: "/privacy" },
};

// Real date of the last content change to this policy. Update only when the text changes.
const LAST_UPDATED = new Date("2026-10-01T12:00:00Z");

export default function PrivacyPage() {
  const lastUpdated = LAST_UPDATED.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">Last updated: {lastUpdated}</p>

      <div className="mt-8 space-y-6 leading-relaxed text-[var(--color-text-muted)]">
        <section>
          <p>
            This policy explains how <strong className="text-[var(--color-text)]">ChargeMath</strong> handles
            information about visitors to chargemath.com. The short version: the calculators work without an
            account, the numbers you type stay in your browser, and the only personal data we store is an email
            address you choose to give us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text)]">What we do not collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-[var(--color-text)]">No accounts.</strong> Every calculator works without
              signing up or logging in.
            </li>
            <li>
              <strong className="text-[var(--color-text)]">No calculator inputs.</strong> Vehicle choices, mileage,
              electricity rates and other values you enter are calculated in your browser. Some calculators copy
              your inputs into the page URL so you can bookmark or share a result; that URL stays with you unless
              you share it.
            </li>
            <li>
              <strong className="text-[var(--color-text)]">No selling or sharing of email addresses.</strong> Not
              with advertisers, data brokers or anyone else.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text)]">What we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-[var(--color-text)]">Anonymous page-view analytics.</strong> A small script
              records the page path, a random per-visit session ID, a rough device type (mobile, tablet or desktop)
              and the referring page if your browser sends one. It does not store your IP address or set a
              persistent cookie, and it is not tied to your identity. Add <code>?notrack=1</code> to any ChargeMath
              URL to turn it off for your browser.
            </li>
            <li>
              <strong className="text-[var(--color-text)]">Email addresses you submit.</strong> If you use a
              signup form, we store the address, the page you signed up on and the time. We use it only for
              ChargeMath updates. Ask us to remove it at any time and we will.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Browser storage</h2>
          <p className="mt-3">ChargeMath itself does not set tracking cookies. It uses:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              a per-tab session ID in <code>sessionStorage</code> for the analytics above, cleared when you close
              the tab;
            </li>
            <li>
              an opt-out flag in <code>localStorage</code>, set only when you visit a URL with{" "}
              <code>?notrack=1</code>.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Advertising and other services</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-[var(--color-text)]">Google AdSense.</strong> Pages may load Google&apos;s
              advertising code. Google and its partners may use cookies to show ads based on your visits to this
              and other sites. See{" "}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">
                how Google uses information from sites that use its services
              </a>
              . You can turn off personalized ads at{" "}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">
                adssettings.google.com
              </a>
              .
            </li>
            <li>
              <strong className="text-[var(--color-text)]">Vercel</strong> hosts the site and keeps standard server
              logs (IP address, browser, page requested) as part of normal operation.
            </li>
            <li>
              <strong className="text-[var(--color-text)]">Public data services.</strong> The{" "}
              <Link href="/winter-range-forecast" className="text-[var(--color-primary)] underline">winter range forecast</Link>{" "}
              sends the ZIP code you enter from your browser to zippopotam.us (to find its coordinates) and to a
              public weather forecast service. We do not receive or keep that ZIP code.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Children</h2>
          <p className="mt-3">
            ChargeMath is not directed at children under 13 and we do not knowingly collect their information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Your rights</h2>
          <p className="mt-3">
            Depending on where you live (for example under the GDPR or the CCPA), you can ask what we hold about
            you, and ask us to correct or delete it. For ChargeMath that is at most one email address.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Changes</h2>
          <p className="mt-3">
            If this policy changes, the date at the top changes with it.
          </p>
        </section>
      </div>

      <div className="mt-10 border-t border-[var(--color-border)] pt-6">
        <Link href="/" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
          &larr; Back to ChargeMath
        </Link>
      </div>
    </div>
  );
}
