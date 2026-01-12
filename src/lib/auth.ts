import { cookies } from 'next/headers'
import { cache } from 'react'

import { db } from '@/shared/db'
import type { User } from '@/shared/types'
import { sign, verify } from 'jsonwebtoken'
import { z } from 'zod'

const SESSION_COOKIE_NAME = 'session'
const SESSION_DURATION_HOURS = 24

const SessionPayload = z.object({
  sessionId: z.uuid(),
  userId: z.uuid(),
  orgId: z.uuid(), // The currently active organization
})

export type SessionPayload = z.infer<typeof SessionPayload>

/**
 * Creates a new session in the database and returns the session ID.
 */
async function createDbSession(userId: string): Promise<string> {
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000,
  )

  const result = await db
    .insertInto('sessions')
    .values({ user_id: userId, expires_at: expiresAt })
    .returning('id')
    .executeTakeFirstOrThrow()

  return result.id
}

/**
 * Creates a signed JWT and sets it as a secure, HttpOnly cookie.
 */
export async function createSessionCookie(userId: string, orgId: string) {
  const sessionId = await createDbSession(userId)
  const payload: SessionPayload = { sessionId, userId, orgId }

  const signedPayload = sign(payload, process.env.SESSION_SECRET!)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, signedPayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000),
  })
}

const getUser = cache(async (userId: string): Promise<User | null> => {
  const user = await db
    .selectFrom('users')
    .select(['id', 'email'])
    .where('id', '=', userId)
    .executeTakeFirst()

  if (!user) return null

  const orgs = await db
    .selectFrom('organizations as o')
    .innerJoin('users_organizations as uo', 'o.id', 'uo.organization_id')
    .where('uo.user_id', '=', userId)
    .select(['o.id', 'o.name', 'uo.role'])
    .execute()

  return {
    id: user.id,
    email: user.email,
    organizations: orgs.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role as 'admin' | 'member',
    })),
  }
})

/**
 * Gets the current user session from the cookie.
 * This is cached per-request.
 */
export const getSession = cache(async () => {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!cookieValue) return null

  try {
    const payload = verify(cookieValue, process.env.SESSION_SECRET!) as unknown
    const validated = SessionPayload.safeParse(payload)

    if (!validated.success) return null

    const { sessionId, userId, orgId } = validated.data
    const session = await db
      .selectFrom('sessions')
      .select('expires_at')
      .where('id', '=', sessionId)
      .where('expires_at', '>', new Date())
      .executeTakeFirst()

    if (!session) {
      const cookieStore = await cookies()
      cookieStore.delete(SESSION_COOKIE_NAME)

      return null
    }

    const user = await getUser(userId)

    if (!user) return null

    return {
      user,
      sessionId,
      activeOrgId: orgId,
    }
  } catch {
    return null
  }
})

/**
 * Deletes the session from the database and clears the cookie.
 */
export async function deleteSession() {
  const session = await getSession()

  if (session) {
    await db
      .deleteFrom('sessions')
      .where('id', '=', session.sessionId)
      .execute()
  }

  const cookieStore = await cookies()

  cookieStore.delete(SESSION_COOKIE_NAME)
}

// --- RBAC ---

type Action = 'create' | 'read' | 'update' | 'delete'
type Resource = 'project' | 'task' | 'comment' | 'attachment'

/**
 * Centralized permission check. Throws an error if permission is denied.
 */
export async function checkPermission(
  orgId: string,
  action: Action,
  resource: Resource | { type: Resource; id: string },
) {
  const session = await getSession()

  if (!session) {
    throw new Error('AuthenticationRequired')
  }

  if (session.activeOrgId !== orgId) {
    throw new Error('Forbidden') // Should not happen if data is scoped correctly
  }

  const userOrg = session.user.organizations.find((o) => o.id === orgId)

  if (!userOrg) {
    throw new Error('Forbidden')
  }

  const { role } = userOrg
  const resourceType = typeof resource === 'string' ? resource : resource.type

  // Admin can do anything
  if (role === 'admin') {
    return
  }

  // Member permissions
  if (role === 'member') {
    if (resourceType === 'project' && action !== 'read') {
      throw new Error('PermissionDenied')
    }

    if (
      ['task', 'comment', 'attachment'].includes(resourceType) &&
      action === 'delete'
    ) {
      // More granular check needed: is the user the owner of the resource?
      // For now, we'll deny deletion for members.
      throw new Error('PermissionDenied')
    }

    return
  }

  throw new Error('PermissionDenied')
}
