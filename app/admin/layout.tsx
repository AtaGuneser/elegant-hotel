'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import {
  LayoutDashboard,
  Hotel,
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu
} from 'lucide-react'
import { useAuthStore } from '@/app/store/auth'
import { useEffect } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Rooms', href: '/admin/rooms', icon: Hotel },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Settings', href: '/admin/settings', icon: Settings }
]

export default function AdminLayout ({
  children
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className='min-h-screen'>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex h-16 items-center justify-between border-b px-4'>
          <h1 className='text-xl font-bold'>Admin Panel</h1>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsSidebarOpen(false)}
            className='md:hidden'
          >
            <Menu className='h-5 w-5' />
          </Button>
        </div>
        <nav className='space-y-1 p-4'>
          {navigation.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className='w-full justify-start gap-2'
                >
                  <item.icon className='h-5 w-5' />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
        <div className='absolute bottom-0 w-full border-t p-4'>
          <Button
            variant='ghost'
            className='w-full justify-start gap-2 text-red-600 hover:text-red-700'
            onClick={handleLogout}
          >
            <LogOut className='h-5 w-5' />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex min-h-screen flex-col transition-all duration-200 ease-in-out ${
          isSidebarOpen ? 'md:pl-64' : ''
        }`}
      >
        {/* Page Content */}
        <main className='flex-1 p-4'>{children}</main>
      </div>
    </div>
  )
}
