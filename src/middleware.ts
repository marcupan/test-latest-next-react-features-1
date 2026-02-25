import { NextResponse, type NextRequest } from 'next/server'

import { verify } from 'jsonwebtoken'
import { z } from 'zod'

const SESSION_COOKIE_NAME = 'session'

const SessionPayload = z.object({
  sessionId: z.uuid(),
  userId: z.uuid(),
  orgId: z.uuid(),
})

export default function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('x-request-path', request.nextUrl.pathname)

  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!cookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const payload = verify(cookie, process.env.SESSION_SECRET!)
    const validated = SessionPayload.safeParse(payload)

    if (!validated.success) {
      const response = NextResponse.redirect(new URL('/login', request.url))

      response.cookies.delete(SESSION_COOKIE_NAME)

      return response
    }
  } catch (err) {
    console.warn('Invalid session cookie:', err)

    const response = NextResponse.redirect(new URL('/login', request.url))

    response.cookies.delete(SESSION_COOKIE_NAME)

    return response
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (the login page)
     * - share (public share pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|share).*)',
  ],
}
