import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

export function middleware (request: NextRequest) {
  // Skip middleware for public routes and API routes
  if (
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/api/admin/login')
  ) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('token')?.value

  // If no token, redirect to login
  if (!token) {
    if (request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET!) as {
      id: string
      email: string
      role: string
    }

    // Check admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }

    // Redirect normal users from dashboard to home
    if (request.nextUrl.pathname === '/dashboard' && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Token verification error:', error)
    // Token is invalid or expired
    if (request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
