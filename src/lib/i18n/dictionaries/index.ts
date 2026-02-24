import type { Locale } from '../config'

import { en } from './en'
import { ua } from './ua'

const dictionaries = {
  en,
  ua,
}

export const getDictionary = (locale: Locale) => dictionaries[locale]
