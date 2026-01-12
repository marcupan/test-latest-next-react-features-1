import { unstable_cache as next_cache } from 'next/cache'
import { cache } from 'react'

import { db } from '@/shared/db'

import { getSession } from '@/lib/auth'

export const getAttachments = cache(async (taskId: string) => {
  const session = await getSession()
  if (!session) return []

  const attachments = await next_cache(
    async () => {
      const rows = await db
        .selectFrom('attachments')
        .select(['id', 'filename', 'file_type'])
        .where('task_id', '=', taskId)
        .where('organization_id', '=', session.activeOrgId)
        .orderBy('created_at', 'desc')
        .execute()

      return rows as Array<{ id: string; filename: string; file_type: string }>
    },
    [`attachments:${taskId}`],
    { tags: [`attachments:${taskId}`] },
  )()

  return attachments
})
