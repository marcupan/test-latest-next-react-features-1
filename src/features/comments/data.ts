import { unstable_cache as next_cache } from 'next/cache'
import { cache } from 'react'

import { db } from '@/shared/db'

import { getSession } from '@/lib/auth'

export const getComments = cache(async (taskId: string) => {
  const session = await getSession()
  if (!session) return []

  const comments = await next_cache(
    async () => {
      const rows = await db
        .selectFrom('comments as c')
        .innerJoin('users as u', 'c.user_id', 'u.id')
        .where('c.task_id', '=', taskId)
        .where('c.organization_id', '=', session.activeOrgId)
        .orderBy('c.created_at', 'asc')
        .select(['c.id', 'c.body', 'c.created_at', 'u.email as author_email'])
        .execute()

      return rows.map((row) => ({
        ...row,
        created_at: row.created_at.toISOString(),
      }))
    },
    [`comments:${taskId}`],
    { tags: [`comments:${taskId}`] },
  )()

  return comments
})
