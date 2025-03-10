import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import clientPromise from '@/app/lib/db'
import { cookies } from 'next/headers'

export async function POST (request: Request) {
  try {
    const { email, password } = await request.json()

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')

    // Find admin user
    const user = await db.collection('users').findOne({
      email,
      role: 'admin'
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Clear existing cookies
    const cookieStore = await cookies()
    cookieStore.delete('token')

    // Create new admin token
    const token = sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: 'admin'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    )

    // Set new admin token cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
