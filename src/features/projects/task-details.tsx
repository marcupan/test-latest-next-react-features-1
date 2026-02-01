import dynamic from 'next/dynamic'
import { Suspense } from 'react'

import { getAttachments } from '@/features/attachments/data'
import Comments from '@/features/comments/comments'
import { getComments } from '@/features/comments/data'
import { AttachmentsSkeleton, CommentsSkeleton } from '@/shared/ui/Skeleton'

import { getSession } from '@/lib/auth'

import { getTaskDetails } from './data'

const Attachments = dynamic(
  () => import('@/features/attachments/attachments'),
  {
    loading: () => <AttachmentsSkeleton />,
    ssr: false,
  },
)

const TaskDetails = async ({
  taskId,
  projectId,
}: {
  taskId: string
  projectId: string
}) => {
  const [task, attachments, comments, session] = await Promise.all([
    getTaskDetails(taskId, projectId),
    getAttachments(taskId),
    getComments(taskId),
    getSession(),
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
          user={session!.user}
          activeOrgId={session!.activeOrgId}
        />
      </Suspense>
    </div>
  )
}

export default TaskDetails
