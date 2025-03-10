import { NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'

export async function POST (request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Admin credentials check
    if (email !== 'admin@admin.com' || password !== '123456') {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create admin token
    const token = sign(
      { id: 'admin', email, role: 'admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    // Set cookie with admin token
    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    )

    // Clear any existing token first
    response.cookies.delete('token')

    // Set new admin token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
