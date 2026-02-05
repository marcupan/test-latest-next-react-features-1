import { cacheTag } from 'next/cache'

import { db } from '@/shared/db'

export const getAttachments = async (taskId: string, orgId: string) => {
  'use cache'

  cacheTag(`attachments:${taskId}`, `org:${orgId}`)

  const rows = await db
    .selectFrom('attachments')
    .select(['id', 'filename', 'file_type'])
    .where('task_id', '=', taskId)
    .where('organization_id', '=', orgId)
    .orderBy('created_at', 'desc')
    .execute()

  return rows as Array<{ id: string; filename: string; file_type: string }>
}
