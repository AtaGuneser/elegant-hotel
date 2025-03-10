'use client'

import Link from 'next/link'
import { Button } from '../ui/button'
import { useAuthStore } from '@/app/store/auth'

export function Navbar () {
  const { user, isAuthenticated, logout } = useAuthStore()

  return (
    <nav className='border-b'>
      <div className='container flex h-16 items-center justify-between'>
        <Link href='/' className='text-xl font-bold'>
          Elegant Hotel
        </Link>

        <div className='flex items-center gap-4'>
          <Link href='/rooms'>
            <Button variant='ghost'>Odalar</Button>
          </Link>

          {isAuthenticated ? (
            <>
              <Link href='/bookings'>
                <Button variant='ghost'>Rezervasyonlarım</Button>
              </Link>
              {user?.role === 'admin' && (
                <Link href='/admin'>
                  <Button variant='ghost'>Admin Panel</Button>
                </Link>
              )}
              <Button variant='ghost' onClick={() => logout()}>
                Çıkış Yap
              </Button>
            </>
          ) : (
            <>
              <Link href='/auth/login'>
                <Button variant='ghost'>Giriş Yap</Button>
              </Link>
              <Link href='/auth/register'>
                <Button variant='default'>Kayıt Ol</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
