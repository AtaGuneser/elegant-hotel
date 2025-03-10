import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/app/lib/db'
import { verify } from 'jsonwebtoken'
import {
  bookingSchema,
  bookingFilterSchema
} from '@/app/lib/validations/booking'
import { BookingStatus } from '@/app/types/booking'

interface JwtPayload {
  id: string
  email: string
  role: string
}

interface BookingQuery {
  status?: BookingStatus
  roomId?: string
  userId?: string
  $or?: Array<{
    checkIn?: { $gte?: Date }
    checkOut?: { $lte?: Date }
  }>
}

export async function GET (request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const roomId = searchParams.get('roomId')
    const userId = searchParams.get('userId')

    // Validate filter parameters
    const filterData = bookingFilterSchema.parse({
      status: status as BookingStatus,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      roomId,
      userId
    })

    // Build query
    const query: BookingQuery = {}
    if (filterData.status) query.status = filterData.status
    if (filterData.roomId) query.roomId = filterData.roomId
    if (filterData.userId) query.userId = filterData.userId
    if (filterData.startDate || filterData.endDate) {
      query.$or = []
      if (filterData.startDate) {
        query.$or.push({ checkIn: { $gte: filterData.startDate } })
      }
      if (filterData.endDate) {
        query.$or.push({ checkOut: { $lte: filterData.endDate } })
      }
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const bookings = db.collection('bookings')

    // Fetch bookings
    const result = await bookings.find(query).toArray()

    // Transform _id to id
    const transformedBookings = result.map(booking => ({
      ...booking,
      id: booking._id.toString(),
      _id: undefined
    }))

    return NextResponse.json(transformedBookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST (req: Request) {
  try {
    // Get token from cookie
    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload
      const userId = decoded.id

      const json = await req.json()
      console.log('Received booking data:', json)

      const body = bookingSchema.parse(json)
      console.log('Parsed booking data:', body)

      const client = await clientPromise
      const db = client.db()

      // Check if room exists and is available
      const room = await db.collection('rooms').findOne({
        _id: new ObjectId(body.roomId),
        status: 'available'
      })
      console.log('Found room:', room)

      if (!room) {
        return NextResponse.json(
          { error: 'Room not found or not available' },
          { status: 404 }
        )
      }

      // Check if room is already booked for the selected dates
      const existingBooking = await db.collection('bookings').findOne({
        roomId: new ObjectId(body.roomId),
        status: { $in: ['pending', 'confirmed'] },
        $or: [
          {
            checkIn: { $lte: new Date(body.checkOut) },
            checkOut: { $gte: new Date(body.checkIn) }
          }
        ]
      })

      if (existingBooking) {
        return NextResponse.json(
          { error: 'Room is not available for selected dates' },
          { status: 400 }
        )
      }

      // Calculate total price
      const checkIn = new Date(body.checkIn)
      const checkOut = new Date(body.checkOut)
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
      const totalPrice = room.price * nights

      // Create booking
      const booking = await db.collection('bookings').insertOne({
        userId,
        roomId: new ObjectId(body.roomId),
        checkIn: new Date(body.checkIn),
        checkOut: new Date(body.checkOut),
        guests: body.guests,
        totalPrice,
        status: 'pending',
        createdAt: new Date()
      })

      return NextResponse.json(
        { bookingId: booking.insertedId },
        { status: 201 }
      )
    } catch (verifyError) {
      console.error('Token verification error:', verifyError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
