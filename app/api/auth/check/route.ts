import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import clientPromise from '@/app/lib/db'

export async function GET (request: Request) {
  try {
    const token = request.headers
      .get('cookie')
      ?.split('token=')[1]
      ?.split(';')[0]

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      id: string
      email: string
      role: string
    }

    const client = await clientPromise
    const db = client.db()
    const user = await db.collection('users').findOne({
      _id: new ObjectId(decoded.id)
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user is admin, return admin role
    if (user.role === 'admin') {
      return NextResponse.json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: 'admin'
      })
    }

    return NextResponse.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: 'user'
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}
