import { NextResponse } from 'next/server'
import clientPromise from '@/app/lib/db'

export async function GET () {
  try {
    console.log('Testing MongoDB connection...')
    const client = await clientPromise
    console.log('MongoDB connected successfully')

    const db = client.db('elegant-hotel')
    const collections = await db.listCollections().toArray()
    console.log(
      'Available collections:',
      collections.map(c => c.name)
    )

    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connection successful',
      collections: collections.map(c => c.name)
    })
  } catch (error) {
    console.error('MongoDB connection test failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'MongoDB connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
