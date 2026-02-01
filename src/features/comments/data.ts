import { cacheTag } from 'next/cache'

import { getSession } from '@/lib/auth'
import { db } from '@/shared/db'

export const getComments = async (taskId: string) => {
  'use cache'

  const session = await getSession()
  if (!session) return []

  cacheTag(`comments:${taskId}`, `org:${session.activeOrgId}`)

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
}
