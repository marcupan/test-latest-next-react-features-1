import { Suspense } from 'react'

import TaskDetails from '@/features/projects/task-details'

type TaskModalContentProps = {
  taskId: string
  projectId: string
}

const TaskModalContent = ({ taskId, projectId }: TaskModalContentProps) => {
  return (
    <Suspense fallback={<div>Loading task...</div>}>
      <TaskDetails taskId={taskId} projectId={projectId} />
    </Suspense>
  )
}

export default TaskModalContent
