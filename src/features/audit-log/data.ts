import { unstable_cache as next_cache } from 'next/cache'
import { cache } from 'react'

import { getSession } from '@/lib/auth'
import { db } from '@/shared/db'
import type { AuditLog } from '@/shared/types'

export const getAuditLog = cache(async () => {
  const session = await getSession()

  if (!session) return []

  return await next_cache(
    async () => {
      const rows = await db
        .selectFrom('audit_log as al')
        .innerJoin('users as u', 'al.user_id', 'u.id')
        .where('al.organization_id', '=', session.activeOrgId)
        .select([
          'al.id',
          'al.action',
          'al.created_at',
          'u.email as user_email',
          'al.payload',
        ])
        .orderBy('al.created_at', 'desc')
        .limit(100)
        .execute()

      return rows as unknown as AuditLog[]
    },
    [`audit_log:${session.activeOrgId}`],
    { tags: [`audit_log:${session.activeOrgId}`] },
  )()
})
