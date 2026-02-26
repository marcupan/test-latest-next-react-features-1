'use client'

import Link, { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'

import { useTranslations } from '@/lib/i18n/client'

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
  const t = useTranslations()

  const links = [
    { href: '/projects', label: t.navigation.projects },
    { href: '/dashboard/audit-log', label: t.navigation.auditLog },
  ] as const

  return (
    <nav className="flex items-center gap-4">
      {links.map(({ href, label }) => {
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
