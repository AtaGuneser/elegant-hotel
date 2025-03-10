import { NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'
import { compare, hash } from 'bcryptjs'
import clientPromise from '@/app/lib/db'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export async function POST (request: Request) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const users = db.collection('users')

    // Find user
    let user = await users.findOne({ email: validatedData.email })

    // If no user found and credentials match default admin, create admin user
    if (
      !user &&
      validatedData.email === 'admin@admin.com' &&
      validatedData.password === '123456'
    ) {
      const hashedPassword = await hash('123456', 10)
      const result = await users.insertOne({
        email: 'admin@admin.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      user = {
        _id: result.insertedId,
        email: 'admin@admin.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin'
      }
    }

    if (!user) {
      return NextResponse.json(
        { message: 'Email or password is incorrect' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'You do not have permission to access this page' },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await compare(validatedData.password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Email or password is incorrect' },
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
      { expiresIn: '7d' }
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
    console.error('Error during admin login:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
