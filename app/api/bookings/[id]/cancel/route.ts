import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { ObjectId } from 'mongodb'
import clientPromise from '@/app/lib/db'
import { authOptions } from '@/app/lib/auth'

export async function PUT (
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Find booking and check if it belongs to the user
    const booking = await db.collection('bookings').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending bookings can be cancelled' },
        { status: 400 }
      )
    }

    // Update booking status
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status: 'cancelled',
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ message: 'Booking cancelled successfully' })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}
