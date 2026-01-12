import { unstable_cache as next_cache } from 'next/cache'
import { cache } from 'react'

import { db } from '@/shared/db'

import { checkPermission, getSession } from '@/lib/auth'

export const getProjects = cache(async () => {
  const session = await getSession()

  if (!session) return []

  await checkPermission(session.activeOrgId, 'read', 'project')

  return await next_cache(
    async () => {
      return db
        .selectFrom('projects')
        .select(['id', 'name'])
        .where('organization_id', '=', session.activeOrgId)
        .orderBy('created_at', 'desc')
        .execute()
    },
    [`projects:${session.activeOrgId}`],
    { tags: [`projects:${session.activeOrgId}`] },
  )()
})

export const getProject = cache(async (projectId: string) => {
  const session = await getSession()

  if (!session) return null

  await checkPermission(session.activeOrgId, 'read', {
    type: 'project',
    id: projectId,
  })

  return await next_cache(
    async () => {
      return db
        .selectFrom('projects')
        .select(['id', 'name'])
        .where('id', '=', projectId)
        .where('organization_id', '=', session.activeOrgId)
        .executeTakeFirst()
    },
    [`project:${projectId}`],
    { tags: [`project:${projectId}`] },
  )()
})

export const getTasks = cache(async (projectId: string) => {
  const session = await getSession()

  if (!session) return []

  await checkPermission(session.activeOrgId, 'read', {
    type: 'project',
    id: projectId,
  })

  return await next_cache(
    async () => {
      return db
        .selectFrom('tasks')
        .select(['id', 'title', 'status'])
        .where('project_id', '=', projectId)
        .where('organization_id', '=', session.activeOrgId)
        .orderBy('created_at', 'asc')
        .execute()
    },
    [`tasks:${projectId}`],
    { tags: [`tasks:${projectId}`] },
  )()
})

export const getTaskDetails = cache(
  async (taskId: string, projectId: string) => {
    const session = await getSession()

    if (!session) return null

    await checkPermission(session.activeOrgId, 'read', {
      type: 'project',
      id: projectId,
    })

    return await next_cache(
      async () => {
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
      },
      [`task:${taskId}`],
      { tags: [`task:${taskId}`] },
    )()
  },
)
