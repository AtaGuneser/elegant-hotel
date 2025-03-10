'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/components/ui/table'
import { Button } from '@/app/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/app/components/ui/dropdown-menu'
import { Trash2, MoreVertical, Check, X, Clock } from 'lucide-react'

interface Booking {
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
    price: number
  }
  user: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
}

async function fetchBookings (): Promise<Booking[]> {
  const response = await fetch('/api/admin/bookings', {
    credentials: 'include'
  })
  if (!response.ok) {
    throw new Error('Failed to fetch bookings')
  }
  return response.json()
}

async function deleteBooking (id: string) {
  const response = await fetch(`/api/admin/bookings/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  if (!response.ok) {
    throw new Error('Failed to delete booking')
  }
  return response.json()
}

async function updateBookingStatus (id: string, status: string) {
  const response = await fetch(`/api/admin/bookings/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  })
  if (!response.ok) {
    throw new Error('Failed to update booking status')
  }
  return response.json()
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
}

const statusActions = {
  pending: [
    { label: 'Confirm', value: 'confirmed', icon: Check },
    { label: 'Cancel', value: 'cancelled', icon: X }
  ],
  confirmed: [
    { label: 'Complete', value: 'completed', icon: Clock },
    { label: 'Cancel', value: 'cancelled', icon: X }
  ],
  cancelled: [{ label: 'Reopen', value: 'pending', icon: Clock }],
  completed: [{ label: 'Reopen', value: 'pending', icon: Clock }]
}

export default function BookingsPage () {
  const {
    data: bookings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: fetchBookings
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteBooking(id)
      toast.success('Booking deleted successfully')
      refetch()
    } catch (error) {
      console.error('Error deleting booking:', error)
      toast.error('Failed to delete booking')
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateBookingStatus(id, newStatus)
      toast.success('Booking status updated successfully')
      refetch()
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update booking status')
    }
  }

  if (isLoading) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <p className='text-red-500'>Failed to load bookings</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-8 text-3xl font-bold'>Bookings</h1>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings?.map(booking => (
              <TableRow key={booking._id}>
                <TableCell>
                  <div>
                    <div className='font-medium'>
                      Room {booking.room.number}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {booking.room.category}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className='font-medium'>{booking.user.name}</div>
                    <div className='text-sm text-gray-500'>
                      {booking.user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(booking.checkIn), 'PPP', { locale: enUS })}
                </TableCell>
                <TableCell>
                  {format(new Date(booking.checkOut), 'PPP', { locale: enUS })}
                </TableCell>
                <TableCell>{booking.guests}</TableCell>
                <TableCell>${booking.totalPrice.toLocaleString()}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      statusColors[booking.status as keyof typeof statusColors]
                    }`}
                  >
                    {booking.status}
                  </span>
                </TableCell>
                <TableCell>
                  {format(new Date(booking.createdAt), 'PPP', { locale: enUS })}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <span className='sr-only'>Open menu</span>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        {statusActions[
                          booking.status as keyof typeof statusActions
                        ].map(action => (
                          <DropdownMenuItem
                            key={action.value}
                            onClick={() =>
                              handleStatusUpdate(booking._id, action.value)
                            }
                          >
                            <action.icon className='mr-2 h-4 w-4' />
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant='destructive'
                      size='icon'
                      onClick={() => handleDelete(booking._id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
