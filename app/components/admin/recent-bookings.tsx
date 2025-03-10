'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

interface RecentBooking {
  id: string
  roomNumber: string
  roomCategory: string
  customerName: string
  customerEmail: string
  checkIn: string
  checkOut: string
  status: string
  totalPrice: number
}

async function fetchRecentBookings (): Promise<RecentBooking[]> {
  const response = await fetch('/api/admin/recent-bookings')
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
    <div className='overflow-hidden'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
            >
              Room
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
            >
              Customer
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
            >
              Date
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white'>
          {data.map(booking => (
            <tr key={booking.id}>
              <td className='whitespace-nowrap px-6 py-4'>
                <div className='text-sm font-medium text-gray-900'>
                  {booking.roomNumber}
                </div>
                <div className='text-sm text-gray-500'>
                  {booking.roomCategory}
                </div>
              </td>
              <td className='whitespace-nowrap px-6 py-4'>
                <div className='text-sm font-medium text-gray-900'>
                  {booking.customerName}
                </div>
                <div className='text-sm text-gray-500'>
                  {booking.customerEmail}
                </div>
              </td>
              <td className='whitespace-nowrap px-6 py-4'>
                <div className='text-sm text-gray-900'>
                  {format(new Date(booking.checkIn), 'd MMM yyyy', {
                    locale: enUS
                  })}
                </div>
                <div className='text-sm text-gray-500'>
                  {format(new Date(booking.checkOut), 'd MMM yyyy', {
                    locale: enUS
                  })}
                </div>
              </td>
              <td className='whitespace-nowrap px-6 py-4'>
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    statusColors[booking.status as keyof typeof statusColors]
                  }`}
                >
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
