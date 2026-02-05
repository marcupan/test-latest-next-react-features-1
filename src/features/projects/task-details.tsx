import { Suspense } from 'react'

import Attachments from '@/features/attachments/attachments'
import { getAttachments } from '@/features/attachments/data'
import Comments from '@/features/comments/comments'
import { getComments } from '@/features/comments/data'
import { getSession } from '@/lib/auth'
import { CommentsSkeleton } from '@/shared/ui/Skeleton'

import { getTaskDetails } from './data'

const TaskDetails = async ({
  taskId,
  projectId,
}: {
  taskId: string
  projectId: string
}) => {
  const session = await getSession()

  if (!session) return <div>Task not found.</div>

  const [task, attachments, comments] = await Promise.all([
    getTaskDetails(taskId, projectId, session.activeOrgId),
    getAttachments(taskId, session.activeOrgId),
    getComments(taskId, session.activeOrgId),
  ])

  if (!task) {
    return <div>Task not found.</div>
  }

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

      <Attachments taskId={taskId} attachments={attachments} />

      <hr className="my-6" />

      <Suspense fallback={<CommentsSkeleton />}>
        <Comments
          taskId={taskId}
          comments={comments}
          user={session.user}
          activeOrgId={session.activeOrgId}
        />
      </Suspense>
    </div>
  )
}

export default TaskDetails
