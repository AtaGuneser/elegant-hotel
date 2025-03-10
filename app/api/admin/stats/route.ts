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
    const users = db.collection('users')
    const rooms = db.collection('rooms')
    const bookings = db.collection('bookings')

    // Get total users
    const totalUsers = await users.countDocuments()

    // Get total rooms
    const totalRooms = await rooms.countDocuments()

    // Get total bookings
    const totalBookings = await bookings.countDocuments()

    // Get total revenue
    const revenueResult = await bookings
      .aggregate([
        {
          $match: {
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' }
          }
        }
      ])
      .toArray()
    const totalRevenue = revenueResult[0]?.total || 0

    // Get average stay duration
    const stayDurationResult = await bookings
      .aggregate([
        {
          $match: {
            status: 'completed'
          }
        },
        {
          $project: {
            duration: {
              $divide: [
                { $subtract: ['$checkOut', '$checkIn'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            average: { $avg: '$duration' }
          }
        }
      ])
      .toArray()
    const averageStayDuration = Math.round(stayDurationResult[0]?.average || 0)

    // Get occupancy rate
    const today = new Date()
    const occupancyResult = await bookings
      .aggregate([
        {
          $match: {
            status: 'confirmed',
            checkIn: { $lte: today },
            checkOut: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()
    const occupiedRooms = occupancyResult[0]?.count || 0
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100)

    return NextResponse.json({
      totalUsers,
      totalRooms,
      totalBookings,
      totalRevenue,
      averageStayDuration,
      occupancyRate
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
