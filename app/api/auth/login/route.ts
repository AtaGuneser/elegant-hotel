import { NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'
import clientPromise from '@/app/lib/db'
import { compare } from 'bcryptjs'

export async function POST (request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const users = db.collection('users')

    // Find user
    const user = await users.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create token
    const token = sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    // Set cookie with token
    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    )

    // Clear any existing token first
    response.cookies.delete('token')

    // Set new token
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
