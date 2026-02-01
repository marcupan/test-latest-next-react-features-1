import 'server-only'

import path from 'path'

import dotenv from 'dotenv'
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'

import type { DB } from './types'

// Load env when used from CLI and Next runtime
dotenv.config()
dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
  override: false,
})

// This creates a global singleton for the connection pool.
// In a serverless environment, this can lead to connection exhaustion.
// For production, consider using a library like `pg-bouncer` or a more
// sophisticated connection management strategy that is aware of the
// serverless lifecycle.

declare global {
  var dbPool: Pool | undefined
}

if (!process.env.POSTGRES_URL) {
  throw new Error(
    'POSTGRES_URL is not set. Define it in .env/.env.local or the process environment.',
  )
}

const pool =
  globalThis.dbPool ??
  new Pool({
    connectionString: process.env.POSTGRES_URL,
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.dbPool = pool
}

const dialect = new PostgresDialect({
  pool,
})

export const db = new Kysely<DB>({
  dialect,
})
