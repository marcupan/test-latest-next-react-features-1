'use server'

import { unlink } from 'fs/promises'
import { revalidateTag } from 'next/cache'
import { join } from 'path'

import { db } from '@/shared/db'

import { recordAuditEvent } from '@/lib/audit-log'
import { checkPermission, getSession } from '@/lib/auth'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export async function deleteAttachment(attachmentId: string) {
  const session = await getSession()
  if (!session) throw new Error('Not authenticated')

  const attachment = await db
    .selectFrom('attachments')
    .select(['id', 'task_id', 'storage_path', 'organization_id'])
    .where('id', '=', attachmentId)
    .executeTakeFirst()

  if (!attachment) {
    throw new Error('Attachment not found')
  }

  if (attachment.organization_id !== session.activeOrgId) {
    throw new Error('Forbidden')
  }

  await checkPermission(session.activeOrgId, 'delete', 'attachment')

  await unlink(join(UPLOAD_DIR, attachment.storage_path))

  await db.deleteFrom('attachments').where('id', '=', attachmentId).execute()

  await recordAuditEvent({
    action: 'attachment.delete',
    userId: session.user.id,
    orgId: session.activeOrgId,
    details: { attachmentId },
  })

  revalidateTag(`attachments:${attachment.task_id}`, 'standard')
}
