import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'

import { getSession } from '@/lib/auth'
import { db } from '@/shared/db'

const getOneWeekAgo = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

const DashboardPage = async () => {
  const session = await getSession()

  if (!session) return null

  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>
      <p className="mb-8 text-gray-600">
        Welcome to your secure workspace, {session.user.email}
      </p>

      {/* Nested Suspense Boundaries for Progressive Loading */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Widget 1: Projects Stats - Loads first */}
        <Suspense fallback={<WidgetSkeleton title="Projects" />}>
          <ProjectsWidget orgId={session.activeOrgId} />
        </Suspense>

        {/* Widget 2: Tasks Stats - Loads independently */}
        <Suspense fallback={<WidgetSkeleton title="Tasks" />}>
          <TasksWidget orgId={session.activeOrgId} />
        </Suspense>

        {/* Widget 3: Recent Activity - Loads last */}
        <Suspense fallback={<WidgetSkeleton title="Recent Activity" />}>
          <ActivityWidget orgId={session.activeOrgId} />
        </Suspense>
      </div>
    </div>
  )
}

// Widget Skeleton - Shows while content loads
const WidgetSkeleton = ({ title }: { title: string }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      <div className="animate-pulse space-y-3">
        <div className="h-4 rounded bg-gray-200" />
        <div className="h-4 rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  )
}

// Projects Widget - Cached with Next.js 16 'use cache'
const ProjectsWidget = async ({ orgId }: { orgId: string }) => {
  'use cache'
  // 'dashboard:orgId' is invalidated on every project/task mutation.
  // Widget-specific tags ('dashboard-projects' etc.) are reserved for future per-widget invalidation.
  cacheTag('dashboard-projects', `dashboard:${orgId}`)
  cacheLife('minutes')

  // getOneWeekAgo() is called at cache-population time and baked into the cached result.
  // With cacheLife('minutes'), this boundary can be up to a few minutes stale — acceptable for a dashboard metric.
  const oneWeekAgo = getOneWeekAgo()
  const stats = await db
    .selectFrom('projects')
    .select([
      (eb) => eb.fn.countAll<number>().as('total'),
      (eb) =>
        eb.fn
          .count<number>('id')
          .filterWhere('created_at', '>', oneWeekAgo)
          .as('recent'),
    ])
    .where('organization_id', '=', orgId)
    .executeTakeFirst()

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Projects</h3>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-indigo-600">
          {stats?.total || 0}
        </p>
        <p className="text-sm text-gray-500">
          {stats?.recent || 0} created this week
        </p>
      </div>
    </div>
  )
}

// Tasks Widget - Cached with Next.js 16 'use cache'
const TasksWidget = async ({ orgId }: { orgId: string }) => {
  'use cache'
  // 'dashboard:orgId' is invalidated on every project/task mutation.
  // Widget-specific tags are reserved for future per-widget invalidation.
  cacheTag('dashboard-tasks', `dashboard:${orgId}`)
  cacheLife('minutes')

  const stats = await db
    .selectFrom('tasks')
    .innerJoin('projects', 'projects.id', 'tasks.project_id')
    .select([
      (eb) => eb.fn.countAll<number>().as('total'),
      (eb) =>
        eb.fn
          .count<number>('tasks.id')
          .filterWhere('tasks.status', '=', 'pending')
          .as('pending'),
      (eb) =>
        eb.fn
          .count<number>('tasks.id')
          .filterWhere('tasks.status', '=', 'completed')
          .as('completed'),
    ])
    .where('projects.organization_id', '=', orgId)
    .executeTakeFirst()

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Tasks</h3>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-green-600">{stats?.total || 0}</p>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{stats?.pending || 0} pending</span>
          <span>{stats?.completed || 0} completed</span>
        </div>
      </div>
    </div>
  )
}

// Activity Widget - Cached with short TTL (more time-sensitive)
const ActivityWidget = async ({ orgId }: { orgId: string }) => {
  'use cache'
  // 'dashboard:orgId' is invalidated on every project/task mutation.
  // Widget-specific tags are reserved for future per-widget invalidation.
  cacheTag('dashboard-activity', `dashboard:${orgId}`)
  cacheLife('seconds')

  const recentEvents = await db
    .selectFrom('audit_log')
    .select(['action', 'created_at'])
    .where('organization_id', '=', orgId)
    .orderBy('created_at', 'desc')
    .limit(5)
    .execute()

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Recent Activity
      </h3>
      {recentEvents.length === 0 ? (
        <p className="text-sm text-gray-500">No recent activity</p>
      ) : (
        <ul className="space-y-2">
          {recentEvents.map((event, index) => (
            <li key={index} className="text-sm">
              <span className="font-medium text-gray-700">
                {event.action.replace(/_/g, ' ')}
              </span>
              <span className="ml-2 text-gray-500">
                {new Date(event.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DashboardPage
