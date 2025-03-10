'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/app/lib/utils'
import { LayoutDashboard, Users, Hotel, Calendar, LogOut } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/app/components/ui/sheet'
import { Menu } from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users
  },
  {
    title: 'Rooms',
    href: '/admin/rooms',
    icon: Hotel
  },
  {
    title: 'Bookings',
    href: '/admin/bookings',
    icon: Calendar
  }
]

interface SidebarProps {
  onLogout: () => void
}

export function Sidebar ({ onLogout }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant='ghost' size='icon' className='md:hidden'>
            <Menu className='h-6 w-6' />
            <span className='sr-only'>Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-[240px] sm:w-[280px]'>
          <SheetHeader>
            <SheetTitle>Admin Panel</SheetTitle>
          </SheetHeader>
          <nav className='flex flex-col gap-2 mt-6'>
            {menuItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer',
                  pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className='h-4 w-4' />
                {item.title}
              </Link>
            ))}
            <Button
              variant='ghost'
              className='justify-start text-red-500 hover:text-red-600 hover:bg-red-50'
              onClick={onLogout}
            >
              <LogOut className='mr-2 h-4 w-4' />
              Logout
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className='hidden md:flex h-screen w-[240px] flex-col border-r bg-background'>
        <div className='p-6'>
          <h1 className='text-xl font-bold cursor-pointer'>Admin Panel</h1>
        </div>
        <nav className=' space-y-4 p-4 justify-between'>
          {menuItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer',
                pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className='h-4 w-4' />
              {item.title}
            </Link>
          ))}
          <div className='p-1 border-t flex-end'>
            <Button
              variant='ghost'
              className='w-full justify-start cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50'
              onClick={onLogout}
            >
              <LogOut className='mr-2 h-4 w-4' />
              Logout
            </Button>
          </div>
        </nav>
      </div>
    </>
  )
}
