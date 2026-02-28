/**
 * Next.js 16 Edge-Compatible API Route
 *
 * Demonstrates Edge Runtime patterns (geolocation, low latency).
 * Note: `export const runtime = 'edge'` is not compatible with cacheComponents.
 * For true edge deployment, disable cacheComponents in next.config.ts
 *
 * Perfect for:
 * - Geolocation-based responses
 * - A/B testing
 * - Simple authentication checks
 * - Proxying requests
 *
 * @see https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes
 */

import { NextRequest, NextResponse } from 'next/server'

// Note: Uncomment below to enable Edge runtime (requires disabling cacheComponents)
// export const runtime = 'edge'

export const GET = async (request: NextRequest) => {
  // Access edge-specific data
  // Note: geo and ip are available on Vercel Edge Runtime
  const geo = (request as any).geo
  const ip = (request as any).ip || request.headers.get('x-forwarded-for')
  const userAgent = request.headers.get('user-agent')

  // Example: Return a location-specific response
  const response = {
    message: 'Hello from the Edge! ⚡',
    timestamp: new Date().toISOString(),
    runtime: 'edge',
    location: geo
      ? {
          city: geo.city,
          country: geo.country,
          region: geo.region,
          latitude: geo.latitude,
          longitude: geo.longitude,
        }
      : null,
    clientInfo: {
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
    },
    performance: {
      // Edge runtime has faster cold starts
      coldStart: 'Faster than Node.js runtime',
      latency: 'Lower latency due to edge distribution',
    },
  }

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Edge-specific caching
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  })
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()

    // Example: Echo back with edge metadata
    return NextResponse.json(
      {
        received: body,
        processedAt: new Date().toISOString(),
        runtime: 'edge',
        geo: (request as any).geo || null,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Invalid JSON',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    )
  }
}
