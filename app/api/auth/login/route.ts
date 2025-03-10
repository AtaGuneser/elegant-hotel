import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import clientPromise from '@/app/lib/db'
import { loginSchema } from '@/app/lib/validations/auth'

export async function POST (request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = loginSchema.parse(body)

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const users = db.collection('users')

    // Find user
    const user = await users.findOne({ email: validatedData.email })
    if (!user) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await compare(validatedData.password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' } // Token 7 gün geçerli olacak
    )

    // Return user data and token
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Giriş işlemi başarısız oldu' },
      { status: 500 }
    )
  }
}
