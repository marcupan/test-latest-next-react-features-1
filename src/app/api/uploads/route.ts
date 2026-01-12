import { writeFile } from 'fs/promises'
import { NextResponse } from 'next/server'
import { join } from 'path'

import { db } from '@/shared/db'

import { recordAuditEvent } from '@/lib/audit-log'
import { checkPermission, getSession } from '@/lib/auth'
import { handleApiError } from '@/lib/api-helpers';

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const MAX_FILE_SIZE_MB = 5
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'text/plain',
]

export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const taskId = formData.get('taskId') as string | null

  if (!file || !taskId) {
    return NextResponse.json(
      { error: 'Missing file or taskId' },
      { status: 400 },
    )
  }

  // --- Validation ---
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `File size exceeds ${MAX_FILE_SIZE_MB}MB` },
      { status: 400 },
    )
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  try {
    await checkPermission(session.activeOrgId, 'create', 'attachment')

    // Verify a task exists in the organization
    const task = await db
      .selectFrom('tasks')
      .select('id')
      .where('id', '=', taskId)
      .where('organization_id', '=', session.activeOrgId)
      .executeTakeFirst()

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // --- Store the file ---
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sanitize filename to remove special characters and create a unique path
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '')
    const storagePath = `${crypto.randomUUID()}-${sanitizedFilename}`
    await writeFile(join(UPLOAD_DIR, storagePath), buffer)

    // --- Store metadata in DB ---
    const newAttachment = await db
      .insertInto('attachments')
      .values({
        filename: file.name,
        storage_path: storagePath,
        file_type: file.type,
        file_size_bytes: file.size,
        task_id: taskId,
        user_id: session.user.id,
        organization_id: session.activeOrgId,
      })
      .returning('id')
      .executeTakeFirstOrThrow()

    await recordAuditEvent({
      action: 'attachment.create',
      userId: session.user.id,
      orgId: session.activeOrgId,
      details: { attachmentId: newAttachment.id, filename: file.name, taskId },
    })

    // The revalidation must happen on the client-side or via a webhook for Route Handlers
    // We'll use a client-side router.refresh() for now.

    return NextResponse.json({ success: true, attachmentId: newAttachment.id })
  } catch (error) {
    return handleApiError(error);
  }
}
