import { readFile } from 'fs/promises'
import { NextResponse, type NextRequest } from 'next/server'
import { join } from 'path'

import { handleApiError } from '@/lib/api-helpers'
import { checkPermission, getSession } from '@/lib/auth'
import { db } from '@/shared/db'

// Route Segment Config - Next.js 16
export const dynamic = 'force-dynamic' // Always run dynamically
export const runtime = 'nodejs' // Use Node.js runtime for file system access

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { attachmentId } = await params

  if (!attachmentId) {
    return NextResponse.json(
      { error: 'Missing attachment ID' },
      { status: 400 },
    )
  }

  try {
    const attachment = await db
      .selectFrom('attachments')
      .selectAll()
      .where('id', '=', attachmentId)
      .where('organization_id', '=', session.activeOrgId)
      .executeTakeFirst()

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 },
      )
    }

    await checkPermission(session.activeOrgId, 'read', {
      type: 'attachment',
      id: attachment.id,
    })

    const filePath = join(UPLOAD_DIR, attachment.storage_path)
    const fileBuffer = await readFile(filePath)

    const headers = new Headers()
    headers.set('Content-Type', attachment.file_type)
    headers.set(
      'Content-Disposition',
      `attachment; filename="${attachment.filename}"`,
    )

    return new NextResponse(fileBuffer, { status: 200, headers })
  } catch (error) {
    return handleApiError(error)
  }
}
