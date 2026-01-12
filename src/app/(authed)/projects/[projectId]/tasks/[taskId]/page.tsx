import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { getTaskDetails } from '@/features/projects/data'
import TaskDetails from '@/features/projects/task-details'

type PageProps = {
  params: {
    projectId: string
    taskId: string
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const task = await getTaskDetails(params.taskId, params.projectId)

  return {
    title: task?.title || 'Task',
  }
}

export default async function TaskPage({ params }: PageProps) {
  const { taskId, projectId } = params
  const task = await getTaskDetails(taskId, projectId)

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
