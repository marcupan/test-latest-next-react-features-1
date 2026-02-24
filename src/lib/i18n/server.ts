import { cookies } from 'next/headers'

import { defaultLocale, isValidLocale, type Locale } from './config'
import { getDictionary } from './dictionaries'

const LOCALE_COOKIE = 'NEXT_LOCALE'

export const getLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value

  if (localeCookie && isValidLocale(localeCookie)) {
    return localeCookie
  }

  return defaultLocale
}

export const getTranslations = async () => {
  const locale = await getLocale()

  return getDictionary(locale)
}
