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

    // Verify token and check if user is admin
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')

    // Fetch last 3 bookings with room and user details
    const bookings = await db
      .collection('bookings')
      .aggregate([
        {
          $lookup: {
            from: 'rooms',
            let: { roomId: { $toObjectId: '$roomId' } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$roomId'] }
                }
              }
            ],
            as: 'room'
          }
        },
        {
          $unwind: '$room'
        },
        {
          $lookup: {
            from: 'users',
            let: { userId: { $toObjectId: '$userId' } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$userId'] }
                }
              }
            ],
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: { $toString: '$_id' },
            checkIn: 1,
            checkOut: 1,
            guests: 1,
            totalPrice: 1,
            status: 1,
            'room._id': { $toString: '$room._id' },
            'room.number': 1,
            'room.category': 1,
            'user.name': 1,
            'user.email': 1,
            createdAt: 1
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $limit: 3
        }
      ])
      .toArray()

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching recent bookings:', error)
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
