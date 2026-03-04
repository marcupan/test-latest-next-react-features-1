import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { getSession } from '@/lib/auth'
import { ThemeProvider } from '@/shared/context/ThemeContext'
import { AppHeader } from '@/shared/ui/AppHeader'
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary'

const AuthedLayout = async ({
  children,
  modal,
}: {
  children: ReactNode
  modal: ReactNode
}) => {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <ThemeProvider initialTheme="light">
      <ErrorBoundary>
        <AppHeader session={session} />
        <main className="p-8">{children}</main>
        {modal}
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default AuthedLayout
