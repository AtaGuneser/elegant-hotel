import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST () {
  try {
    // Clear all cookies
    const cookieStore = await cookies()
    cookieStore.delete('token')
    cookieStore.delete('credentials')
    cookieStore.delete('session')

    const response = NextResponse.json({ success: true })

    // Also clear cookies from the response
    response.cookies.delete('token')
    response.cookies.delete('credentials')
    response.cookies.delete('session')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
