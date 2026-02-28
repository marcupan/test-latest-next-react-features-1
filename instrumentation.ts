/* eslint-disable no-console */

/**
 * Next.js 16 Instrumentation Hooks
 *
 * This file runs once when the server starts (both dev and production).
 * Use it for:
 * - Setting up observability/telemetry
 * - Initializing external services
 * - Registering global error handlers
 * - Warming up connections
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run in Node.js runtime (not Edge)
    console.log('🚀 Server instrumentation initialized')
    console.log(`📊 Environment: ${process.env.NODE_ENV}`)
    console.log(`⚡ Runtime: Node.js`)

    // Example: Initialize telemetry/monitoring
    // await initializeTelemetry()

    // Example: Set up global error handlers
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
      // Send error tracking service (Sentry, etc.)
    })

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error)
      // Send error tracking service
      // Consider a graceful shutdown
    })

    // Example: Warm up the database connection pool
    try {
      const { db } = await import('./src/shared/db')

      await db.selectFrom('organizations').select('id').limit(1).execute()

      console.log('✅ Database connection pool warmed up')
    } catch (error) {
      console.error('⚠️  Failed to warm up database:', error)
    }

    console.log('✨ Instrumentation setup complete')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime initialization (if needed)
    console.log('⚡ Edge runtime instrumentation initialized')
  }
}

/**
 * Optional: Export onRequestError for custom error handling
 * Available in Next.js 15+
 */
export const onRequestError = async (
  error: Error,
  request: Request,
  context: {
    routerKind: 'Pages Router' | 'App Router'
    routePath: string
    routeType: 'render' | 'route' | 'action' | 'middleware'
  },
) => {
  console.error('🚨 Request Error:', {
    error: error.message,
    stack: error.stack,
    route: context.routePath,
    type: context.routeType,
    method: request.method,
    url: request.url,
  })

  // Send error tracking service
  // await sendToErrorTracker({
  //   error,
  //   request,
  //   context,
  // })
}
