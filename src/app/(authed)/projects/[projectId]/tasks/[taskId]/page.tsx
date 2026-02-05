import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { getTaskDetails } from '@/features/projects/data'
import TaskDetails from '@/features/projects/task-details'
import { getSession } from '@/lib/auth'

type PageProps = {
  params: {
    projectId: string
    taskId: string
  }
}

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const session = await getSession()

  if (!session) return { title: 'Task' }

  const task = await getTaskDetails(
    params.taskId,
    params.projectId,
    session.activeOrgId,
  )

  return {
    title: task?.title || 'Task',
  }
}

const TaskPage = async ({ params }: PageProps) => {
  const { taskId, projectId } = params

  const session = await getSession()
  if (!session) return <div>Task not found.</div>

  const task = await getTaskDetails(taskId, projectId, session.activeOrgId)

  if (!task) {
    return <div>Task not found.</div>
  }

  return (
    <div className="p-8">
      <Link
        href={`/projects/${task.project_id}`}
        className="mb-8 block text-blue-500 hover:underline"
      >
        &larr; Back to project
      </Link>
      <div className="rounded-lg bg-white p-8 shadow-md">
        <Suspense fallback={<div>Loading task...</div>}>
          <TaskDetails taskId={taskId} projectId={task.project_id} />
        </Suspense>
      </div>
    </div>
  )
}

export default TaskPage
