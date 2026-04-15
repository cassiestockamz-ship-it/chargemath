# ChargeMath — EV Calculator Hub

## Thesis
**ChargeMath is the verdict you see before you finish typing.** The answer is already on screen on first paint, hydrated from geo-IP state plus a sensible default EV. Every form is optional tuning on top of a pre-computed answer. Every calculator answers a question with a one-screen verdict, not a form-then-number waterfall.

Design language: **Voltline** — deep electric indigo (`#2f3dff`) + lightning yellow (`#ffd60a`) + circuit teal (`#17c2a6`) on a near-white instrument panel, with one deep `#0b0f1a` strip for the SavingsMeter. Positive/affirmative, post-§30D correct, opinionated.

## Live URLs
- **Production:** https://chargemath.com
- **Vercel:** https://chargemath.vercel.app
- **GitHub:** https://github.com/cassiestockamz-ship-it/chargemath

## Stack
- **Framework:** Next.js 16.2.1 (App Router, Turbopack)
- **React:** 19.2.4
- **Styling:** Tailwind CSS 4 (`@theme inline` in globals.css, no tailwind.config.js)
- **Language:** TypeScript strict
- **Fonts:** Space Grotesk (display, hero numbers), Inter (body), JetBrains Mono (units, labels), all via `next/font/google`
- **View Transitions:** `experimental.viewTransition: true` in next.config, persistent chrome morphs via `.vt-header`, `.vt-header-logo`, `.vt-nav`, `.vt-hero-number`, `.vt-savings-meter`, `.vt-footer` class names
- **Hosting:** Vercel (hobby plan, scope: taylors-projects-6d8e0bd8)
- **DNS:** Cloudflare (zone: 37b6c2f9e4582ca7e7b1787ad719462d)
- **Domain:** chargemath.com (non-www canonical, www→non-www redirect in next.config.ts)

## The Voltline design system

### Atomic unit: `SavingsTile`
[`src/components/SavingsTile.tsx`](src/components/SavingsTile.tsx). Every result number on every anchor page flows through this one component. Props: `label`, `value`, `unit`, `prefix`, `decimals`, `icon`, `variant` (default | hero | compare), `tier` (brand | volt | good | mid | warn), optional `delta` pill, optional `compareBars` footer, `animate` default true. Count-up on mount. `heroMorph` flag applies `vt-hero-number` for cross-route morphs.

The non-anchor pages still render through the legacy [`ResultCard.tsx`](src/components/ResultCard.tsx), which has been repainted in Voltline tokens so it matches visually without a codemod.

### Signature live interaction: `SavingsMeter`
[`src/components/SavingsMeter.tsx`](src/components/SavingsMeter.tsx). The split-column cost meter that sits above the result grid on cost-comparison calculators. Left column = losing option (gas, grid, public), right column = winning option (EV, solar, home), middle = volt-yellow delta. Proportional fill bar underneath. Reused on `/gas-vs-electric`, `/ev-charging-cost`, `/charger-roi`, `/solar-ev`, and the homepage. One component, one visual signature.

### One-screen hero: `SavingsVerdict`
[`src/components/SavingsVerdict.tsx`](src/components/SavingsVerdict.tsx). Mirrors recallscanner's `SafetyVerdict`. Volt rail, eyebrow + headline + giant count-up number (`amountPrefix` default `"$"`, override to `""` for non-currency like months/miles/hours), optional `PayoffDial` on the right, optional 4-tile grid slot via `children`. Used on all 6 anchor calculators, the homepage, and every state guide.

### Circular dial: `PayoffDial`
[`src/components/PayoffDial.tsx`](src/components/PayoffDial.tsx). Pure SVG. CSS keyframe arc sweep + `CountUp` number inside. Ported from recallscanner's `ScoreDial`, repainted Voltline.

### Count-up: `CountUp`
[`src/components/CountUp.tsx`](src/components/CountUp.tsx). Single `requestAnimationFrame` loop, ease-out cubic, respects `prefers-reduced-motion`. Re-animates from current displayed number to new target when props change. Supports `decimals` prop for fractional values.

### Tool-first layout: `CalculatorShell`
[`src/components/CalculatorShell.tsx`](src/components/CalculatorShell.tsx). Used on the 6 anchor calculators. Compact header (eyebrow + tight left-aligned H1 + one-line quickAnswer with `data-speakable="true"`), compact input strip (3 primaries + collapsed Advanced details), hero slot, below-fold children slot. Above-the-fold budget at 390w mobile: inputs AND hero answer both visible within the first 500px.

### Legacy layout: `CalculatorLayout`
[`src/components/CalculatorLayout.tsx`](src/components/CalculatorLayout.tsx) was upgraded in place so the ~34 non-anchor pages inherit the tool-first fix automatically: left-aligned tight H1, no centered hero text, QuickAnswer demoted to a "How this number is calculated" methodology footer below the widget.

## Key pages

### Homepage (`/`)
[`src/components/HomeLiveHero.tsx`](src/components/HomeLiveHero.tsx) runs a real `SavingsVerdict` + `SavingsMeter` on first paint with geo-IP state detection + 2024 Tesla Model 3 + 35 daily miles. Any input change re-animates the whole stack. Below the hero: calculator search, full 5-category directory (every tool visible, no burial), state guides CTA.

### Anchor calculators (6)
Rebuilt with full `CalculatorShell` + `SavingsVerdict` + `SavingsMeter` where applicable:
- [`/gas-vs-electric`](src/app/gas-vs-electric/page.tsx) — flagship, YOU SAVE $/year, fuel-cut dial, full SavingsMeter
- [`/ev-charging-cost`](src/app/ev-charging-cost/page.tsx) — YOU PAY $/month, GRID vs GAS SavingsMeter
- [`/charger-roi`](src/app/charger-roi/page.tsx) — PAYS OFF IN N months, PUBLIC vs HOME SavingsMeter
- [`/charging-time`](src/app/charging-time/page.tsx) — PLUG IN FOR N hours, battery-percent dial
- [`/range`](src/app/range/page.tsx) — YOU GET N miles, % of EPA dial
- [`/solar-ev`](src/app/solar-ev/page.tsx) — SOLAR POWERS N miles/day, coverage dial, GRID vs SOLAR SavingsMeter

### Non-anchor calculators (~34)
Still use `CalculatorLayout` + `ResultCard` but inherit the Voltline palette + tool-first fix automatically. If you want to upgrade any specific one to the full `SavingsVerdict` treatment, follow the anchor pattern.

### State guides (`/guides/[state]`)
[`src/app/guides/[state]/page.tsx`](src/app/guides/[state]/page.tsx) + [`src/components/StateCalculatorEmbed.tsx`](src/components/StateCalculatorEmbed.tsx). Every state guide is now a real live calculator with the state rate locked from the EIA data. SavingsVerdict + 4 SavingsTiles + SavingsMeter + editorial rail + FAQ. Dataset JSON-LD per state with EIA as sourceOrganization, CC0 license, temporalCoverage, spatialCoverage, variableMeasured.

## Schema stack

Central pattern, emitted per page type:
- **Homepage:** WebSite + Organization + SearchAction + FAQPage+Speakable (when FAQ present)
- **Calculator page:** WebApplication + FAQPage+Speakable + BreadcrumbList
- **State guide:** Article + BreadcrumbList + Dataset + FAQPage+Speakable
- **Speakable selector:** `[data-speakable="true"]` used on the QuickAnswer row of every calculator, the hero H1, and the first FAQ question+answer

## Prose discipline

Every user-visible string across the site has been swept against the banned-patterns list at `~/.claude/fiction-patterns/banned_patterns.md`. **Zero em dashes** and **zero banned AI words** (delve, utilize, leverage, ultimately, moreover, furthermore, essentially, multifaceted, nuanced, foster, underscore, cornerstone, actionable, etc.) in any user-facing surface. Code comments retain em dashes per policy. The noindex `/dashboard/scorecard` admin page retains em dashes as "no data" glyphs.

## Federal tax credit (§30D)
The federal Clean Vehicle Credit was repealed for vehicles placed in service after September 30, 2025. [`src/data/ev-incentives.ts`](src/data/ev-incentives.ts) has `FEDERAL_CREDITS.newVehicle.active: false` with the expiration note. All prose that references credits is post-§30D-correct.

## Project structure
```
src/
├── app/
│   ├── page.tsx              # Homepage (HomeLiveHero + directory)
│   ├── layout.tsx            # Root layout (fonts, vt-* classes, nav, footer)
│   ├── globals.css           # Voltline @theme inline + animations + View Transitions
│   ├── ev-charging-cost/, gas-vs-electric/, charger-roi/,
│   │   charging-time/, range/, solar-ev/ — 6 anchor calculators
│   ├── guides/
│   │   ├── page.tsx          # State guides hub
│   │   └── [state]/page.tsx  # Live calculator per state + Dataset schema
│   ├── calculators/          # Full catalog directory
│   ├── will-i-make-it-home/, winter-range-forecast/, charge-curve/,
│   │   panel-load-check/, ev-tire-cost/ — unique tools
│   ├── battery-degradation/, bill-impact/, carbon-footprint/, commute-cost/,
│   │   ev-vs-hybrid/, fleet/, lease-vs-buy/, payback-period/, public-charging/,
│   │   road-trip/, solar-battery-ev/, solar-ev-sizing/, solar-payback/,
│   │   solar-vs-grid-ev/, tax-credits/, total-cost/, tou-optimizer/,
│   │   towing-range/, used-ev-value/, winter-range/ — standard calculators
│   ├── about/, disclosure/, methodology/, embed/, dashboard/
│   ├── api/{analytics,og-result,scorecard,subscribe}/
│   ├── opengraph-image.tsx, robots.ts, sitemap.ts, icon.svg, not-found.tsx
├── components/
│   ├── CalculatorShell.tsx   # Tool-first template for anchors
│   ├── CalculatorLayout.tsx  # Legacy template, upgraded in place
│   ├── SavingsVerdict.tsx    # One-screen hero
│   ├── SavingsMeter.tsx      # Split-column live cost meter
│   ├── SavingsTile.tsx       # Atomic result unit
│   ├── PayoffDial.tsx        # Circular dial
│   ├── CountUp.tsx           # Count-up animation
│   ├── HomeLiveHero.tsx      # Homepage live calculator
│   ├── StateCalculatorEmbed.tsx  # State-locked live calc
│   ├── ResultCard.tsx        # Legacy tile (repainted Voltline)
│   ├── CalculatorSchema.tsx, BreadcrumbSchema.tsx, FAQSection.tsx,
│   │   NavDropdown.tsx, MobileMenu.tsx, CalculatorSearch.tsx,
│   │   EducationalContent.tsx, AffiliateCard.tsx, AffiliateDisclosure.tsx,
│   │   EcoFlowCard.tsx, EmailCapture.tsx, ShareResults.tsx,
│   │   SelectInput.tsx, NumberInput.tsx, SliderInput.tsx, RelatedCalculators.tsx
├── data/
│   ├── electricity-rates.ts  # 50 states + DC EIA
│   ├── ev-vehicles.ts        # 22 EVs
│   ├── ev-incentives.ts      # Federal (30D repealed) + state credits
│   ├── solar-data.ts         # Peak sun hours, install $/W
│   ├── state-guides.ts       # Pre-computed per-state cost math
│   └── faq-data.ts
└── lib/
    ├── useDefaultState.ts, useUrlState.ts, ogImage.tsx
```

## Deploy
```bash
cd ~/chargemath
source ~/.claude/tokens.env
TK=$(echo "$VERCEL_TOKEN" | tr -d '\r\n')
"C:/Users/Amazon IRL/AppData/Roaming/npm/vercel.cmd" --prod --token "$TK" --scope taylors-projects-6d8e0bd8 --yes
```

## Session rules when working on this repo
- **Never spawn `next dev` for QA without killing it before reporting done.** Next.js leaks postcss workers that orphan on parent kill. Prefer `next build && next start` for final visual QA, or run visual QA on the live deployed URL via Playwright. See `feedback_kill_dev_servers.md` in memory.
- **Zero em dashes in user-visible prose.** Sweep before every deploy.
- **Tool-first layout.** If you add a calculator, the input strip and the first result number must both be visible within 500px of the top on mobile 390w. Use `CalculatorShell` + `SavingsVerdict` for the full treatment, or `CalculatorLayout` + `ResultCard` to inherit the baseline.
- **Use the Voltline tokens, not raw colors.** Every color the user sees flows through the `--color-*` variables in [`src/app/globals.css`](src/app/globals.css).
- **Monetization is out of scope until the next dedicated session.** See `followups.md` in the project root for the list of deferred affiliate + ad work.

## Monetization (status quo, out of scope this session)
- Amazon Associates tag: `kawaiiguy0f-cm-20` (existing, in `AffiliateCard`)
- EcoFlow via CJ Affiliate (existing, in `EcoFlowCard` on solar/charger pages)
- Google AdSense: `ca-pub-7557739369186741` (pending review, script in `layout.tsx`)
- The 6 rebuilt anchor pages currently have NO affiliate cards. When AdSense approves, reintroduce via the `SavingsTile` pattern below the fold.

## Data sources
- EPA FuelEconomy.gov (vehicle efficiency, range, battery capacity)
- EIA (state residential electricity rates)
- AFDC (federal + state EV incentive data)
- Data is stored as TypeScript constants in `src/data/` and updated annually.

## SEO status (post-revamp)
- WebApplication + FAQPage + BreadcrumbList on every calculator
- Article + Dataset + BreadcrumbList + FAQPage+Speakable on every state guide
- WebSite + Organization + SearchAction on homepage
- Speakable selectors on Quick Answer rows, hero H1s, first FAQ items
- OG images: dynamic per-page via next/og
- Canonical URLs: non-www, www→non-www redirect
- Sitemap: auto-generated from static routes + 51 state guides
- robots.txt present
- Google Search Console verified + sitemap submitted
