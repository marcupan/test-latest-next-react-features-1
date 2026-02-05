'use server'

import { unlink } from 'fs/promises'
import { revalidatePath, updateTag } from 'next/cache'
import { join } from 'path'
import { z } from 'zod'

import { recordAuditEvent } from '@/lib/audit-log'
import { checkPermission, getSession } from '@/lib/auth'
import { db } from '@/shared/db'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
})

export const createProject = async (
  _prevState: { message?: string },
  formData: FormData,
): Promise<{ message?: string }> => {
  const session = await getSession()

  if (!session) throw new Error('Not authenticated')

  await checkPermission(session.activeOrgId, 'create', 'project')

  const result = createProjectSchema.safeParse(
    Object.fromEntries(formData.entries()),
  )

  if (!result.success) {
    return { message: result.error.issues[0]?.message || 'Invalid input' }
  }

  const { name } = result.data
  const { activeOrgId, user } = session

  const newProject = await db
    .insertInto('projects')
    .values({
      name,
      organization_id: activeOrgId,
      created_by_id: user.id,
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  recordAuditEvent({
    action: 'project.create',
    userId: user.id,
    orgId: activeOrgId,
    details: { projectId: newProject.id, name },
  })

  updateTag(`projects:${activeOrgId}`)
  updateTag('projects')
  updateTag(`audit_log:${activeOrgId}`)
  revalidatePath('/projects')

  return {}
}

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  projectId: z.uuid(),
})

export const createTask = async (formData: FormData) => {
  const session = await getSession()

  if (!session) throw new Error('Not authenticated')

  const result = createTaskSchema.safeParse(
    Object.fromEntries(formData.entries()),
  )

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || 'Invalid input')
  }

  const { projectId, title } = result.data
  const { activeOrgId, user } = session

  await checkPermission(activeOrgId, 'create', { type: 'task', id: '' })

  // Verify the project belongs to the user's organization
  const project = await db
    .selectFrom('projects')
    .select('id')
    .where('id', '=', projectId)
    .where('organization_id', '=', activeOrgId)
    .executeTakeFirst()

  if (!project) {
    throw new Error('Project not found')
  }

  const newTask = await db
    .insertInto('tasks')
    .values({
      title,
      project_id: projectId,
      organization_id: activeOrgId,
      created_by_id: user.id,
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  recordAuditEvent({
    action: 'task.create',
    userId: user.id,
    orgId: activeOrgId,
    details: { taskId: newTask.id, title, projectId },
  })

  updateTag(`tasks:${projectId}`)
  updateTag(`audit_log:${activeOrgId}`)
  revalidatePath(`/projects/${projectId}`)
}

export const deleteTask = async (taskId: string) => {
  const session = await getSession()

  if (!session) throw new Error('Not authenticated')

  const task = await db
    .selectFrom('tasks')
    .select(['project_id', 'organization_id'])
    .where('id', '=', taskId)
    .executeTakeFirst()

  if (!task) {
    throw new Error('Task not found')
  }

  if (task.organization_id !== session.activeOrgId) {
    throw new Error('Forbidden')
  }

  await checkPermission(session.activeOrgId, 'delete', {
    type: 'task',
    id: taskId,
  })

  await db.transaction().execute(async (trx) => {
    const attachments = await trx
      .selectFrom('attachments')
      .select('storage_path')
      .where('task_id', '=', taskId)
      .execute()

    await Promise.all(
      attachments.map((attachment) =>
        unlink(join(process.cwd(), 'uploads', attachment.storage_path)).catch(
          (err) => {
            console.error(
              'Failed to delete file:',
              attachment.storage_path,
              err,
            )
          },
        ),
      ),
    )

    await trx.deleteFrom('comments').where('task_id', '=', taskId).execute()
    await trx.deleteFrom('attachments').where('task_id', '=', taskId).execute()
    await trx.deleteFrom('tasks').where('id', '=', taskId).execute()
  })

  recordAuditEvent({
    action: 'task.delete',
    userId: session.user.id,
    orgId: session.activeOrgId,
    details: { taskId },
  })

  updateTag(`tasks:${task.project_id}`)
  updateTag(`audit_log:${session.activeOrgId}`)
}

export const deleteProject = async (projectId: string) => {
  const session = await getSession()

  if (!session) throw new Error('Not authenticated')

  const project = await db
    .selectFrom('projects')
    .select(['id', 'organization_id'])
    .where('id', '=', projectId)
    .executeTakeFirst()

  if (!project) {
    throw new Error('Project not found')
  }

  if (project.organization_id !== session.activeOrgId) {
    throw new Error('Forbidden')
  }

  await checkPermission(session.activeOrgId, 'delete', 'project')

  await db.transaction().execute(async (trx) => {
    const tasks = await trx
      .selectFrom('tasks')
      .select('id')
      .where('project_id', '=', projectId)
      .execute()

    const allAttachments = await trx
      .selectFrom('attachments')
      .select('storage_path')
      .where(
        'task_id',
        'in',
        tasks.map((t) => t.id),
      )
      .execute()

    await Promise.all(
      allAttachments.map((attachment) =>
        unlink(join(process.cwd(), 'uploads', attachment.storage_path)).catch(
          (err) => {
            console.error(
              'Failed to delete file:',
              attachment.storage_path,
              err,
            )
          },
        ),
      ),
    )

    await trx.deleteFrom('projects').where('id', '=', projectId).execute()
  })

  recordAuditEvent({
    action: 'project.delete',
    userId: session.user.id,
    orgId: session.activeOrgId,
    details: { projectId },
  })

  updateTag(`projects:${session.activeOrgId}`)
  updateTag('projects')
  updateTag(`audit_log:${session.activeOrgId}`)
}
