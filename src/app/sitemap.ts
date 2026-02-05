import type { MetadataRoute } from 'next'

import { db } from '@/shared/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const projects = await db
    .selectFrom('projects')
    .select(['id', 'updated_at'])
    .execute()
  const tasks = await db
    .selectFrom('tasks')
    .select(['id', 'project_id', 'updated_at'])
    .execute()

  const projectUrls = projects.map((project) => ({
    url: `${appUrl}/projects/${project.id}`,
    lastModified: project.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const taskUrls = tasks.map((task) => ({
    url: `${appUrl}/projects/${task.project_id}/tasks/${task.id}`,
    lastModified: task.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${appUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    ...projectUrls,
    ...taskUrls,
  ]
}
