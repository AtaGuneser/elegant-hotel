'use client'

import { useQuery } from '@tanstack/react-query'
import { Room } from '@/app/types/room'
import { RoomCard } from '@/app/components/rooms/room-card'
import { useSearchParams } from 'next/navigation'

async function fetchRooms (searchParams: URLSearchParams): Promise<Room[]> {
  const response = await fetch(`/api/rooms?${searchParams.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch rooms')
  }
  return response.json()
}

export function RoomList () {
  const searchParams = useSearchParams()

  const {
    data: rooms,
    isLoading,
    error
  } = useQuery({
    queryKey: ['rooms', searchParams.toString()],
    queryFn: () => fetchRooms(searchParams)
  })

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className='h-[400px] bg-gray-100 animate-pulse rounded-lg'
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center text-red-500'>
        An error occurred while loading rooms. Please try again.
      </div>
    )
  }

  if (!rooms?.length) {
    return (
      <div className='text-center text-gray-500'>
        No rooms found matching your criteria.
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {rooms.map(room => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  )
}
