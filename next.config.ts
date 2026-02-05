/** @type {import('next').NextConfig} */

function createSecureHeaders() {
  const isDevelopment = process.env.NODE_ENV === 'development'

  const csp = [
    {
      key: 'Content-Security-Policy',
      value:
        "default-src 'self';" +
        "script-src 'self' 'unsafe-inline' https://vercel.com;" +
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
  cacheComponents: true,
  cacheLife: {
    standard: {
      stale: 3600,
      revalidate: 86400,
      expire: 604800,
    },
    layout: {
      stale: 3600,
      revalidate: 86400,
      expire: 604800,
    },
  },
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
