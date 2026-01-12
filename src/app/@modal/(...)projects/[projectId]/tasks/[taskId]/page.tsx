import { Modal } from '@/shared/ui/modal'
import TaskModalContent from '@/features/projects/TaskModalContent'

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
      <TaskModalContent taskId={taskId} projectId={projectId} />
    </Modal>
  )
}
