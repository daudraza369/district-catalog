import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { validateEnv } from '@/lib/env'

const ppFragment = localFont({
  src: [
    { path: '../Fonts/PPFragment-TextLight.woff', weight: '400', style: 'normal' },
    { path: '../Fonts/PPFragment-TextLight.otf', weight: '400', style: 'normal' },
    { path: '../Fonts/PPFragment-TextBold.woff', weight: '700', style: 'normal' },
    { path: '../Fonts/PPFragment-TextBold.otf', weight: '700', style: 'normal' }
  ],
  variable: '--font-pp-fragment',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'District Flowers — Wholesale Catalog',
  description: 'Premium B2B wholesale catalog for District Flowers in Riyadh'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  validateEnv()
  return (
    <html lang="en">
      <body className={`${ppFragment.variable} font-mono antialiased`}>
        {children}
      </body>
    </html>
  )
}
