'use client'

import dynamic from 'next/dynamic'

const JsonLdContent = dynamic(
  () => import('./JsonLd').then((mod) => mod.JsonLdContent),
  { ssr: false },
)

export const DynamicJsonLd = () => <JsonLdContent />
