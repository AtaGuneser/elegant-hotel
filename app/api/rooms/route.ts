import { NextResponse } from 'next/server'
import clientPromise from '@/app/lib/db'
import { roomSchema } from '@/app/lib/validations/room'
import { verify } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

interface JwtPayload {
  id: string
  email: string
  role: string
}

interface RoomFilter {
  category?: string
  price?: {
    $gte?: number
    $lte?: number
  }
  capacity?: {
    $gte: number
  }
  _id?: {
    $nin: ObjectId[]
  }
}

export async function GET (request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const capacity = searchParams.get('capacity')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')

    // Build filter query
    const filter: RoomFilter = {}

    if (category) {
      filter.category = category
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseInt(minPrice)
      if (maxPrice) filter.price.$lte = parseInt(maxPrice)
    }

    if (capacity) {
      filter.capacity = { $gte: parseInt(capacity) }
    }

    // Check room availability if dates are provided
    if (startDate && endDate) {
      const unavailableRoomIds = await db
        .collection('bookings')
        .find({
          $or: [
            {
              checkIn: { $lte: new Date(endDate) },
              checkOut: { $gte: new Date(startDate) }
            }
          ]
        })
        .project({ roomId: 1 })
        .map(booking => new ObjectId(booking.roomId))
        .toArray()

      if (unavailableRoomIds.length > 0) {
        filter._id = { $nin: unavailableRoomIds }
      }
    }

    // Fetch filtered rooms
    const rooms = await db
      .collection('rooms')
      .find(filter)
      .sort({ price: 1 })
      .toArray()

    // Convert ObjectId to string
    const formattedRooms = rooms.map(room => ({
      ...room,
      _id: room._id.toString()
    }))

    return NextResponse.json(formattedRooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

export async function POST (request: Request) {
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

    const body = await request.json()
    console.log('Received room data:', body)

    try {
      const validatedData = roomSchema.parse(body)
      console.log('Validated room data:', validatedData)
    } catch (validationError: unknown) {
      console.error('Validation error:', validationError)
      if (
        validationError &&
        typeof validationError === 'object' &&
        'issues' in validationError
      ) {
        const issues = (
          validationError as {
            issues: Array<{
              code: string
              type?: string
              minimum?: number
              path: string[]
            }>
          }
        ).issues.map(issue => {
          switch (issue.code) {
            case 'too_small':
              if (issue.type === 'string') {
                return `${issue.path.join('.')} must be at least ${
                  issue.minimum
                } characters`
              }
              return `${issue.path.join('.')} must be at least ${issue.minimum}`
            case 'invalid_type':
              return `${issue.path.join('.')} must be a valid value`
            case 'invalid_enum_value':
              return `${issue.path.join(
                '.'
              )} must be a valid category (Basic, Premium, Suite)`
            case 'invalid_url':
              return `${issue.path.join('.')} must be a valid URL`
            default:
              return `${issue.path.join('.')} is invalid`
          }
        })
        return NextResponse.json(
          { error: 'Validation failed', details: issues },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const rooms = db.collection('rooms')

    // Check if room number already exists
    const existingRoom = await rooms.findOne({ number: body.number })
    if (existingRoom) {
      return NextResponse.json(
        { error: 'This room number is already in use' },
        { status: 400 }
      )
    }

    const result = await rooms.insertOne({
      ...body,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...body,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error creating room:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
