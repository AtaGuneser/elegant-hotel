import { NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations/auth'
import clientPromise from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST (req: Request) {
  try {
    const body = await req.json()

    // Validate request body
    const validatedData = registerSchema.parse(body)

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const users = db.collection('users')

    // Check if user already exists
    const existingUser = await users.findOne({ email: validatedData.email })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create new user
    const newUser = {
      email: validatedData.email,
      name: validatedData.name,
      password: hashedPassword,
      role: 'customer' as const,
      createdAt: new Date()
    }

    const result = await users.insertOne(newUser)

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.insertedId,
        email: newUser.email,
        role: newUser.role
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    // Return user data and token
    return NextResponse.json({
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
