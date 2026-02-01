import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth'

const RootPage = async () => {
  const session = await getSession()

  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}

export default RootPage
