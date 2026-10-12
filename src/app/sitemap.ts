import type { MetadataRoute } from 'next'
import lastmods from '@/data/sitemap-lastmod.json'
import { getStateSlugs } from '@/data/state-guides'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://chargemath.com'
  // True last-change dates per route (scripts/sitemap-lastmod.mjs), never the build time
  const map = lastmods as Record<string, string>
  const lm = (path: string) => map[path] ?? map['*']

  const stateSlugs = getStateSlugs()

  const calculatorPaths = [
    '/will-i-make-it-home',
    '/winter-range-forecast',
    '/charge-curve',
    '/panel-load-check',
    '/ev-tire-cost',
    '/ev-charging-cost',
    '/gas-vs-electric',
    '/charging-time',
    '/charger-roi',
    '/range',
    '/tax-credits',
    '/bill-impact',
    '/ev-vs-hybrid',
    '/hybrid-vs-gas',
    '/total-cost',
    '/lease-vs-buy',
    '/payback-period',
    '/road-trip',
    '/public-charging',
    '/tou-optimizer',
    '/winter-range',
    '/towing-range',
    '/commute-cost',
    '/battery-degradation',
    '/carbon-footprint',
    '/solar-ev',
    '/solar-ev-sizing',
    '/solar-payback',
    '/solar-battery-ev',
    '/solar-vs-grid-ev',
    '/fleet',
    '/used-ev-value',
  ]

  return [
    { url: baseUrl, lastModified: lm('/'), changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/calculators`, lastModified: lm('/calculators'), changeFrequency: 'monthly', priority: 0.9 },
    ...calculatorPaths.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: lm(path),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    { url: `${baseUrl}/guides`, lastModified: lm('/guides'), changeFrequency: 'monthly', priority: 0.8 },
    ...stateSlugs.map((slug) => ({
      url: `${baseUrl}/guides/${slug}`,
      lastModified: lm('/guides/[state]'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${baseUrl}/embed`, lastModified: lm('/embed'), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/about`, lastModified: lm('/about'), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/methodology`, lastModified: lm('/methodology'), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: lm('/privacy'), changeFrequency: 'yearly', priority: 0.2 },
  ]
}
