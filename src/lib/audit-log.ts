import 'server-only'

import { after } from 'next/server'

import { db } from '@/shared/db'

type AuditLogPayload = {
  action: string
  userId?: string
  orgId?: string
  details?: Record<string, unknown>
}

export const recordAuditEvent = (payload: AuditLogPayload) => {
  after(async () => {
    try {
      await db
        .insertInto('audit_log')
        .values({
          action: payload.action,
          user_id: payload.userId,
          organization_id: payload.orgId,
          payload: payload.details ? JSON.stringify(payload.details) : null,
        })
        .execute()
    } catch (error) {
      console.error('Failed to record audit event:', error)
    }
  })
}
