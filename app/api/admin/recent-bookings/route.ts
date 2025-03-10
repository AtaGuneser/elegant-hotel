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

    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const bookings = db.collection('bookings')

    // Get recent bookings with room and user details
    const recentBookings = await bookings
      .aggregate([
        {
          $sort: { createdAt: -1 }
        },
        {
          $limit: 5
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
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$room'
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            id: { $toString: '$_id' },
            roomNumber: '$room.number',
            roomCategory: '$room.category',
            customerName: '$user.name',
            customerEmail: '$user.email',
            checkIn: 1,
            checkOut: 1,
            status: 1,
            totalPrice: 1
          }
        }
      ])
      .toArray()

    return NextResponse.json(recentBookings)
  } catch (error) {
    console.error('Error fetching recent bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
