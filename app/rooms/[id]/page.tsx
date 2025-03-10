'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card'
import { Calendar } from '@/app/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/app/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface Room {
  _id: string
  number: string
  type: string
  price: number
  description: string
  amenities: string[]
  images: string[]
  capacity: number
  status: string
}

export default function RoomDetailPage () {
  const params = useParams()
  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch room details')
        }
        const data = await response.json()
        setRoom(data)
      } catch (error) {
        console.error('Error fetching room:', error)
        toast.error('Failed to load room details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoom()
  }, [params.id])

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    if (checkIn >= checkOut) {
      toast.error('Check-out date must be after check-in date')
      return
    }

    setIsBooking(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: room?._id,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Booking failed')
      }

      toast.success('Booking successful!')
      // Reset form
      setCheckIn(undefined)
      setCheckOut(undefined)
      setGuests(1)
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(error instanceof Error ? error.message : 'Booking failed')
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) {
    return (
      <div className='container py-10'>
        <div className='text-center'>Loading...</div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className='container py-10'>
        <div className='text-center'>Room not found</div>
      </div>
    )
  }

  return (
    <div className='container py-10'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        <div className='md:col-span-2'>
          <div className='aspect-video relative rounded-lg overflow-hidden mb-6'>
            <img
              src={room.images[0] || '/placeholder.jpg'}
              alt={`Room ${room.number}`}
              className='object-cover w-full h-full'
            />
          </div>
          <h1 className='text-3xl font-bold mb-4'>Room {room.number}</h1>
          <p className='text-gray-600 mb-6'>{room.description}</p>

          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-2'>Amenities</h2>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
              {room.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className='bg-gray-100 px-3 py-1 rounded-full text-sm'
                >
                  {amenity}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='md:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle>Book This Room</CardTitle>
              <CardDescription>
                Select your dates and number of guests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Check-in Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !checkIn && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {checkIn ? format(checkIn, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <Calendar
                        mode='single'
                        selected={checkIn}
                        onSelect={setCheckIn}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Check-out Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !checkOut && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {checkOut ? format(checkOut, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <Calendar
                        mode='single'
                        selected={checkOut}
                        onSelect={setCheckOut}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label
                    htmlFor='guests'
                    className='block text-sm font-medium mb-1'
                  >
                    Number of Guests
                  </label>
                  <Input
                    id='guests'
                    type='number'
                    min={1}
                    max={room.capacity}
                    value={guests}
                    onChange={e => setGuests(Number(e.target.value))}
                    className='w-full'
                  />
                </div>

                <div className='pt-4 border-t'>
                  <div className='flex justify-between mb-4'>
                    <span className='font-medium'>Price per night</span>
                    <span>${room.price}</span>
                  </div>
                  {checkIn && checkOut && (
                    <div className='flex justify-between mb-4'>
                      <span className='font-medium'>Total</span>
                      <span>
                        $
                        {room.price *
                          Math.ceil(
                            (checkOut.getTime() - checkIn.getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  className='w-full'
                  onClick={handleBooking}
                  disabled={isBooking || !checkIn || !checkOut}
                >
                  {isBooking ? 'Processing...' : 'Book Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
