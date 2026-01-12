import { Suspense } from 'react'
import TaskDetails from '@/features/projects/task-details'
import { Modal } from '@/shared/ui/modal'

type PageProps = {
  params: Promise<{
    taskId: string
    projectId: string
  }>
}

export default async function TaskModal({ params }: PageProps) {
  const { taskId, projectId } = await params

  return (
    <Modal>
      <Suspense fallback={<div>Loading task...</div>}>
        <TaskDetails taskId={taskId} projectId={projectId} />
      </Suspense>
    </Modal>
  )
}
