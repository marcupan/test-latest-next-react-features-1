import { cacheTag } from 'next/cache'

import { db } from '@/shared/db'

export const getComments = async (taskId: string, orgId: string) => {
  'use cache'

  cacheTag(`comments:${taskId}`, `org:${orgId}`)

  const rows = await db
    .selectFrom('comments as c')
    .innerJoin('users as u', 'c.user_id', 'u.id')
    .where('c.task_id', '=', taskId)
    .where('c.organization_id', '=', orgId)
    .orderBy('c.created_at', 'asc')
    .select(['c.id', 'c.body', 'c.created_at', 'u.email as author_email'])
    .execute()

  return rows.map((row) => ({
    ...row,
    created_at: row.created_at.toISOString(),
  }))
}
