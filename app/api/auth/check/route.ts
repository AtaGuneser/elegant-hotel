import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import clientPromise from '@/app/lib/db'
import { ObjectId } from 'mongodb'

export async function GET (request: Request) {
  try {
    // Get token from cookie
    const token = request.headers
      .get('cookie')
      ?.split('token=')[1]
      ?.split(';')[0]

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET!) as {
      id: string
      email: string
      role: string
    }

    // Get user from database
    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const users = db.collection('users')
    const user = await users.findOne({ _id: new ObjectId(decoded.id) })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}
