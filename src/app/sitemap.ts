import type { MetadataRoute } from 'next'
import { getStateSlugs } from '@/data/state-guides'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://chargemath.com'
  const now = '2026-03-29'

  const stateSlugs = getStateSlugs()

  const calculatorPaths = [
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
    { url: `${baseUrl}/disclosure`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]
}
