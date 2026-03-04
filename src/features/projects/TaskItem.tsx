'use client'

import Link from 'next/link'
import { memo, useTransition } from 'react'

import { deleteTask } from './actions'

const TaskItem = ({
  task,
  projectId,
}: {
  task: { id: string; title: string; status: string }
  projectId: string
}) => {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (
      window.confirm(
        'Are you sure you want to delete this task? This will also delete all comments and attachments.',
      )
    ) {
      startTransition(async () => {
        await deleteTask(task.id)
      })
    }
  }

  return (
    <li className="flex items-center justify-between rounded-lg border bg-white p-4">
      <div className="min-w-0">
        <p className="truncate font-semibold text-gray-500">{task.title}</p>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-500 capitalize">
          {task.status}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <Link
          href={`/projects/${projectId}/tasks/${task.id}`}
          className="rounded text-blue-500 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          View Details
        </Link>
        <button
          aria-label={`Delete task ${task.title}`}
          aria-busy={isPending}
          disabled={isPending}
          className="rounded text-sm text-red-600 hover:underline focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50"
          onClick={handleDelete}
        >
          {isPending ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </li>
  )
}

// Memoize to prevent unnecessary re-renders when a parent updates
export default memo(TaskItem)
