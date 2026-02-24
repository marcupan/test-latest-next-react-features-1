'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { Dictionary } from './dictionaries/en'

const I18nContext = createContext<Dictionary | null>(null)

export const I18nProvider = ({
  dictionary,
  children,
}: {
  dictionary: Dictionary
  children: ReactNode
}) => <I18nContext.Provider value={dictionary}>{children}</I18nContext.Provider>

export const useTranslations = () => {
  const dictionary = useContext(I18nContext)

  if (!dictionary) {
    throw new Error('useTranslations must be used within I18nProvider')
  }

  return dictionary
}
