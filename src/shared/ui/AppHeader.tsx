import Link from 'next/link'

import { logout } from '@/features/auth/actions'
import type { getSession } from '@/lib/auth'

type AppHeaderProps = {
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>
}

export const AppHeader = ({ session }: AppHeaderProps) => {
  return (
    <header className="flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-lg font-bold">
          Dashboard
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/projects"
            className="text-sm text-blue-500 hover:underline"
          >
            Projects
          </Link>
          <Link
            href="/dashboard/audit-log"
            className="text-sm text-blue-500 hover:underline"
          >
            Audit Log
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">
          Org: {session.activeOrgId.substring(0, 8)}...
        </span>
        <span className="text-sm">User: {session.user.email}</span>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  )
}
