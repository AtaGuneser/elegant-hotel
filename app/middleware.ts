import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

export async function middleware (request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Admin routes protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as {
        id: string
        email: string
        role: string
      }

      // If user is not admin, redirect to home
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // If user is admin and tries to access login page, redirect to admin dashboard
      if (request.nextUrl.pathname === '/admin/login') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      // For all other admin routes, allow access
      return NextResponse.next()
    } catch (error) {
      console.error('Admin middleware error:', error)
      // If token is invalid, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Auth routes protection (login/register)
  if (request.nextUrl.pathname.startsWith('/auth')) {
    if (token) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET!) as {
          id: string
          email: string
          role: string
        }

        // If user is admin, redirect to admin dashboard
        if (decoded.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url))
        }

        // If user is logged in but not admin, redirect to home
        return NextResponse.redirect(new URL('/', request.url))
      } catch (error) {
        console.error('Auth middleware error:', error)
        // If token is invalid, allow access to auth pages
        return NextResponse.next()
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*']
}
