import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/login|auth/register).*)'
  ]
}

async function verifyToken (token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function middleware (request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Verify the token
  if (token) {
    const payload = await verifyToken(token)
    if (payload) {
      return NextResponse.next()
    }
  }

  // No token or invalid token, redirect to login
  if (!request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}
