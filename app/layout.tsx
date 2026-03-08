import type { Metadata, Viewport } from 'next'
import { Inter, DM_Sans } from 'next/font/google'

import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'Dosh Mate - Smart Expense Tracking',
  description: 'Track, analyze, and optimize your spending with Dosh Mate. The modern expense tracker that helps you take control of your finances.',
  applicationName: 'Dosh Mate',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Dosh Mate',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/assets/doshmate-logo.png',
    apple: '/icon-192x192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0e1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
