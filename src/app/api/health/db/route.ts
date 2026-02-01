import { NextResponse } from 'next/server'

import { sql } from 'kysely'

import { db } from '@/shared/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface SearchPathRow {
  search_path: string
}

export async function GET() {
  try {
    const a = await sql<{
      db: string
      user: string
    }>`SELECT current_database() AS db, current_user AS "user"`.execute(db)
    const b = await sql`SHOW search_path`.execute(db)
    const c = await sql<{
      users_tables: number
    }>`SELECT count(*)::int AS users_tables FROM information_schema.tables WHERE table_name='users'`.execute(
      db,
    )

    const masked = process.env.POSTGRES_URL?.replace(
      /:\/\/.+@/,
      '://***:***@',
    )?.slice(0, 120)

    return NextResponse.json({
      envUrlPrefix: masked,
      runtime: {
        db: a.rows?.[0]?.db ?? null,
        user: a.rows?.[0]?.user ?? null,
        search_path: (b.rows?.[0] as SearchPathRow)?.search_path ?? null,
        users_tables: c.rows?.[0]?.users_tables ?? null,
      },
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
