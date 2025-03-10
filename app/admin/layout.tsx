'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/app/store/auth'
import { Sidebar } from '@/app/components/admin/sidebar'

export default function AdminLayout ({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className='min-h-screen flex'>
      <Sidebar onLogout={handleLogout} />
      {/* Main Content */}
      <div className='flex-1'>
        <div className='h-full'>
          <main className='p-6'>{children}</main>
        </div>
      </div>
    </div>
  )
}
