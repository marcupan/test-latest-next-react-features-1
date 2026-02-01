import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { getSession } from '@/lib/auth'
import { AppHeader } from '@/shared/ui/AppHeader'

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
    <>
      <AppHeader session={session} />
      <main className="p-8">{children}</main>
      {modal}
    </>
  )
}

export default AuthedLayout
