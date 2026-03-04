'use client'

import {
  useActionState,
  useDeferredValue,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from 'react'

import { ZodError } from 'zod'

import { createProject } from '@/features/projects/actions'
import type { getProjects } from '@/features/projects/data'
import { ProjectContext, useProject } from '@/features/projects/ProjectContext'
import ProjectItem from '@/features/projects/ProjectItem'
import { getZodFieldErrors } from '@/shared/lib/utils'
import { FormFieldError } from '@/shared/ui/FormFieldError'

const CreateProjectForm = () => {
  const [state, formAction] = useActionState(createProject, { message: '' })

  const formRef = useRef<HTMLFormElement>(null)

  const { addOptimisticProject } = useProject()

  const action = (formData: FormData) => {
    const name = formData.get('name') as string

    addOptimisticProject(name)

    formRef.current?.reset()

    formAction(formData)
  }

  const errors =
    typeof state?.message === 'object' ? (state.message as ZodError) : undefined

  return (
    <form ref={formRef} action={action} className="flex items-center gap-2">
      <label htmlFor="project-name" className="sr-only">
        Project name
      </label>
      <input
        id="project-name"
        name="name"
        placeholder="New project name…"
        className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        required
      />
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Create Project
      </button>
      <FormFieldError error={getZodFieldErrors(errors, 'name')} />
    </form>
  )
}

const ProjectsClientPage = ({
  projects,
}: {
  projects: Awaited<ReturnType<typeof getProjects>>
}) => {
  const [optimisticProjects, addOptimisticProject] = useOptimistic(
    projects,
    (state, name: string) => [
      ...state,
      {
        id: crypto.randomUUID(),
        name,
      },
    ],
  )

  // React 19 useTransition() for non-blocking search
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  // useDeferredValue defers the list re-render — the input stays instant
  // while React can interrupt the list render for higher-priority updates
  const deferredQuery = useDeferredValue(searchQuery)
  const isStale = searchQuery !== deferredQuery

  // Filter projects based on a search query
  const filteredProjects = optimisticProjects.filter((project) =>
    project.name.toLowerCase().includes(deferredQuery.toLowerCase()),
  )

  // Non-blocking search handler
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    // startTransition marks this update as non-urgent
    // The UI stays responsive while filtering
    startTransition(() => {
      setSearchQuery(query)
    })
  }

  return (
    <ProjectContext.Provider value={{ addOptimisticProject }}>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Projects</h1>
            <CreateProjectForm />
          </div>

          {/* Search input with useTransition */}
          <div className="mt-4">
            <label htmlFor="search" className="sr-only">
              Search projects
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search projects…"
                onChange={handleSearch}
                className="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              />
              {isPending && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {filteredProjects.length} project
              {filteredProjects.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          style={{ opacity: isStale ? 0.6 : 1 }}
        >
          {filteredProjects.map((project) => (
            <ProjectItem key={project.id} project={project} />
          ))}

          {filteredProjects.length === 0 && !searchQuery && (
            <p className="text-gray-500">
              No projects found. Create one to get started.
            </p>
          )}

          {filteredProjects.length === 0 && searchQuery && (
            <p className="text-gray-500">
              No projects match &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      </div>
    </ProjectContext.Provider>
  )
}

export default ProjectsClientPage
