import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { isValidLocale } from '@/lib/i18n/config'

export const POST = async (request: NextRequest) => {
  try {
    const { locale } = (await request.json()) as { locale: string }

    if (!isValidLocale(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
    }

    const cookieStore = await cookies()
    cookieStore.set('NEXT_LOCALE', locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    })

    return NextResponse.json({ success: true, locale })
  } catch (error) {
    console.error('Failed to set locale:', error)

    return NextResponse.json({ error: 'Failed to set locale' }, { status: 500 })
  }
}
