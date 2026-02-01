import { notFound } from 'next/navigation'

import { compare } from 'bcryptjs'

import { db } from '@/shared/db'

type PageProps = {
  params: Promise<{
    token: string
  }>
}

interface Task {
  id: string
  title: string
  status: string
}

async function getProjectByShareToken(token: string) {
  const allTokens = await db
    .selectFrom('share_tokens')
    .select(['token_hash', 'project_id'])
    .execute()

  let validToken = null
  for (const row of allTokens) {
    const isMatch = await compare(token, row.token_hash)

    if (isMatch) {
      validToken = row
      break
    }
  }

  if (!validToken) {
    return null
  }

  const { project_id } = validToken

  const project = await db
    .selectFrom('projects')
    .select(['id', 'name'])
    .where('id', '=', project_id)
    .executeTakeFirst()

  if (!project) return null

  const tasks = await db
    .selectFrom('tasks')
    .select(['id', 'title', 'status'])
    .where('project_id', '=', project_id)
    .execute()

  return {
    project,
    tasks: tasks as Task[],
  }
}

const SharePage = async ({ params }: PageProps) => {
  const { token } = await params
  const data = await getProjectByShareToken(token)

  if (!data) {
    notFound()
  }

  const { project, tasks } = data

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-500">Read-only share page</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Tasks</h2>
          <ul className="space-y-4">
            {tasks.map((task: Task) => (
              <li key={task.id} className="rounded-lg border bg-gray-100 p-4">
                <p className="font-semibold">{task.title}</p>
                <span className="rounded-full bg-gray-200 px-2 py-1 text-sm text-gray-500 capitalize">
                  {task.status}
                </span>
              </li>
            ))}
            {tasks.length === 0 && (
              <p className="text-gray-500">No tasks in this project.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SharePage
