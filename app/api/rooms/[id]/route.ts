import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/app/lib/db'
import { roomSchema } from '@/app/lib/validations/room'
import { verify } from 'jsonwebtoken'

interface JwtPayload {
  id: string
  email: string
  role: string
}

export async function GET (
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db()
    const rooms = db.collection('rooms')

    const room = await rooms.findOne({
      _id: new ObjectId(params.id)
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room details' },
      { status: 500 }
    )
  }
}

export async function PUT (
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

    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = roomSchema.parse(body)

    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const rooms = db.collection('rooms')

    // Check if room exists
    const existingRoom = await rooms.findOne({ _id: new ObjectId(params.id) })
    if (!existingRoom) {
      return NextResponse.json({ error: 'Oda bulunamadı' }, { status: 404 })
    }

    // Check if new room number is already taken by another room
    if (validatedData.number !== existingRoom.number) {
      const roomWithNumber = await rooms.findOne({
        number: validatedData.number
      })
      if (roomWithNumber) {
        return NextResponse.json(
          { error: 'Bu oda numarası zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    const result = await rooms.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...validatedData,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Oda bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({
      id: params.id,
      ...validatedData,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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

    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const rooms = db.collection('rooms')

    // Check if room exists
    const existingRoom = await rooms.findOne({ _id: new ObjectId(params.id) })
    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check if room has any bookings
    const bookings = db.collection('bookings')
    const hasBookings = await bookings.findOne({ roomId: params.id })
    if (hasBookings) {
      return NextResponse.json(
        { error: 'This room cannot be deleted because it has bookings' },
        { status: 400 }
      )
    }

    const result = await rooms.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Room deleted successfully' })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
