'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { useAuthStore } from '@/app/store/auth'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/app/components/ui/sheet'
import { Menu } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Rooms', href: '/rooms' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' }
]

export default function Navbar () {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60'>
      <nav className='container mx-auto flex h-16 items-center justify-between px-4'>
        <Link href='/' className='text-xl font-bold'>
          Elegant Hotel
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex md:items-center md:space-x-4'>
          {navigation.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {item.name}
            </Link>
          ))}
          <Link href='/admin/login'>
            <Button variant='outline' size='sm'>
              Admin Panel
            </Button>
          </Link>
          {user ? (
            <>
              <span className='text-sm font-medium text-muted-foreground'>
                {user.name}
              </span>
              <Button variant='ghost' size='sm' onClick={() => logout()}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href='/auth/login'>
                <Button variant='ghost' size='sm'>
                  Login
                </Button>
              </Link>
              <Link href='/auth/register'>
                <Button size='sm'>Register</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='ghost' size='icon' className='md:hidden'>
              <Menu className='h-5 w-5' />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className='mt-4 flex flex-col space-y-4'>
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link href='/admin/login'>
                <Button variant='outline' className='w-full'>
                  Admin Panel
                </Button>
              </Link>
              {user ? (
                <>
                  <span className='text-sm font-medium text-muted-foreground'>
                    {user.name}
                  </span>
                  <Button
                    variant='ghost'
                    className='w-full'
                    onClick={() => logout()}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href='/auth/login'>
                    <Button variant='ghost' className='w-full'>
                      Login
                    </Button>
                  </Link>
                  <Link href='/auth/register'>
                    <Button className='w-full'>Register</Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
