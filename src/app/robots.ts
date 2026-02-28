/**
 * Next.js 16 Dynamic Robots.txt Generation
 *
 * Generates robots.txt dynamically based on the environment.
 * Accessible at /robots.txt
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// eslint-disable-next-line import/no-anonymous-default-export
export default (): MetadataRoute.Robots => {
  const isProduction = process.env.NODE_ENV === 'production'

  if (!isProduction) {
    // Development/staging: Disallow all crawling
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  // Production: Allow crawling with restrictions
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/*', // API routes
          '/dashboard/*', // Protected dashboard
          '/projects/*/tasks/*', // Task details (require auth)
        ],
      },
      {
        userAgent: 'GPTBot', // OpenAI crawler
        disallow: '/', // Opt out of AI training
      },
      {
        userAgent: 'CCBot', // Common Crawl
        disallow: '/', // Opt out of a dataset collection
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
