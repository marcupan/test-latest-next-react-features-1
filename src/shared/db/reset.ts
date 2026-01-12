/* eslint-disable no-console */

import path from 'path'

import dotenv from 'dotenv'
import { Pool } from 'pg'

// Load env from .env then .env.local (without overriding already-set vars)
dotenv.config()
dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
  override: false,
})

// Full reset: drop app tables and clear migration tracking.
// WARNING: This deletes ALL app data in the target database.

async function reset() {
  if (!process.env.POSTGRES_URL) {
    console.error(
      'POSTGRES_URL is not set. Populate it in .env or export it in your shell.',
    )
    process.exit(1)
  }
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL })
  console.log('Connecting to database for reset...')

  try {
    await pool.query('BEGIN')

    // Drop dependent tables first to avoid FK issues
    const drops = [
      'comments',
      'attachments',
      'share_tokens',
      'tasks',
      'projects',
      'users_organizations',
      'sessions',
      'audit_log',
      'users',
      'organizations',
    ]

    for (const t of drops) {
      console.log(`Dropping table if exists: ${t}`)
      // eslint-disable-next-line sonarjs/sql-queries
      await pool.query(`DROP TABLE IF EXISTS ${t} CASCADE;`)
    }

    console.log('Dropping migration tracking table if exists: _migrations')
    await pool.query('DROP TABLE IF EXISTS _migrations CASCADE;')

    await pool.query('COMMIT')
    console.log('Database reset complete.')
  } catch (err) {
    console.error('Reset failed, rolling back...')
    console.error(err)
    await pool.query('ROLLBACK')
    process.exit(1)
  } finally {
    await pool.end()
    console.log('Database connection closed.')
  }
}

reset()
