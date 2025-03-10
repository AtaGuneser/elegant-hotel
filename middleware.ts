import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/admin', '/bookings']

// Routes that require admin role
const adminRoutes = ['/admin']

export async function middleware (request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  // Check if the route requires authentication
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { role: string }

      // Check admin routes
      if (
        adminRoutes.some(route => pathname.startsWith(route)) &&
        decoded.role !== 'admin'
      ) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
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
