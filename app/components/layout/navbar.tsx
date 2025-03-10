'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Menu, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Rooms', href: '/rooms' }
]

export default function Navbar () {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Check login status on mount and when pathname changes
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        })
        const data = await response.json()

        if (response.ok) {
          setIsLoggedIn(true)
          setUserName(data.name)
        } else {
          setIsLoggedIn(false)
          setUserName('')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsLoggedIn(false)
        setUserName('')
      }
    }

    checkAuth()
  }, [pathname])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      setIsLoggedIn(false)
      setUserName('')
      setIsMobileMenuOpen(false)

      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  return (
    <nav className='bg-white shadow'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex'>
            <div className='flex-shrink-0 flex items-center'>
              <Link
                href='/'
                className='text-xl font-bold text-gray-800 cursor-pointer'
              >
                Elegant Hotel
              </Link>
            </div>
            <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${
                    pathname === item.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className='hidden sm:ml-6 sm:flex sm:items-center'>
            {isLoggedIn ? (
              <div className='flex items-center space-x-4'>
                <span className='text-sm font-medium text-gray-700'>
                  {userName}
                </span>
                <Link href='/admin'>
                  <Button variant='outline' className='cursor-pointer'>
                    Admin Panel
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant='outline'
                  className='cursor-pointer'
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className='flex items-center space-x-4'>
                <Link href='/auth/login'>
                  <Button variant='outline' className='cursor-pointer'>
                    Login
                  </Button>
                </Link>
                <Link href='/auth/register'>
                  <Button className='cursor-pointer'>Sign Up</Button>
                </Link>
                <Link href='/admin'>
                  <Button variant='outline' className='cursor-pointer'>
                    Admin Panel
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className='-mr-2 flex items-center sm:hidden'>
            <button
              type='button'
              className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 cursor-pointer'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className='sr-only'>Open main menu</span>
              {isMobileMenuOpen ? (
                <X className='block h-6 w-6' aria-hidden='true' />
              ) : (
                <Menu className='block h-6 w-6' aria-hidden='true' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className='sm:hidden'>
          <div className='pt-2 pb-3 space-y-1'>
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer ${
                  pathname === item.href
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className='pt-4 pb-3 border-t border-gray-200'>
            {isLoggedIn ? (
              <div className='space-y-1'>
                <div className='px-4 py-2 text-base font-medium text-gray-700'>
                  {userName}
                </div>
                <Link
                  href='/admin'
                  className='block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className='block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer'
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className='space-y-1'>
                <Link
                  href='/auth/login'
                  className='block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href='/auth/register'
                  className='block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  href='/admin'
                  className='block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
