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

    // Get total bookings
    const totalBookings = await db.collection('bookings').countDocuments()

    // Get total rooms
    const totalRooms = await db.collection('rooms').countDocuments()

    // Get total users
    const totalUsers = await db.collection('users').countDocuments()

    // Get recent bookings
    const recentBookings = await db
      .collection('bookings')
      .aggregate([
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
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
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
            totalPrice: 1,
            status: 1,
            'room.number': 1,
            'room.category': 1,
            'user.email': 1
          }
        },
        {
          $sort: { checkIn: -1 }
        },
        {
          $limit: 5
        }
      ])
      .toArray()

    return NextResponse.json({
      totalBookings,
      totalRooms,
      totalUsers,
      recentBookings
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
