import { cacheTag } from 'next/cache'

import { db } from '@/shared/db'

export const getProjects = async (orgId: string) => {
  'use cache'

  cacheTag('projects', `projects:${orgId}`)

  return db
    .selectFrom('projects')
    .select(['id', 'name'])
    .where('organization_id', '=', orgId)
    .orderBy('created_at', 'desc')
    .execute()
}

export const getProject = async (projectId: string, orgId: string) => {
  'use cache'

  cacheTag(`project:${projectId}`, `projects:${orgId}`)

  const project = await db
    .selectFrom('projects')
    .select(['id', 'name'])
    .where('id', '=', projectId)
    .where('organization_id', '=', orgId)
    .executeTakeFirst()

  return project || null
}

export const getTasks = async (projectId: string, orgId: string) => {
  'use cache'

  cacheTag(`tasks:${projectId}`, `project:${projectId}`)

  return db
    .selectFrom('tasks')
    .select(['id', 'title', 'status'])
    .where('project_id', '=', projectId)
    .where('organization_id', '=', orgId)
    .orderBy('created_at', 'asc')
    .execute()
}

export const getTaskDetails = async (
  taskId: string,
  projectId: string,
  orgId: string,
) => {
  'use cache'

  cacheTag(`task:${taskId}`, `tasks:${projectId}`)

  return db
    .selectFrom('tasks as t')
    .innerJoin('projects as p', 't.project_id', 'p.id')
    .where('t.id', '=', taskId)
    .where('t.organization_id', '=', orgId)
    .select([
      't.id',
      't.title',
      't.status',
      'p.name as project_name',
      't.project_id',
    ])
    .executeTakeFirst()
}
