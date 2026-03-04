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

import { I18nProvider } from '@/lib/i18n/client'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getLocale } from '@/lib/i18n/server'

const I18nWrapper = async ({ children }: { children: ReactNode }) => {
  const locale = await getLocale()
  const dictionary = getDictionary(locale)

  return <I18nProvider dictionary={dictionary}>{children}</I18nProvider>
}

const RootLayout = async ({
  children,
}: Readonly<{
  children: ReactNode
}>) => {
  const locale = await getLocale()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <I18nWrapper>
            <Suspense fallback={null}>
              <DynamicJsonLd />
            </Suspense>
            {children}
            <div id="modal-root" />
          </I18nWrapper>
        </Suspense>
      </body>
    </html>
  )
}

export default RootLayout
