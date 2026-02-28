/**
 * Next.js 16 Streaming Route Handler
 *
 * Demonstrates streaming responses for:
 * - Large dataset exports (CSV)
 * - Server-Sent Events (SSE)
 * - Progressive data loading
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/route-handlers
 */

import { NextRequest } from 'next/server'

import { getSession } from '@/lib/auth'
import { db } from '@/shared/db'

// Helper to create a streaming text encoder
const encoder = new TextEncoder()

/**
 * Streaming CSV Export
 * GET /api/stream?type=csv
 */
export const GET = async (request: NextRequest) => {
  const session = await getSession()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const streamType = searchParams.get('type') || 'csv'

  if (streamType === 'csv') {
    return await streamCSVExport(session.activeOrgId)
  }

  if (streamType === 'sse') {
    return await streamServerSentEvents(session.activeOrgId)
  }

  return new Response('Invalid stream type', { status: 400 })
}

/**
 * Stream CSV export of all projects and tasks
 */
const streamCSVExport = async (orgId: string) => {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send CSV header
        const header =
          'Project ID,Project Name,Task ID,Task Title,Status,Created\n'
        controller.enqueue(encoder.encode(header))

        // Stream projects one by one
        const projects = await db
          .selectFrom('projects')
          .select(['id', 'name'])
          .where('organization_id', '=', orgId)
          .execute()

        for (const project of projects) {
          // Get tasks for each project
          const tasks = await db
            .selectFrom('tasks')
            .select(['id', 'title', 'status', 'created_at'])
            .where('project_id', '=', project.id)
            .execute()

          if (tasks.length === 0) {
            // Project with no tasks
            const row = `"${project.id}","${project.name}","","","",""\n`
            controller.enqueue(encoder.encode(row))
          } else {
            // Project with tasks
            for (const task of tasks) {
              const row = `"${project.id}","${project.name}","${task.id}","${task.title}","${task.status}","${new Date(task.created_at).toISOString()}"\n`
              controller.enqueue(encoder.encode(row))

              // Simulate streaming delay (remove in production)
              await new Promise((resolve) => setTimeout(resolve, 50))
            }
          }
        }

        controller.close()
      } catch (error) {
        console.error('CSV streaming error:', error)
        controller.error(error)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="export.csv"',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

/**
 * Stream Server-Sent Events (SSE)
 * For real-time updates
 */
const streamServerSentEvents = async (orgId: string) => {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send an initial connection message
        const data = { type: 'connected', timestamp: Date.now() }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

        // Send a project count every 2 seconds (demo)
        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) => setTimeout(resolve, 2000))

          const count = await db
            .selectFrom('projects')
            .select((eb) => eb.fn.countAll<number>().as('count'))
            .where('organization_id', '=', orgId)
            .executeTakeFirst()

          const event = {
            type: 'project_count',
            count: count?.count || 0,
            timestamp: Date.now(),
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          )
        }

        // Send completion event
        const done = { type: 'complete', timestamp: Date.now() }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(done)}\n\n`))

        controller.close()
      } catch (error) {
        console.error('SSE streaming error:', error)
        controller.error(error)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
