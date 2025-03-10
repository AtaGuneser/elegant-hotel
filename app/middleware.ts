import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function middleware (request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for public routes and API routes
  if (
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/admin/login')
  ) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('token')?.value

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    // Verify token
    const decoded = verify(token, JWT_SECRET) as { role: string }

    // Check admin routes
    if (pathname.startsWith('/admin')) {
      // Skip middleware for admin login page
      if (pathname === '/admin/login') {
        return NextResponse.next()
      }

      // Check if user is admin
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}
