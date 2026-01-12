import { db } from '@/shared/db'

type AuditLogPayload = {
  action: string
  userId?: string
  orgId?: string
  details?: Record<string, unknown>
}

export async function recordAuditEvent(payload: AuditLogPayload) {
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
    // In a real production system, you'd want to handle this failure gracefully.
    // Maybe log to a different system or have a fallback.
    console.error('Failed to record audit event:', error)
  }
}
