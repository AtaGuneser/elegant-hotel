import { NextResponse } from 'next/server'
import clientPromise from '@/app/lib/db'
import { roomSchema } from '@/app/lib/validations/room'
import { verify } from 'jsonwebtoken'

interface JwtPayload {
  id: string
  email: string
  role: string
}

export async function GET () {
  try {
    const client = await clientPromise
    const db = client.db('elegant-hotel')
    const rooms = db.collection('rooms')

    const result = await rooms.find().toArray()

    return NextResponse.json(
      result.map(room => ({
        ...room,
        id: room._id.toString(),
        _id: undefined
      }))
    )
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
