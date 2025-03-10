'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card'

interface RecentBooking {
  _id: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: string
  room: {
    _id: string
    number: string
    category: string
  }
  user: {
    name: string
    email: string
  }
  createdAt: string
}

async function fetchRecentBookings (): Promise<RecentBooking[]> {
  const response = await fetch('/api/admin/recent-bookings', {
    credentials: 'include'
  })
  if (!response.ok) {
    throw new Error('Failed to fetch recent bookings')
  }
  return response.json()
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
}

export function RecentBookings () {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recentBookings'],
    queryFn: fetchRecentBookings
  })

  if (isLoading) {
    return (
      <div className='flex h-32 items-center justify-center'>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex h-32 items-center justify-center'>
        <p className='text-sm text-gray-500'>
          An error occurred while loading bookings
        </p>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className='flex h-32 items-center justify-center'>
        <p className='text-sm text-gray-500'>No bookings found</p>
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {data.map(booking => (
        <Card key={booking._id}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Room {booking.room.number}
            </CardTitle>
            <span
              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                statusColors[booking.status as keyof typeof statusColors]
              }`}
            >
              {booking.status}
            </span>
          </CardHeader>
          <CardContent>
            <div className='text-sm'>
              <div className='font-medium'>{booking.user.name}</div>
              <div className='text-muted-foreground'>{booking.user.email}</div>
            </div>
            <div className='mt-2 space-y-1 text-sm text-muted-foreground'>
              <div>
                Check In:{' '}
                {format(new Date(booking.checkIn), 'PPP', { locale: enUS })}
              </div>
              <div>
                Check Out:{' '}
                {format(new Date(booking.checkOut), 'PPP', { locale: enUS })}
              </div>
              <div>Guests: {booking.guests}</div>
              <div>Total: ${booking.totalPrice.toLocaleString()}</div>
              <div className='text-xs'>
                Booked on:{' '}
                {format(new Date(booking.createdAt), 'PPP', { locale: enUS })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
