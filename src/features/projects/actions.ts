'use server'

import { unlink } from 'fs/promises'
import { revalidatePath, revalidateTag } from 'next/cache'
import { join } from 'path'

import { db } from '@/shared/db'
import { z } from 'zod'

import { recordAuditEvent } from '@/lib/audit-log'
import { checkPermission, getSession } from '@/lib/auth'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
})

export async function createProject(
  _prevState: { message?: z.ZodError | string },
  formData: FormData,
): Promise<{ message?: z.ZodError | string }> {
  const session = await getSession()

  if (!session) throw new Error('Not authenticated')

  await checkPermission(session.activeOrgId, 'create', 'project')

  const result = createProjectSchema.safeParse(
    Object.fromEntries(formData.entries()),
  )

  if (!result.success) {
    return { message: result.error }
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

  await recordAuditEvent({
    action: 'project.create',
    userId: user.id,
    orgId: activeOrgId,
    details: { projectId: newProject.id, name },
  })

  revalidateTag(`projects:${activeOrgId}`, 'standard')
  revalidateTag('projects', 'standard')
  revalidatePath('/projects')

  return {}
}

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  projectId: z.uuid(),
})

export async function createTask(formData: FormData) {
  const session = await getSession()

  if (!session) throw new Error('Not authenticated')

  const result = createTaskSchema.safeParse(
    Object.fromEntries(formData.entries()),
  )

  if (!result.success) {
    throw new Error('Invalid input')
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

  await recordAuditEvent({
    action: 'task.create',
    userId: user.id,
    orgId: activeOrgId,
    details: { taskId: newTask.id, title, projectId },
  })

  revalidateTag(`tasks:${projectId}`, 'standard')
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteTask(taskId: string) {
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

    for (const attachment of attachments) {
      await unlink(join(process.cwd(), 'uploads', attachment.storage_path))
    }

    await trx.deleteFrom('comments').where('task_id', '=', taskId).execute()
    await trx.deleteFrom('attachments').where('task_id', '=', taskId).execute()
    await trx.deleteFrom('tasks').where('id', '=', taskId).execute()
  })

  await recordAuditEvent({
    action: 'task.delete',
    userId: session.user.id,
    orgId: session.activeOrgId,
    details: { taskId },
  })

  revalidateTag(`tasks:${task.project_id}`, 'standard')
}

export async function deleteProject(projectId: string) {
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

    for (const task of tasks) {
      const attachments = await trx
        .selectFrom('attachments')
        .select('storage_path')
        .where('task_id', '=', task.id)
        .execute()

      for (const attachment of attachments) {
        await unlink(join(process.cwd(), 'uploads', attachment.storage_path))
      }
    }

    await trx.deleteFrom('projects').where('id', '=', projectId).execute()
  })

  await recordAuditEvent({
    action: 'project.delete',
    userId: session.user.id,
    orgId: session.activeOrgId,
    details: { projectId },
  })

  revalidateTag(`projects:${session.activeOrgId}`, 'standard')
  revalidateTag('projects', 'standard')
}
