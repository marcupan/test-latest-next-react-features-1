export const locales = ['en', 'ua'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ua: 'Українська',
}

export const isValidLocale = (locale: string): locale is Locale => {
  return locales.includes(locale as Locale)
}
