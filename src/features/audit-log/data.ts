import { cacheTag } from 'next/cache'

import { db } from '@/shared/db'
import type { AuditLog } from '@/shared/types'

export const getAuditLog = async (orgId: string) => {
  'use cache'

  cacheTag(`audit_log:${orgId}`)

  const rows = await db
    .selectFrom('audit_log as al')
    .innerJoin('users as u', 'al.user_id', 'u.id')
    .where('al.organization_id', '=', orgId)
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
}
