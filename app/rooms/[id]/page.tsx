'use client'

import { useEffect, useState, use } from 'react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { BookingForm } from '@/app/components/booking-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card'
import { Room } from '@/app/types/room'

export default function RoomDetailPage ({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRoom () {
      try {
        const response = await fetch(`/api/rooms/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch room')
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
  }, [resolvedParams.id])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!room) {
    return <div>Room not found</div>
  }

  return (
    <div className='container mx-auto py-8'>
      <div className='grid md:grid-cols-2 gap-8'>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Room {room.number}</CardTitle>
              <CardDescription>{room.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='aspect-video relative rounded-lg overflow-hidden mb-4'>
                <Image
                  src={room.images[0]}
                  alt={`Room ${room.number}`}
                  fill
                  sizes='(max-width: 768px) 100vw, 50vw'
                  priority
                  className='object-cover'
                />
              </div>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-semibold'>Description</h3>
                  <p className='text-gray-600'>{room.description}</p>
                </div>
                <div>
                  <h3 className='font-semibold'>Amenities</h3>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className='px-3 py-1 bg-gray-100 rounded-full text-sm'
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold'>Details</h3>
                  <div className='grid grid-cols-2 gap-4 mt-2'>
                    <div>
                      <p className='text-sm text-gray-500'>Price per night</p>
                      <p className='font-medium'>${room.price}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Capacity</p>
                      <p className='font-medium'>{room.capacity} guests</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <BookingForm room={room} />
        </div>
      </div>
    </div>
  )
}
