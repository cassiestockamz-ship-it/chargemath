# ChargeMath — EV Calculator Hub

## What This Is
EV charging calculator hub at **chargemath.com**. Free interactive calculators for EV owners and shoppers, monetized with Amazon affiliate links and (eventually) display ads.

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
- **Domain:** chargemath.com (registered via Cloudflare)

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout (nav, footer)
│   ├── globals.css           # CSS variables + Tailwind
│   ├── icon.svg              # Favicon
│   ├── robots.ts             # robots.txt generator
│   ├── sitemap.ts            # sitemap.xml generator
│   ├── ev-charging-cost/     # Calculator 1
│   ├── gas-vs-electric/      # Calculator 2
│   ├── charging-time/        # Calculator 3
│   └── charger-roi/          # Calculator 4
├── components/
│   ├── CalculatorLayout.tsx   # Shared page wrapper
│   ├── CalculatorSchema.tsx   # JSON-LD structured data
│   ├── RelatedCalculators.tsx # Cross-links footer
│   ├── ResultCard.tsx         # Metric display card
│   ├── AffiliateCard.tsx      # Amazon product recommendation
│   ├── SelectInput.tsx        # Dropdown component
│   ├── NumberInput.tsx        # Number input with unit
│   └── SliderInput.tsx        # Range slider
├── data/
│   ├── electricity-rates.ts   # 50 states + DC EIA rates
│   └── ev-vehicles.ts        # 22 EVs with EPA data
└── lib/                       # (empty, for future utilities)
```

## Calculators
| # | Calculator | Path | Status |
|---|-----------|------|--------|
| 1 | EV Charging Cost | `/ev-charging-cost` | LIVE |
| 2 | Gas vs Electric | `/gas-vs-electric` | LIVE |
| 3 | Charging Time | `/charging-time` | LIVE |
| 4 | Home Charger ROI | `/charger-roi` | LIVE |
| 5 | Range Calculator | `/range` | PLANNED |
| 6 | Tax Credit Estimator | `/tax-credits` | PLANNED |

## Monetization
- **Amazon Associates** tag: `kawaiiguy0f-20`
- Affiliate links embedded contextually in calculator results
- Products: Level 2 chargers ($250-600), portable chargers, adapters, cable organizers, energy monitors
- ROI calculator links to specific products: ChargePoint Home Flex, Emporia Smart, Grizzl-E Classic
- **Display ads:** Not yet — apply for Raptive/Mediavine at 50K sessions/month

## Data Sources
- **EPA FuelEconomy.gov:** Vehicle efficiency, range, battery capacity (no API key needed)
- **EIA:** State residential electricity rates (manually updated, currently 2024/2025 averages)
- Data stored as TypeScript constants in `src/data/` — update annually

## Key Patterns
- All calculator pages are `"use client"` components (React state for interactivity)
- Each calculator has its own `layout.tsx` for page-specific metadata
- `CalculatorSchema` component adds JSON-LD WebApplication structured data
- `RelatedCalculators` component shows 3 other calculators at page bottom
- `AffiliateCard` builds Amazon search URLs with affiliate tag
- CSS variables in `globals.css` for consistent theming (--color-primary, --color-ev-green, etc.)

## Deploy
```bash
source ~/.claude/tokens.env
TK=$(echo "$VERCEL_TOKEN" | tr -d '\r\n')
npx vercel --prod --token "$TK" --scope taylors-projects-6d8e0bd8 --yes
```

## Adding a New Calculator
1. Create `src/app/<slug>/page.tsx` ("use client", import shared components)
2. Create `src/app/<slug>/layout.tsx` (metadata)
3. Add to `ALL_CALCULATORS` in `src/components/RelatedCalculators.tsx`
4. Add to homepage `calculators` array in `src/app/page.tsx`
5. Add nav link in `src/app/layout.tsx`
6. Add to `src/app/sitemap.ts`
7. Build + deploy

## SEO Status
- robots.txt: ✅
- sitemap.xml: ✅ (5 pages)
- Structured data (JSON-LD): ✅ all calculator pages
- Page-specific meta titles + descriptions: ✅
- OpenGraph tags: ✅
- Google Search Console: pending submission
