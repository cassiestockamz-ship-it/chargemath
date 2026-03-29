# ChargeMath — EV Calculator Hub

## What This Is
EV charging calculator hub at **chargemath.com**. Free interactive calculators for EV owners and shoppers, monetized with Amazon affiliate links and Google AdSense (ca-pub-7557739369186741, added 2026-03-29, pending review).

## Live URLs
- **Production:** https://chargemath.com
- **Vercel:** https://chargemath.vercel.app
- **GitHub:** https://github.com/cassiestockamz-ship-it/chargemath

## Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS 4 (CSS-based config, not tailwind.config.js)
- **Language:** TypeScript (strict)
- **Hosting:** Vercel (hobby plan, scope: taylors-projects-6d8e0bd8)
- **DNS:** Cloudflare (zone: 37b6c2f9e4582ca7e7b1787ad719462d)
- **Domain:** chargemath.com (non-www canonical, www→non-www redirect in next.config.ts)

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout (nav, footer, WebSite+Organization JSON-LD)
│   ├── opengraph-image.tsx   # Dynamic OG image (homepage)
│   ├── globals.css           # CSS variables + Tailwind + print styles
│   ├── icon.svg              # Favicon
│   ├── robots.ts             # robots.txt generator
│   ├── sitemap.ts            # sitemap.xml generator
│   ├── ev-charging-cost/     # Calculator 1 (page + layout + opengraph-image)
│   ├── gas-vs-electric/      # Calculator 2
│   ├── charging-time/        # Calculator 3
│   ├── charger-roi/          # Calculator 4
│   ├── range/                # Calculator 5
│   ├── tax-credits/          # Calculator 6
│   ├── bill-impact/          # Calculator 7
│   ├── about/                # About page
│   ├── disclosure/           # Affiliate disclosure
│   └── dashboard/            # Analytics dashboard (noindex)
├── components/
│   ├── CalculatorLayout.tsx   # Shared page wrapper
│   ├── CalculatorSchema.tsx   # JSON-LD WebApplication + Organization schema
│   ├── BreadcrumbSchema.tsx   # Breadcrumb JSON-LD
│   ├── RelatedCalculators.tsx # Cross-links footer (6 other calculators)
│   ├── ResultCard.tsx         # Metric display card (aria-live)
│   ├── AffiliateCard.tsx      # Amazon product recommendation (data-affiliate-card for print)
│   ├── FAQSection.tsx         # Collapsible FAQ with FAQPage schema
│   ├── ShareResults.tsx       # Share/copy results button
│   ├── EducationalContent.tsx # Below-the-fold educational content wrapper
│   ├── AffiliateDisclosure.tsx# Inline disclosure notice
│   ├── SelectInput.tsx        # Dropdown (useId, aria-describedby)
│   ├── NumberInput.tsx        # Number input with unit (useId, aria-describedby)
│   ├── SliderInput.tsx        # Range slider (useId, aria-*, startTransition)
│   └── MobileMenu.tsx         # Mobile hamburger nav
├── data/
│   ├── electricity-rates.ts   # 50 states + DC EIA rates
│   ├── ev-vehicles.ts         # 22 EVs with EPA data
│   ├── ev-incentives.ts       # Federal + state tax credits
│   └── faq-data.ts            # FAQ questions per calculator
└── lib/
    ├── useDefaultState.ts     # Timezone → state code detection
    ├── useUrlState.ts         # URL param sync for shareable calculator links
    └── ogImage.tsx            # Shared OG image generator
```

## Calculators
| # | Calculator | Path | Status |
|---|-----------|------|--------|
| 1 | EV Charging Cost | `/ev-charging-cost` | LIVE |
| 2 | Gas vs Electric | `/gas-vs-electric` | LIVE |
| 3 | Charging Time | `/charging-time` | LIVE |
| 4 | Home Charger ROI | `/charger-roi` | LIVE |
| 5 | Range Calculator | `/range` | LIVE |
| 6 | Tax Credit Estimator | `/tax-credits` | LIVE |
| 7 | Bill Impact | `/bill-impact` | LIVE |

## Monetization
- **Amazon Associates** tag: `kawaiiguy0f-cm-20`
- Affiliate links embedded contextually in calculator results
- Products: Level 2 chargers ($250-600), portable chargers, adapters, cable organizers, energy monitors
- ROI calculator links to specific products: ChargePoint Home Flex, Emporia Smart, Grizzl-E Classic
- Per-page tracking via `ascsubtag={slug}`
- **Display ads:** Not yet — apply for Raptive/Mediavine at 50K sessions/month

## Data Sources
- **EPA FuelEconomy.gov:** Vehicle efficiency, range, battery capacity (no API key needed)
- **EIA:** State residential electricity rates (manually updated, currently 2024/2025 averages)
- **AFDC:** Federal + state EV incentive data
- Data stored as TypeScript constants in `src/data/` — update annually

## Key Patterns
- All calculator pages are `"use client"` components (React state for interactivity)
- Each calculator has its own `layout.tsx` for page-specific metadata + `opengraph-image.tsx`
- `CalculatorSchema` component adds JSON-LD WebApplication structured data with Organization sameAs
- Root layout includes WebSite + Organization JSON-LD schema graph
- `RelatedCalculators` component shows 6 other calculators at page bottom
- `EducationalContent` wrapper adds SEO-rich methodology/tips content below each calculator
- Contextual internal cross-links in results section of every calculator (3 per page)
- `AffiliateCard` builds Amazon search URLs with affiliate tag
- CSS variables in `globals.css` for consistent theming
- Print styles hide nav/footer/ads, show clean results with chargemath.com branding
- URL state sync: all calculator inputs serialize to URL params for shareable links
- Auto state detection from browser timezone (falls back to CA)
- `startTransition` on slider inputs for better INP performance
- Accessibility: all inputs have proper htmlFor/id, aria-describedby, aria-live on results

## Deploy
```bash
cd ~/chargemath
source ~/.claude/tokens.env
TK=$(echo "$VERCEL_TOKEN" | tr -d '\r\n')
npx vercel --prod --token "$TK" --scope taylors-projects-6d8e0bd8 --yes
```

## Adding a New Calculator
1. Create `src/app/<slug>/page.tsx` ("use client", import shared components, add useUrlSync + getDefaultStateCode)
2. Create `src/app/<slug>/layout.tsx` (metadata with canonical + openGraph)
3. Create `src/app/<slug>/opengraph-image.tsx` (use makeOgImage from lib)
4. Add EducationalContent section (methodology, data sources, tips)
5. Add contextual cross-links to 3 related calculators
6. Add FAQ data in `src/data/faq-data.ts`
7. Add to `ALL_CALCULATORS` in `src/components/RelatedCalculators.tsx`
8. Add to homepage `calculators` array in `src/app/page.tsx`
9. Add nav link in `src/app/layout.tsx` + `src/components/MobileMenu.tsx`
10. Add to `src/app/sitemap.ts`
11. Build + deploy

## SEO Status
- robots.txt: ✅
- sitemap.xml: ✅ (10 pages)
- Structured data (JSON-LD): ✅ WebApplication + FAQPage + BreadcrumbList + WebSite + Organization
- Page-specific meta titles + descriptions: ✅
- OpenGraph images: ✅ dynamic per-page OG images via next/og
- FAQPage schema: ✅ all 7 calculator pages
- Canonical URLs: ✅ non-www, www→non-www redirect
- Internal cross-links: ✅ 3 contextual links per calculator
- Educational content: ✅ methodology + data sources + tips per calculator
- Print styles: ✅
- Accessibility (ARIA): ✅ labels, live regions, keyboard nav
- Google Search Console: ✅ verified + sitemap submitted
