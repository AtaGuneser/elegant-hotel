import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/app/lib/db'
import {
  bookingSchema,
  bookingFilterSchema
} from '@/app/lib/validations/booking'
import { verify } from 'jsonwebtoken'
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

export async function POST (request: Request) {
  try {
    const body = await request.json()
    const validatedData = bookingSchema.parse(body)

    // Get user from token
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload
    const userId = decoded.id

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const bookings = db.collection('bookings')
    const rooms = db.collection('rooms')

    // Get room details
    const room = await rooms.findOne({
      _id: new ObjectId(validatedData.roomId)
    })
    if (!room) {
      return NextResponse.json({ error: 'Oda bulunamadı' }, { status: 404 })
    }

    // Check room availability
    const existingBooking = await bookings.findOne({
      roomId: validatedData.roomId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkIn: { $lte: validatedData.checkOut },
          checkOut: { $gte: validatedData.checkIn }
        }
      ]
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Bu tarihler için oda müsait değil' },
        { status: 400 }
      )
    }

    // Calculate total price
    const nights = Math.ceil(
      (validatedData.checkOut.getTime() - validatedData.checkIn.getTime()) /
        (1000 * 60 * 60 * 24)
    )
    const totalPrice = room.price * nights

    // Create booking
    const result = await bookings.insertOne({
      ...validatedData,
      userId,
      status: 'pending',
      totalPrice,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...validatedData,
      userId,
      status: 'pending',
      totalPrice,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
