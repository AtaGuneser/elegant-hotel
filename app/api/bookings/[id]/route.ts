import { NextResponse } from 'next/server'
import clientPromise from '@/app/lib/db'
import { verify } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

interface JwtPayload {
  id: string
  email: string
  role: string
}

export async function DELETE (
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookie
    const token = request.headers
      .get('cookie')
      ?.split('token=')[1]
      ?.split(';')[0]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload
    const userId = decoded.id

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')

    // Find the booking
    const booking = await db.collection('bookings').findOne({
      _id: new ObjectId(params.id),
      userId: userId
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete the booking
    await db.collection('bookings').deleteOne({
      _id: new ObjectId(params.id)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
