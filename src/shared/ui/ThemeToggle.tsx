'use client'

import { useTheme } from '@/shared/context/ThemeContext'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  return (
    <button
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className="rounded-md bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
