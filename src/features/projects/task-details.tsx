import { Suspense } from 'react'

import Attachments from '@/features/attachments/attachments'
import { getAttachments } from '@/features/attachments/data'
import Comments from '@/features/comments/comments'
import { getComments } from '@/features/comments/data'

import { getSession } from '@/lib/auth'

import { getTaskDetails } from './data'

export default async function TaskDetails({
  taskId,
  projectId,
}: {
  taskId: string
  projectId: string
}) {
  const task = await getTaskDetails(taskId, projectId)

  if (!task) {
    return <div>Task not found.</div>
  }

  const attachments = await getAttachments(taskId)
  const comments = await getComments(taskId)
  const session = await getSession()

  return (
    <div>
      <h1 className="text-2xl font-bold">{task.title}</h1>
      <div className="mt-4">
        <p>
          <strong>Status:</strong> {task.status}
        </p>
        <p>
          <strong>Project:</strong> {task.project_name}
        </p>
      </div>

      <hr className="my-6" />

      <Suspense fallback={<div>Loading attachments...</div>}>
        <Attachments taskId={taskId} attachments={attachments} />
      </Suspense>

      <hr className="my-6" />

      <Suspense fallback={<div>Loading comments...</div>}>
        <Comments
          taskId={taskId}
          comments={comments}
          user={session!.user}
          activeOrgId={session!.activeOrgId}
        />
      </Suspense>
    </div>
  )
}
