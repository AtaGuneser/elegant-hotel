import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import clientPromise from '@/app/lib/db'
import { registerSchema } from '@/app/lib/validations/auth'

export async function POST (request: Request) {
  try {
    console.log('Registration request received')
    const body = await request.json()
    console.log('Request body:', body)

    // Validate request body
    const validatedData = registerSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Connect to MongoDB
    console.log('Connecting to MongoDB...')
    const client = await clientPromise
    console.log('MongoDB connected')
    const db = client.db('elegant-hotel')
    const users = db.collection('users')

    // Check if user already exists
    console.log('Checking for existing user...')
    const existingUser = await users.findOne({ email: validatedData.email })
    if (existingUser) {
      console.log('User already exists:', existingUser.email)
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 400 }
      )
    }

    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await hash(validatedData.password, 12)

    // Create user
    console.log('Creating new user...')
    const result = await users.insertOne({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('User created successfully:', result.insertedId)

    // Return user without password
    return NextResponse.json({
      id: result.insertedId.toString(),
      name: validatedData.name,
      email: validatedData.email,
      role: 'customer'
    })
  } catch (error) {
    console.error('Detailed registration error:', error)
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      {
        error: 'Registration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
