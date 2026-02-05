import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense, use } from 'react'

import { getProject, getTasks } from '@/features/projects/data'
import { TaskList } from '@/features/projects/TaskList'
import ShareButton from '@/features/sharing/ShareButton'
import { checkPermission, getSession } from '@/lib/auth'
import { ProjectHeaderSkeleton, TaskListSkeleton } from '@/shared/ui/Skeleton'

type PageProps = {
  params: Promise<{
    projectId: string
  }>
}

const ProjectPage = async ({ params }: PageProps) => {
  const { projectId } = await params

  const session = await getSession()

  if (!session) return null

  await checkPermission(session.activeOrgId, 'read', {
    type: 'project',
    id: projectId,
  })

  const projectPromise = getProject(projectId, session.activeOrgId)
  const tasksPromise = getTasks(projectId, session.activeOrgId)

  return (
    <div className="p-8">
      <Suspense fallback={<ProjectHeaderSkeleton />}>
        <ProjectDetails projectPromise={projectPromise} projectId={projectId} />
      </Suspense>

      <Suspense fallback={<TaskListSkeleton />}>
        <TaskSection tasksPromise={tasksPromise} projectId={projectId} />
      </Suspense>
    </div>
  )
}

const ProjectDetails = ({
  projectPromise,
  projectId,
}: {
  projectPromise: Promise<Awaited<ReturnType<typeof getProject>>>
  projectId: string
}) => {
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

const TaskSection = ({
  tasksPromise,
  projectId,
}: {
  tasksPromise: Promise<Awaited<ReturnType<typeof getTasks>>>
  projectId: string
}) => {
  const tasks = use(tasksPromise)

  return <TaskList tasks={tasks} projectId={projectId} />
}

export default ProjectPage
