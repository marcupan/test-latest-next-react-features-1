'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { deleteTask } from './actions'

export default function TaskItem({
  task,
  projectId,
}: {
  task: { id: string; title: string; status: string }
  projectId: string
}) {
  const router = useRouter()

  const handleDelete = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this task? This will also delete all comments and attachments.',
      )
    ) {
      await deleteTask(task.id)

      router.refresh()
    }
  }

  return (
    <li className="flex items-center justify-between rounded-lg border bg-white p-4">
      <div>
        <p className="font-semibold">{task.title}</p>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-500 capitalize">
          {task.status}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href={`/projects/${projectId}/tasks/${task.id}`}
          className="text-blue-500 hover:underline"
        >
          View Details
        </Link>
        <button
          className="text-sm text-red-600 hover:underline"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </li>
  )
}
