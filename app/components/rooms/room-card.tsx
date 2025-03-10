'use client'

import Image from 'next/image'
import { Room } from '@/app/types/room'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import Link from 'next/link'

interface RoomCardProps {
  room: Room
}

export function RoomCard ({ room }: RoomCardProps) {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='p-0'>
        <div className='relative aspect-video'>
          <Image
            src={room.images[0]}
            alt={`${room.type} Room ${room.number}`}
            fill
            className='object-cover'
          />
        </div>
      </CardHeader>
      <CardContent className='p-4'>
        <div className='flex justify-between items-start mb-2'>
          <div>
            <h3 className='text-lg font-semibold'>{room.type} Room</h3>
            <p className='text-sm text-muted-foreground'>
              Room No: {room.number}
            </p>
          </div>
          <div className='text-right'>
            <p className='text-lg font-bold'>₺{room.price}</p>
            <p className='text-sm text-muted-foreground'>per night</p>
          </div>
        </div>
        <p className='text-sm text-muted-foreground mb-4'>{room.description}</p>
        <div className='flex flex-wrap gap-2 mb-4'>
          {room.amenities.map(amenity => (
            <span
              key={amenity}
              className='text-xs bg-secondary px-2 py-1 rounded-full'
            >
              {amenity}
            </span>
          ))}
        </div>
        <p className='text-sm'>
          <span className='font-medium'>Capacity:</span> {room.capacity} people
        </p>
      </CardContent>
      <CardFooter className='p-4 pt-0'>
        <Link href={`/rooms/${room._id}`} className='w-full'>
          <Button className='w-full cursor-pointer'>Make Reservation</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
