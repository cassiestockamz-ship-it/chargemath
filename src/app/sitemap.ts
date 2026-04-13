import type { MetadataRoute } from 'next'
import { getStateSlugs } from '@/data/state-guides'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://chargemath.com'
  const now = new Date().toISOString().split('T')[0]

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
    { url: baseUrl, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/calculators`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    ...calculatorPaths.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    { url: `${baseUrl}/guides`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...stateSlugs.map((slug) => ({
      url: `${baseUrl}/guides/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${baseUrl}/embed`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/methodology`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]
}
