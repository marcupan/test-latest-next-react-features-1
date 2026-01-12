'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'

import { deleteProject } from './actions'

export default function ProjectItem({
  project,
}: {
  project: { id: string; name: string }
}) {
  const router = useRouter()

  const handleDelete = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (
      window.confirm(
        'Are you sure you want to delete this project? This will also delete all tasks, comments, and attachments.',
      )
    ) {
      await deleteProject(project.id)

      router.refresh()
    }
  }

  return (
    <Link href={`/projects/${project.id}`} key={project.id}>
      <div className="relative block rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
          {project.name}
        </h5>
        <p className="font-normal text-gray-700">Click to view tasks.</p>
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 text-xs text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </Link>
  )
}
