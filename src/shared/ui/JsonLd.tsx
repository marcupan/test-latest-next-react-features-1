'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

import { sanitizeJsonLd } from '@/shared/lib/json-ld'

const generateBreadcrumbs = (pathname: string, appUrl: string) => {
  const asPathWithoutQuery = pathname.split('?')[0]

  if (!asPathWithoutQuery) {
    return []
  }

  const asPathNestedRoutes = asPathWithoutQuery
    .split('/')
    .filter((v) => v.length > 0)

  const crumbList = asPathNestedRoutes.map((subpath, idx) => {
    const href = '/' + asPathNestedRoutes.slice(0, idx + 1).join('/')

    return {
      '@type': 'ListItem',
      position: idx + 1,
      name: subpath.charAt(0).toUpperCase() + subpath.slice(1),
      item: `${appUrl}${href}`,
    }
  })

  return [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: appUrl,
    },
    ...crumbList.slice(1),
  ]
}

export function JsonLdContent() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const pathname = usePathname()

  if (!appUrl) {
    return null
  }

  const breadcrumbs = generateBreadcrumbs(pathname, appUrl)

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Secure Workspace',
    url: appUrl,
  }

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs,
  }

  return (
    <>
      <Script
        id="json-ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(sanitizeJsonLd(website)),
        }}
      />
      <Script
        id="json-ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(sanitizeJsonLd(breadcrumbList)),
        }}
      />
    </>
  )
}
