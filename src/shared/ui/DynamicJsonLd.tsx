'use client'

import dynamic from 'next/dynamic'

const JsonLdContent = dynamic(
  () => import('./JsonLd').then((mod) => mod.JsonLdContent),
  { ssr: false }, // This component relies on `usePathname`, which is client-side only.
)

export function DynamicJsonLd() {
  return <JsonLdContent />
}
