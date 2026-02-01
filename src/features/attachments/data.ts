import { cacheTag } from 'next/cache'

import { getSession } from '@/lib/auth'
import { db } from '@/shared/db'

export const getAttachments = async (taskId: string) => {
  'use cache'

  const session = await getSession()
  if (!session) return []

  cacheTag(`attachments:${taskId}`, `org:${session.activeOrgId}`)

  const rows = await db
    .selectFrom('attachments')
    .select(['id', 'filename', 'file_type'])
    .where('task_id', '=', taskId)
    .where('organization_id', '=', session.activeOrgId)
    .orderBy('created_at', 'desc')
    .execute()

  return rows as Array<{ id: string; filename: string; file_type: string }>
}
