'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { toast } from 'react-hot-toast'
import { Room } from '@/app/types/room'

interface BookingFormProps {
  room: Room
}

export function BookingForm ({ room }: BookingFormProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          roomId: room._id,
          ...formData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create booking')
      }

      toast.success('Booking created successfully!')
      router.push('/my-bookings')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create booking'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return (
      <div className='space-y-4'>
        <p className='text-sm text-muted-foreground'>
          Please log in to make a reservation
        </p>
        <Button onClick={() => router.push('/login')} className='w-full'>
          Login to Book
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='checkIn'>Check-in Date</Label>
        <Input
          id='checkIn'
          type='date'
          required
          min={new Date().toISOString().split('T')[0]}
          value={formData.checkIn}
          onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='checkOut'>Check-out Date</Label>
        <Input
          id='checkOut'
          type='date'
          required
          min={formData.checkIn || new Date().toISOString().split('T')[0]}
          value={formData.checkOut}
          onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='guests'>Number of Guests</Label>
        <Input
          id='guests'
          type='number'
          min={1}
          max={room.capacity}
          required
          value={formData.guests}
          onChange={e =>
            setFormData({ ...formData, guests: parseInt(e.target.value) })
          }
        />
      </div>
      <Button type='submit' className='w-full' disabled={isLoading}>
        {isLoading ? 'Creating Booking...' : 'Book Now'}
      </Button>
    </form>
  )
}
