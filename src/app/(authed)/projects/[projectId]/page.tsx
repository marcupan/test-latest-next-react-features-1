import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense, use } from 'react'

import { getProject, getTasks } from '@/features/projects/data'
import { TaskList } from '@/features/projects/TaskList'
import ShareButton from '@/features/sharing/ShareButton'

type PageProps = {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectPage({ params }: PageProps) {
  const { projectId } = await params
  const projectPromise = getProject(projectId)
  const tasksPromise = getTasks(projectId)

  return (
    <div className="p-8">
      <Suspense fallback={<div>Loading project...</div>}>
        <ProjectDetails projectPromise={projectPromise} projectId={projectId} />
      </Suspense>

      <Suspense fallback={<div>Loading tasks...</div>}>
        <TaskSection tasksPromise={tasksPromise} projectId={projectId} />
      </Suspense>
    </div>
  )
}

function ProjectDetails({
  projectPromise,
  projectId,
}: {
  projectPromise: Promise<Awaited<ReturnType<typeof getProject>>>
  projectId: string
}) {
  const project = use(projectPromise)

  if (!project) {
    notFound()
  }

  return (
    <div className="mb-8 flex items-center justify-between">
      <h1 className="text-3xl font-bold">{project.name}</h1>
      <div className="flex items-center gap-4">
        <ShareButton projectId={projectId} />
        <Link href="/projects" className="text-blue-500 hover:underline">
          &larr; Back to all projects
        </Link>
      </div>
    </div>
  )
}

function TaskSection({
  tasksPromise,
  projectId,
}: {
  tasksPromise: Promise<Awaited<ReturnType<typeof getTasks>>>
  projectId: string
}) {
  const tasks = use(tasksPromise)

  return <TaskList tasks={tasks} projectId={projectId} />
}
