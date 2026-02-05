'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { recordAuditEvent } from '@/lib/audit-log'
import { checkPermission, getSession } from '@/lib/auth'
import { db } from '@/shared/db'

const addCommentSchema = z.object({
  body: z.string().min(1, 'Comment body cannot be empty'),
  taskId: z.uuid(),
})

export const addComment = async (
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> => {
  const session = await getSession()

  if (!session) return { error: 'Not authenticated' }

  const result = addCommentSchema.safeParse(
    Object.fromEntries(formData.entries()),
  )

  if (!result.success) {
    return { error: 'Invalid input' }
  }

  const { taskId, body } = result.data
  const { activeOrgId, user } = session

  try {
    await checkPermission(activeOrgId, 'create', 'comment')

    const task = await db
      .selectFrom('tasks')
      .select(['id', 'project_id'])
      .where('id', '=', taskId)
      .where('organization_id', '=', activeOrgId)
      .executeTakeFirst()

    if (!task) {
      return { error: 'Task not found' }
    }
    const { project_id } = task

    const newComment = await db
      .insertInto('comments')
      .values({
        body,
        task_id: taskId,
        user_id: user.id,
        organization_id: activeOrgId,
      })
      .returning('id')
      .executeTakeFirstOrThrow()

    recordAuditEvent({
      action: 'comment.create',
      userId: user.id,
      orgId: activeOrgId,
      details: { commentId: newComment.id, taskId, projectId: project_id },
    })

    updateTag(`comments:${taskId}`)
    updateTag(`audit_log:${activeOrgId}`)
    return {}
  } catch (e: unknown) {
    return {
      error: e instanceof Error ? e.message : 'An unknown error occurred',
    }
  }
}

export const deleteComment = async (commentId: string) => {
  const session = await getSession()

  if (!session) throw new Error('Not authenticated')

  const comment = await db
    .selectFrom('comments')
    .select(['id', 'task_id', 'organization_id'])
    .where('id', '=', commentId)
    .executeTakeFirst()

  if (!comment) {
    throw new Error('Comment not found')
  }

  if (comment.organization_id !== session.activeOrgId) {
    throw new Error('Forbidden')
  }

  await checkPermission(session.activeOrgId, 'delete', 'comment')

  await db.deleteFrom('comments').where('id', '=', commentId).execute()

  recordAuditEvent({
    action: 'comment.delete',
    userId: session.user.id,
    orgId: session.activeOrgId,
    details: { commentId },
  })

  updateTag(`comments:${comment.task_id}`)
  updateTag(`audit_log:${session.activeOrgId}`)
}
