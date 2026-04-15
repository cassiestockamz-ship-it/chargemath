# ChargeMath Followups

Captured during the 2026-04-15 Voltline revamp. Out of scope for that session (product + SEO only, no monetization), but worth picking up later.

## Bugs worth fixing
- **charger-roi dial shows 0%.** The `lifetimeSavings` derivation in the agent-rebuilt page returns 0 for default inputs, so `returnPct` renders 0% in the PayoffDial. The hero number ("PAYS OFF IN 67 months") is correct; only the dial is wrong. Check the `results` useMemo in `src/app/charger-roi/page.tsx` and either fix the derivation or pick a different dial metric (monthly savings as % of monthly expense, public-vs-home cost ratio, etc).
- **range page 100% of EPA at defaults.** With 65 mph + 70°F defaults, the real-range calculator returns the full EPA number. Probably correct (that's the EPA reference condition), but worth confirming the penalty curve activates once you move either slider.

## Product ideas discovered during the build
- **SavingsMeter odometer digit-roll.** The design brief originally called for each digit column to roll independently like a split-flap board. I shipped a simpler CountUp + split bar variant to stay in budget. The odometer visual would make the SavingsMeter a truly unique signature move if someone wants to invest 1-2 hours.
- **Command palette (Cmd-K).** Creative director recommended a global fuzzy-search palette for all 40+ calculators. I shipped the directory instead (sufficient for discovery). The palette would still be a nice power-user addition.
- **Homepage state detection shows a flash of CA.** The `getDefaultStateCode()` call runs in `useEffect`, so the first paint is always California. For geo-IP users, the state briefly flashes CA then re-renders to their detected state. Acceptable, but a Next.js `headers()` server-side preload would eliminate the flash.
- **State guide Dataset schema is minimal.** It currently emits rate, monthly cost, annual savings, cost per mile. Could be expanded with kWh/month, cost per full charge, rank, and a `distribution` field pointing back to EIA for full spec compliance.

## Monetization work (deliberately punted)
- All affiliate cards (Amazon, EcoFlow via CJ) are currently in the non-anchor calculator pages and still render via `EducationalContent`/`AffiliateCard`. Not touched this session.
- AdSense is `pending` approval per layout.tsx. Recovery playbook rules apply until approved.
- The anchor calculator pages I rebuilt (gas-vs-electric, ev-charging-cost, charger-roi, charging-time, range, solar-ev) currently have NO affiliate cards at all. When AdSense approves, revisit and reintroduce contextual product recommendations in the below-the-fold section using the SavingsTile pattern.
- Email capture is still in place on anchor pages; homepage and state guides do not yet have it.

## Schema stack enhancements
- HowTo schema could be added to `charger-roi`, `ev-charging-cost`, `charging-time` (step-by-step flows). Currently only on `/guides/what-to-do`-style pages if any.
- Article schema on the `EducationalContent` block of each calculator would be worthwhile if the long-form content grows past 800 words.
- SearchAction on the WebSite schema currently points at `/calculators?q=` which doesn't actually implement search. Either build the search endpoint or repoint to something real.

## Non-anchor calculators still on the legacy ResultCard grid
All ~34 non-anchor pages inherit the Voltline palette and the tool-first CalculatorLayout fix, but they still render their result grids via `ResultCard` instead of `SavingsTile`. `ResultCard` was repainted in Voltline tokens so it matches visually, but if you want the full count-up + compareBars treatment on (say) `/total-cost` or `/bill-impact`, those pages need a hand pass to swap `ResultCard` → `SavingsTile` and add a `SavingsVerdict` hero.

## Performance polish
- `HomeLiveHero` is a client component that ships the full EV_VEHICLES + ELECTRICITY_RATES tables to the browser. That's fine for 22 vehicles and 51 states, but if the catalog grows, consider server-rendering the initial computed result and hydrating only the interactive form.
- SavingsMeter uses `transition: width` on a bar which can jank on Safari with stale styles. Double-check on iOS when possible.

## Copy review
- Quick answers on anchor pages are tight and Voltline-correct. The long-form `EducationalContent` blocks carried over from the previous version were AI-tell-swept for em dashes and banned words but not rewritten for tone. A pass to align them to the Voltline voice ("direct, opinionated, post-credit-era correct") would help consistency.
