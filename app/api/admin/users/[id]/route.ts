import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/app/lib/db'
import { verify } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

interface JwtPayload {
  id: string
  email: string
  role: string
}

interface UserUpdateData {
  email: string
  role: string
  password?: string
}

export async function PUT (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get token from cookie
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token and check if user is admin
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, password, role } = await request.json()

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')

    // Check if email already exists
    const existingUser = await db.collection('users').findOne({
      email,
      _id: { $ne: new ObjectId((await params).id) }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password if provided
    const updateData: UserUpdateData = { email, role }
    if (password) {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(password, salt)
    }

    // Update user
    const result = await db
      .collection('users')
      .updateOne({ _id: new ObjectId((await params).id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get token from cookie
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token and check if user is admin
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')

    // Delete user
    const result = await db
      .collection('users')
      .deleteOne({ _id: new ObjectId((await params).id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
