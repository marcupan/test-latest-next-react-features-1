'use client'

import { useActionState, useOptimistic, useRef } from 'react'

import { createProject } from '@/features/projects/actions'
import type { getProjects } from '@/features/projects/data'
import { ProjectContext, useProject } from '@/features/projects/ProjectContext'
import ProjectItem from '@/features/projects/ProjectItem'
import { getZodFieldErrors } from '@/shared/lib/utils'
import { FormFieldError } from '@/shared/ui/FormFieldError'
import { ZodError } from 'zod'

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
      <input
        name="name"
        placeholder="New project name"
        className="rounded-md border border-gray-300 px-3 py-2 shadow-sm"
        required
      />
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Create Project
      </button>
      <FormFieldError error={getZodFieldErrors(errors, 'name')} />
    </form>
  )
}

export default function ProjectsClientPage({
  projects,
}: {
  projects: Awaited<ReturnType<typeof getProjects>>
}) {
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

  return (
    <ProjectContext.Provider value={{ addOptimisticProject }}>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Projects</h1>
          <CreateProjectForm />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {optimisticProjects.map((project) => (
            <ProjectItem key={project.id} project={project} />
          ))}

          {optimisticProjects.length === 0 && (
            <p className="text-gray-500">
              No projects found. Create one to get started.
            </p>
          )}
        </div>
      </div>
    </ProjectContext.Provider>
  )
}
