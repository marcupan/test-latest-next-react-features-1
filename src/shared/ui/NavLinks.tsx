'use client'

import Link, { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/dashboard/audit-log', label: 'Audit Log' },
] as const

const LinkHint = () => {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-1.5 w-1.5 rounded-full bg-blue-500 transition-opacity ${pending ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}

const NavLinks = () => {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-4">
      {LINKS.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-1.5 text-sm hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${isActive ? 'font-semibold text-blue-700' : 'text-blue-500'}`}
          >
            {label}
            <LinkHint />
          </Link>
        )
      })}
    </nav>
  )
}

export default NavLinks
