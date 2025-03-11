'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Room } from '@/app/types/room'
import { RoomCard } from './room-card'

export function RoomList () {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/rooms?${searchParams.toString()}`)
        const data = await response.json()
        setRooms(data)
      } catch (error) {
        console.error('Error fetching rooms:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [searchParams])

  if (loading) {
    return <div>Loading rooms...</div>
  }

  if (rooms.length === 0) {
    return <div>No rooms found matching your criteria.</div>
  }

  return (
    <main className='md:col-span-3 mt-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {rooms.map(room => (
          <RoomCard key={room._id} room={room} />
        ))}
      </div>
    </main>
  )
}
