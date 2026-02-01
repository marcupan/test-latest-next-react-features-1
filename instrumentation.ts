/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts up.
 * Use for one-time initialization, connection pooling, etc.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // eslint-disable-next-line no-console
    console.log('🚀 Server initialization starting...')

    // Pre-initialize database connection pool
    // This ensures the pool is ready before first request
    try {
      const { db } = await import('./src/shared/db')

      // Test connection and warm up pool
      await db
        .selectFrom('users')
        .select('id')
        .limit(1)
        .execute()
        .catch(() => {
          // Ignore error if users table doesn't exist yet (migrations not run)
        })

      // eslint-disable-next-line no-console
      console.log('✅ Database connection pool initialized')
    } catch (error) {
      console.error('⚠️  Database pool initialization failed:', error)
      // Don't throw - let the app start anyway
    }

    // You could also:
    // - Warm up Redis connections
    // - Initialize monitoring/telemetry
    // - Pre-load configuration
    // - Start background workers

    // eslint-disable-next-line no-console
    console.log('✅ Server initialization complete')
  }

  // Edge runtime initialization (if needed)
  if (process.env.NEXT_RUNTIME === 'edge') {
    // eslint-disable-next-line no-console
    console.log('🌐 Edge runtime initialized')
  }
}

/**
 * Optional: onRequestError hook for global error handling
 * Available in Next.js 15+
 */
export async function onRequestError(
  error: Error,
  request: {
    path: string
    method: string
  },
) {
  // Log errors to your monitoring service
  console.error('Request error:', {
    error: error.message,
    path: request.path,
    method: request.method,
    stack: error.stack,
  })

  // You could send to:
  // - Sentry
  // - DataDog
  // - Custom logging service
}
