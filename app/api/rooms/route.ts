import { NextResponse } from 'next/server'
import clientPromise from '@/app/lib/db'
import { RoomCategory } from '@/app/types/room'

interface RoomQuery {
  category?: RoomCategory
  price?: {
    $gte?: number
    $lte?: number
  }
  capacity?: {
    $gte?: number
  }
}

export async function GET (request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as RoomCategory | null
    const minPrice = searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined
    const maxPrice = searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined
    const capacity = searchParams.get('capacity')
      ? Number(searchParams.get('capacity'))
      : undefined

    // Build query
    const query: RoomQuery = {}
    if (category) query.category = category
    if (minPrice !== undefined) query.price = { $gte: minPrice }
    if (maxPrice !== undefined) query.price = { ...query.price, $lte: maxPrice }
    if (capacity !== undefined) query.capacity = { $gte: capacity }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const rooms = db.collection('rooms')

    // Fetch rooms with filters
    const result = await rooms.find(query).toArray()

    // Transform _id to id
    const transformedRooms = result.map(room => ({
      ...room,
      id: room._id.toString(),
      _id: undefined
    }))

    return NextResponse.json(transformedRooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST (request: Request) {
  try {
    const body = await request.json()

    // Validate room data (you might want to add Zod validation here)
    const roomData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      isAvailable: true
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const rooms = db.collection('rooms')

    // Insert room
    const result = await rooms.insertOne(roomData)

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...roomData
    })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
