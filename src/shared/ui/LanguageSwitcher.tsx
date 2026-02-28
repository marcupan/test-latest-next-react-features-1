'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { localeNames, locales, type Locale } from '@/lib/i18n/config'

export const LanguageSwitcher = ({
  currentLocale,
}: {
  currentLocale: Locale
}) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isChanging, setIsChanging] = useState(false)

  const handleLocaleChange = (locale: Locale) => {
    setIsChanging(true)

    fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    })
      .then(() => {
        startTransition(() => {
          router.refresh()
          setIsChanging(false)
        })
      })
      .catch((error) => {
        console.error('Failed to change locale:', error)
        setIsChanging(false)
      })
  }

  return (
    <div className="flex items-center gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          disabled={isChanging || isPending}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            locale === currentLocale
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } ${isChanging || isPending ? 'cursor-not-allowed opacity-50' : ''}`}
          aria-label={`Switch to ${localeNames[locale]}`}
          onClick={() => handleLocaleChange(locale)}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  )
}
