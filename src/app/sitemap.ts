import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://chargemath.com'

  return [
    { url: baseUrl, lastModified: '2026-03-22', changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/ev-charging-cost`, lastModified: '2026-03-22', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/gas-vs-electric`, lastModified: '2026-03-22', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/charging-time`, lastModified: '2026-03-22', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/charger-roi`, lastModified: '2026-03-22', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/range`, lastModified: '2026-03-22', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/tax-credits`, lastModified: '2026-03-22', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/bill-impact`, lastModified: '2026-03-22', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: '2026-03-22', changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/disclosure`, lastModified: '2026-03-22', changeFrequency: 'monthly', priority: 0.3 },
  ]
}
