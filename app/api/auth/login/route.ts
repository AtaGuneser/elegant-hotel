import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import clientPromise from '@/app/lib/db'
import { loginSchema } from '@/app/lib/validations/auth'

export async function POST (request: Request) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const users = db.collection('users')

    const user = await users.findOne({ email: validatedData.email })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (user.isActive === false) {
      return NextResponse.json(
        { error: 'Your account has been deactivated' },
        { status: 401 }
      )
    }

    const isValidPassword = await compare(validatedData.password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user has a valid role
    if (!user.role || !['admin', 'customer'].includes(user.role)) {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 401 })
    }

    // Create token with user data
    const token = sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Set cookie with token
    const response = NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    })

    // Clear any existing token first
    response.cookies.delete('token')

    // Set new token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
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
