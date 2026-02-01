import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Secure Workspace',
    default: 'Secure Workspace',
  },
  description: 'A Next.js SaaS boilerplate',
  openGraph: {
    title: 'Secure Workspace',
    description: 'A Next.js SaaS boilerplate',
    siteName: 'Secure Workspace',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secure Workspace',
    description: 'A Next.js SaaS boilerplate',
    creator: process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? '',
    images: [`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

import { DynamicJsonLd } from '@/shared/ui/DynamicJsonLd'
import { Suspense } from 'react'

const RootLayout = ({
  children,
}: Readonly<{
  children: ReactNode
}>) => {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <Suspense fallback={null}>
          <DynamicJsonLd />
        </Suspense>
        {children}
        <div id="modal-root" />
      </body>
    </html>
  )
}

export default RootLayout
