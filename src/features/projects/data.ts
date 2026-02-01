import { cacheTag } from 'next/cache'

import { db } from '@/shared/db'

import { checkPermission, getSession } from '@/lib/auth'

export const getProjects = async () => {
  'use cache'

  const session = await getSession()
  if (!session) return []

  await checkPermission(session.activeOrgId, 'read', 'project')

  cacheTag('projects', `projects:${session.activeOrgId}`)

  return db
    .selectFrom('projects')
    .select(['id', 'name'])
    .where('organization_id', '=', session.activeOrgId)
    .orderBy('created_at', 'desc')
    .execute()
}

export const getProject = async (projectId: string) => {
  'use cache'

  const session = await getSession()
  if (!session) return null

  await checkPermission(session.activeOrgId, 'read', {
    type: 'project',
    id: projectId,
  })

  cacheTag(`project:${projectId}`, `projects:${session.activeOrgId}`)

  const project = await db
    .selectFrom('projects')
    .select(['id', 'name'])
    .where('id', '=', projectId)
    .where('organization_id', '=', session.activeOrgId)
    .executeTakeFirst()

  return project || null
}

export const getTasks = async (projectId: string) => {
  'use cache'

  const session = await getSession()
  if (!session) return []

  await checkPermission(session.activeOrgId, 'read', {
    type: 'project',
    id: projectId,
  })

  cacheTag(`tasks:${projectId}`, `project:${projectId}`)

  return db
    .selectFrom('tasks')
    .select(['id', 'title', 'status'])
    .where('project_id', '=', projectId)
    .where('organization_id', '=', session.activeOrgId)
    .orderBy('created_at', 'asc')
    .execute()
}

export const getTaskDetails = async (taskId: string, projectId: string) => {
  'use cache'

  const session = await getSession()
  if (!session) return null

  await checkPermission(session.activeOrgId, 'read', {
    type: 'project',
    id: projectId,
  })

  cacheTag(`task:${taskId}`, `tasks:${projectId}`)

  return db
    .selectFrom('tasks as t')
    .innerJoin('projects as p', 't.project_id', 'p.id')
    .where('t.id', '=', taskId)
    .where('t.organization_id', '=', session.activeOrgId)
    .select([
      't.id',
      't.title',
      't.status',
      'p.name as project_name',
      't.project_id',
    ])
    .executeTakeFirst()
}
