'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'

interface Booking {
  _id: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  room: {
    number: string
    category: string
    price: number
  }
}

export default function MyBookingsPage () {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        })
        if (response.ok) {
          setIsLoggedIn(true)
          fetchBookings()
        } else {
          setIsLoggedIn(false)
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsLoggedIn(false)
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [router])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings/my-bookings', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to cancel booking')
      }

      setBookings(bookings.filter(booking => booking._id !== bookingId))
      toast.success('Booking cancelled successfully')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Failed to cancel booking')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-2xl font-bold mb-6'>My Bookings</h1>
      <div className='grid gap-6'>
        {bookings.length === 0 ? (
          <Card>
            <CardContent className='py-6'>
              <p className='text-center text-gray-500'>
                You don&apos;t have any bookings yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          bookings.map(booking => (
            <Card key={booking._id}>
              <CardHeader>
                <CardTitle>Room {booking.room.number}</CardTitle>
                <CardDescription>{booking.room.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>Check-in</p>
                    <p className='font-medium'>
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Check-out</p>
                    <p className='font-medium'>
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Guests</p>
                    <p className='font-medium'>{booking.guests}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Price per night</p>
                    <p className='font-medium'>${booking.room.price}</p>
                  </div>
                </div>
                <Button
                  variant='destructive'
                  className='mt-4'
                  onClick={() => handleCancelBooking(booking._id)}
                >
                  Cancel Booking
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
