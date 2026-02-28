/**
 * Next.js 16 Dynamic Sitemap Generation
 *
 * Generates sitemap.xml automatically with static and dynamic routes.
 * Accessible at /sitemap.xml
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// eslint-disable-next-line import/no-anonymous-default-export
export default (): MetadataRoute.Sitemap => {
  // Static pages
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Note: Dynamic shared project URLs can be added by fetching from DB
    // Example: await db.selectFrom('public_shares').select(['token']).execute()
  ]
}
