'use server'

import { randomBytes } from 'crypto'
import { revalidateTag } from 'next/cache'

import { db } from '@/shared/db'
import { hash } from 'bcryptjs'

import { checkPermission, getSession } from '@/lib/auth'

const TOKEN_BYTES = 32

async function verifyProjectAccess(
  projectId: string,
  session: Awaited<ReturnType<typeof getSession>>,
  permissionAction: 'read' | 'update' | 'delete',
) {
  if (!session) {
    throw new Error('Not authenticated')
  }

  await checkPermission(session.activeOrgId, permissionAction, {
    type: 'project',
    id: projectId,
  })

  const project = await db
    .selectFrom('projects')
    .select('id')
    .where('id', '=', projectId)
    .where('organization_id', '=', session.activeOrgId)
    .executeTakeFirst()

  if (!project) {
    throw new Error('Project not found')
  }
  return project
}

function handleActionError(error: unknown, defaultMessage: string) {
  console.error(error)
  const message = error instanceof Error ? error.message : defaultMessage
  return { error: message }
}

export async function createShareToken(
  projectId: string,
): Promise<{ shareUrl?: string; error?: string }> {
  const session = await getSession()
  if (!session) {
    return handleActionError(new Error('Not authenticated'), 'Not authenticated');
  }

  try {
    await verifyProjectAccess(projectId, session, 'update')

    // Revoke any existing tokens for this project
    await db
      .deleteFrom('share_tokens')
      .where('project_id', '=', projectId)
      .where('organization_id', '=', session.activeOrgId)
      .execute()

    const token = randomBytes(TOKEN_BYTES).toString('hex')
    const tokenHash = await hash(token, 10)

    await db
      .insertInto('share_tokens')
      .values({
        token_hash: tokenHash,
        project_id: projectId,
        organization_id: session.activeOrgId,
        created_by_id: session.user.id,
      })
      .execute()

    revalidateTag(`share_token:${projectId}`, 'standard')

    // This is not perfectly ideal as it depends on the base URL, but for demonstration it's ok.
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    return { shareUrl: `${baseUrl}/share/${token}` }
  } catch (error: unknown) {
    return handleActionError(error, 'Could not create share token')
  }
}

export async function revokeShareToken(
  projectId: string,
): Promise<{ success?: boolean; error?: string }> {
  const session = await getSession()
  if (!session) {
    return handleActionError(new Error('Not authenticated'), 'Not authenticated');
  }

  try {
    await verifyProjectAccess(projectId, session, 'update')

    await db
      .deleteFrom('share_tokens')
      .where('project_id', '=', projectId)
      .where('organization_id', '=', session.activeOrgId)
      .execute()

    revalidateTag(`share_token:${projectId}`, 'standard')

    return { success: true }
  } catch (error: unknown) {
    return handleActionError(error, 'Could not revoke share token')
  }
}
