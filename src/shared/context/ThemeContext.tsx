'use client'

import { createContext, use, useContext, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<Promise<ThemeContextType> | null>(null)

export const ThemeProvider = ({
  children,
  initialTheme = 'light',
}: {
  children: ReactNode
  initialTheme?: Theme
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  const themePromise = Promise.resolve({
    theme,
    setTheme,
  })

  return (
    <ThemeContext.Provider value={themePromise}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const themePromise = useContext(ThemeContext)

  if (!themePromise) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return use(themePromise)
}
