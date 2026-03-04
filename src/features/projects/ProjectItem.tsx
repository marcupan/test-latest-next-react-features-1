'use client'

import Link from 'next/link'
import type { MouseEvent } from 'react'
import { memo, useTransition } from 'react'

import { deleteProject } from './actions'

const ProjectItem = ({
  project,
}: {
  project: { id: string; name: string }
}) => {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (
      window.confirm(
        'Are you sure you want to delete this project? This will also delete all tasks, comments, and attachments.',
      )
    ) {
      startTransition(async () => {
        await deleteProject(project.id)
      })
    }
  }

  return (
    <Link
      href={`/projects/${project.id}`}
      key={project.id}
      className="rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className="relative block rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100">
        <h5 className="mb-2 truncate pr-16 text-2xl font-bold tracking-tight text-gray-900">
          {project.name}
        </h5>
        <p className="font-normal text-gray-700">Click to view tasks.</p>
        <button
          onClick={handleDelete}
          aria-label={`Delete project ${project.name}`}
          aria-busy={isPending}
          disabled={isPending}
          className="absolute top-2 right-2 rounded text-xs text-red-600 hover:underline focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {isPending ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Link>
  )
}

// Memoize to prevent unnecessary re-renders in project list
export default memo(ProjectItem)
