/** @type {import('next').NextConfig} */

// Turbopack config moved under top-level `turbopack` per Next 16 API.
function createSecureHeaders() {
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Base CSP configuration
  const csp = [
    {
      key: 'Content-Security-Policy',
      value:
        "default-src 'self';" +
        "script-src 'self' 'unsafe-inline' https://vercel.com;" + // Vercel scripts
        "style-src 'self' 'unsafe-inline';" +
        "img-src 'self' data:;" +
        "font-src 'self';" +
        "object-src 'none';" +
        "base-uri 'self';" +
        "form-action 'self';" +
        "frame-ancestors 'none';" +
        'report-uri /api/csp-reports;',
    },
  ]

  // Allow 'unsafe-eval' in development for HMR and other tools
  if (isDevelopment) {
    const scriptSrc = "script-src 'self' 'unsafe-eval'"
    const styleSrc = "style-src 'self' 'unsafe-inline'"

    if (csp[0]) {
      csp[0].value = csp[0].value
        .replace("script-src 'self'", scriptSrc)
        .replace("style-src 'self' 'unsafe-inline'", styleSrc)
    }
  }

  return [
    ...csp,
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'Referrer-Policy',
      value: 'origin-when-cross-origin',
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()',
    },
  ]
}

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: createSecureHeaders(),
      },
    ]
  },
  // Enable cacheComponents which includes Partial Prerendering (PPR) in Next.js 16+
  // PPR was previously experimental.ppr but is now integrated into cacheComponents
  cacheComponents: true,
  cacheLife: {
    standard: {
      stale: 3600, // 1 hour
      revalidate: 86400, // 1 day
      expire: 604800, // 1 week
    },
    layout: {
      stale: 3600, // 1 hour
      revalidate: 86400, // 1 day
      expire: 604800, // 1 week
    },
  },
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    // Enable React Compiler (Forget) for automatic memoization
    reactCompiler: true,
    // Enable after() API for non-blocking operations
    after: true,
  },
}

export default nextConfig
