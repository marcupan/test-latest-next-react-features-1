import { ProjectHeaderSkeleton, TaskListSkeleton } from '@/shared/ui/Skeleton'

const Loading = () => {
  return (
    <div className="p-8">
      <ProjectHeaderSkeleton />
      <TaskListSkeleton />
    </div>
  )
}

export default Loading
