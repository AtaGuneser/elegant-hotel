import { NextResponse } from 'next/server'
import clientPromise from '@/app/lib/db'
import { verify } from 'jsonwebtoken'

interface JwtPayload {
  id: string
  email: string
  role: string
}

export async function GET (request: Request) {
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

    // Fetch user's bookings with room details
    const bookings = await db
      .collection('bookings')
      .aggregate([
        {
          $match: {
            userId: userId
          }
        },
        {
          $addFields: {
            roomId: { $toObjectId: '$roomId' }
          }
        },
        {
          $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'room'
          }
        },
        {
          $unwind: '$room'
        },
        {
          $project: {
            _id: { $toString: '$_id' },
            roomId: { $toString: '$roomId' },
            checkIn: 1,
            checkOut: 1,
            guests: 1,
            totalPrice: 1,
            status: 1,
            'room.number': 1,
            'room.category': 1,
            'room.price': 1,
            'room.images': 1
          }
        }
      ])
      .toArray()

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
