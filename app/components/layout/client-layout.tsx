'use client'

import { usePathname } from 'next/navigation'
import Navbar from './navbar'
import { Toaster } from 'react-hot-toast'

export default function ClientLayout ({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  return (
    <>
      <Toaster position='top-center' />
      {!isAdminPage && <Navbar />}
      <div className='flex min-h-screen flex-col'>
        <main className='flex-1 container mx-auto px-4 py-8'>{children}</main>
      </div>
    </>
  )
}
