import { NextResponse } from 'next/server'
import { loginSchema } from '@/app/lib/validations/auth'
import clientPromise from '@/app/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST (req: Request) {
  try {
    const body = await req.json()

    // Validate request body
    const validatedData = loginSchema.parse(body)

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const users = db.collection('users')

    // Find user by email
    const user = await users.findOne({ email: validatedData.email })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.password
    )

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    // Return user data and token
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
