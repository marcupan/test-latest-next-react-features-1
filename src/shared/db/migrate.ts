/* eslint-disable no-console */

import fs from 'fs/promises'
import path from 'path'

import dotenv from 'dotenv'
import { Pool } from 'pg'

// Load environment variables from .env then .env.local (without overriding already-set vars)
dotenv.config()
dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
  override: false,
})

// In ESM/bundler environments __dirname may be undefined; prefer cwd-based path.
const MIGRATIONS_DIR = path.resolve(process.cwd(), 'src/shared/db/migrations')

async function runMigrations() {
  console.log('Connecting to database...')

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  })

  try {
    // Log effective connection details to avoid environment mismatches
    const info = await pool.query(
      'SELECT current_database() AS db, current_user AS user',
    )
    const sp = await pool.query('SHOW search_path')

    console.log(
      `Connected to db=${info.rows[0].db} user=${info.rows[0].user} search_path=${sp.rows?.[0]?.search_path}`,
    )

    await pool.query('BEGIN')

    // Create a migrations table if it doesn't exist
    await pool.query(`
            CREATE TABLE IF NOT EXISTS _migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `)

    // Get already run migrations
    const { rows: runMigrations } = await pool.query(
      'SELECT name FROM _migrations',
    )
    const runMigrationNames = new Set(runMigrations.map((r) => r.name))
    console.log(`Found ${runMigrationNames.size} existing migrations.`)

    // Get migration files
    const migrationFiles = await fs.readdir(MIGRATIONS_DIR)
    const pendingMigrations = migrationFiles
      .filter((file) => file.endsWith('.sql'))
      .filter((file) => !runMigrationNames.has(file))
      .sort()

    if (pendingMigrations.length === 0) {
      console.log('No new migrations to run. Database is up to date.')
      await pool.query('COMMIT')
      return
    }

    console.log(
      `Found ${pendingMigrations.length} pending migrations. Running now...`,
    )

    for (const migrationFile of pendingMigrations) {
      console.log(`- Running ${migrationFile}...`)
      try {
        const sql = await fs.readFile(
          path.join(MIGRATIONS_DIR, migrationFile),
          'utf-8',
        )
        await pool.query(sql)
        await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [
          migrationFile,
        ])
        console.log(`  ...${migrationFile} finished.`)
      } catch (e) {
        console.error(`  ...ERROR in ${migrationFile}:`, e)
        throw e
      }
    }

    await pool.query('COMMIT')
    console.log('All migrations completed successfully!')
  } catch (error) {
    console.error('Migration failed!')
    console.error(error)
    await pool.query('ROLLBACK')
    process.exit(1)
  } finally {
    await pool.end()
    console.log('Database connection closed.')
  }
}

runMigrations()
