'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { Button } from '@/app/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card'
import { format } from 'date-fns'

interface Booking {
  _id: string
  room: {
    _id: string
    number: string
    category: string
    price: number
    images: string[]
  }
  checkIn: string
  checkOut: string
  status: 'pending' | 'confirmed' | 'cancelled'
  totalPrice: number
  createdAt: string
}

export default function MyBookingsPage () {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch('/api/bookings/my-bookings', {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
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
  }, [router])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to cancel booking')
      }

      toast.success('Booking cancelled successfully')
      fetchBookings()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Failed to cancel booking')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-2xl font-bold mb-6'>My Bookings</h1>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className='py-8'>
            <p className='text-center text-gray-500'>
              You don&apos;t have any bookings yet.
            </p>
            <Button
              className='mt-4 mx-auto block'
              onClick={() => router.push('/rooms')}
            >
              Browse Rooms
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-6'>
          {bookings.map(booking => (
            <Card key={booking._id}>
              <CardHeader>
                <div className='flex justify-between items-start'>
                  <div>
                    <CardTitle>Room {booking.room.number}</CardTitle>
                    <CardDescription>{booking.room.category}</CardDescription>
                  </div>
                  <div className='text-right'>
                    <div
                      className={`px-3 py-1 rounded-full text-sm ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </div>
                    <div className='mt-2 text-sm text-gray-500'>
                      Booked on{' '}
                      {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='grid md:grid-cols-2 gap-6'>
                  <div>
                    <div className='aspect-video relative rounded-lg overflow-hidden mb-4'>
                      <Image
                        src={booking.room.images[0]}
                        alt={`Room ${booking.room.number}`}
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div className='space-y-2'>
                      <p>
                        <strong>Check-in:</strong>{' '}
                        {format(new Date(booking.checkIn), 'MMM d, yyyy')}
                      </p>
                      <p>
                        <strong>Check-out:</strong>{' '}
                        {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                      </p>
                      <p>
                        <strong>Total Price:</strong> ${booking.totalPrice}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center justify-end'>
                    {booking.status === 'pending' && (
                      <Button
                        variant='destructive'
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
