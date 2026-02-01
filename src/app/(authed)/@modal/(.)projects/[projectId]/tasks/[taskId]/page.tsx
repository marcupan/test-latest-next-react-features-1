import TaskModalContent from '@/features/projects/TaskModalContent'
import { Modal } from '@/shared/ui/modal'

type PageProps = {
  params: Promise<{
    taskId: string
    projectId: string
  }>
}

const TaskModal = async ({ params }: PageProps) => {
  const { taskId, projectId } = await params

  return (
    <Modal>
      <TaskModalContent taskId={taskId} projectId={projectId} />
    </Modal>
  )
}

export default TaskModal
