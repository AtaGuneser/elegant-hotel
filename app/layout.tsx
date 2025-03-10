import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Providers } from './components/providers'
import { Navbar } from './components/layout/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Elegant Hotel - Luxury Stay',
  description: 'Book your perfect stay at Elegant Hotel'
}

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.className
        )}
      >
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
