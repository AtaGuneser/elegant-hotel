import { NextResponse } from 'next/server'

export async function POST () {
  try {
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )

    // Clear the token cookie
    response.cookies.delete('token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
