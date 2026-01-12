'use server'

import { redirect } from 'next/navigation'

import { db } from '@/shared/db'
import { z } from 'zod'

import { recordAuditEvent } from '@/lib/audit-log'
import { createSessionCookie, deleteSession, getSession } from '@/lib/auth'
import { hashPassword, verifyPassword } from '@/lib/crypto'

type AuthStateType = {
  message?: z.ZodError | string
}

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
})

export async function login(
  _prevState: AuthStateType,
  formData: FormData,
): Promise<AuthStateType> {
  const result = loginSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!result.success) {
    return { message: result.error }
  }

  const { email, password } = result.data

  try {
    const user = await db
      .selectFrom('users')
      .select(['id', 'password_hash', 'salt'])
      .where('email', '=', email)
      .executeTakeFirst()

    if (!user) {
      await recordAuditEvent({
        action: 'user.login.failed',
        details: { email, reason: 'user_not_found' },
      })

      return { message: 'Invalid credentials' }
    }

    const saltAndHash = `${user.salt}:${user.password_hash}`
    const isValid = await verifyPassword(password, saltAndHash)

    if (!isValid) {
      await recordAuditEvent({
        action: 'user.login.failed',
        userId: user.id,
        details: { email, reason: 'invalid_password' },
      })

      return { message: 'Invalid credentials' }
    }

    // Get the user's default organization
    const org = await db
      .selectFrom('users_organizations')
      .select('organization_id')
      .where('user_id', '=', user.id)
      .limit(1)
      .executeTakeFirst()

    if (!org) {
      return { message: 'User is not part of any organization' }
    }

    const orgId = org.organization_id

    // Set session cookie
    await createSessionCookie(user.id, orgId)

    await recordAuditEvent({
      action: 'user.login.success',
      userId: user.id,
      orgId,
    })
  } catch (error) {
    console.error(error)
    return { message: 'Server error' }
  }

  // Redirect to dashboard on successful login
  redirect('/dashboard')
}

const signupSchema = z.object({
  orgName: z.string().min(1, 'Organization name is required'),
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function signup(
  _prevState: AuthStateType,
  formData: FormData,
): Promise<AuthStateType> {
  const result = signupSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!result.success) {
    return { message: result.error }
  }

  const { orgName, email, password } = result.data
  const saltAndHash = await hashPassword(password)
  const [salt, hash] = saltAndHash.split(':') as [string, string]

  try {
    const { orgId, userId } = await db.transaction().execute(async (trx) => {
      // 1. Create Organization
      const org = await trx
        .insertInto('organizations')
        .values({ name: orgName })
        .returning('id')
        .executeTakeFirstOrThrow()

      // 2. Create User
      const user = await trx
        .insertInto('users')
        .values({ email, password_hash: hash, salt })
        .returning('id')
        .executeTakeFirstOrThrow()

      // 3. Link User to Organization as 'admin'
      await trx
        .insertInto('users_organizations')
        .values({ user_id: user.id, organization_id: org.id, role: 'admin' })
        .execute()

      return { orgId: org.id, userId: user.id }
    })

    await recordAuditEvent({
      action: 'user.signup',
      userId,
      orgId,
      details: { orgName },
    })

    // 4. Create session
    await createSessionCookie(userId, orgId)
  } catch (error) {
    console.error(error)
    // This could be a unique constraint violation (email already exists)
    return { message: 'Signup failed' }
  }

  redirect('/dashboard')
}

export async function logout() {
  const session = await getSession()

  if (session) {
    await recordAuditEvent({
      action: 'user.logout',
      userId: session.user.id,
      orgId: session.activeOrgId,
    })
  }

  await deleteSession()

  redirect('/login')
}
