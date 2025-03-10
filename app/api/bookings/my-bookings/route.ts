import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import clientPromise from '@/app/lib/db'

export async function GET () {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get user's bookings with room details
    const bookings = await db
      .collection('bookings')
      .aggregate([
        {
          $match: {
            userId: session.user.id
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
          $sort: {
            createdAt: -1
          }
        }
      ])
      .toArray()

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
