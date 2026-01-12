'use client'

import { useOptimistic, useRef } from 'react'

import { createTask } from '@/features/projects/actions'
import type { getTasks } from '@/features/projects/data'
import TaskItem from '@/features/projects/TaskItem'

function CreateTaskForm({
  projectId,
  addTask,
}: {
  projectId: string
  addTask: (title: string) => void
}) {
  const formRef = useRef<HTMLFormElement>(null)

  const action = async (formData: FormData) => {
    const title = formData.get('title') as string
    addTask(title)
    formRef.current?.reset()
    await createTask(formData)
  }

  return (
    <form action={action} className="mb-6 flex items-center gap-2">
      <input name="projectId" type="hidden" value={projectId} />
      <input
        name="title"
        placeholder="New task title"
        className="grow rounded-md border border-gray-300 px-3 py-2 shadow-sm"
        required
      />
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Add Task
      </button>
    </form>
  )
}

export function TaskList({
  tasks,
  projectId,
}: {
  tasks: Awaited<ReturnType<typeof getTasks>>
  projectId: string
}) {
  const [optimisticTasks, addTask] = useOptimistic(
    tasks,
    (state, title: string) => [
      ...state,
      {
        id: crypto.randomUUID(),
        title,
        status: 'todo',
      },
    ],
  )

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">Tasks</h2>
      <CreateTaskForm projectId={projectId} addTask={addTask} />

      <ul className="space-y-4">
        {optimisticTasks.map((task) => (
          <TaskItem key={task.id} task={task} projectId={projectId} />
        ))}
        {optimisticTasks.length === 0 && (
          <p className="text-gray-500">No tasks yet. Add one to get started.</p>
        )}
      </ul>
    </div>
  )
}
