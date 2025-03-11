import { Metadata } from 'next'
import { Suspense } from 'react'
import { RoomFilters } from '../components/rooms/room-filters'
import { RoomList } from '../components/rooms/room-list'

export const metadata: Metadata = {
  title: 'Rooms - Elegant Hotel',
  description: 'View all rooms at Elegant Hotel'
}

export default function RoomsPage () {
  return (
    <div className='container py-2'>
      <h1 className='text-3xl font-bold mb-2'>Our Rooms</h1>
      <Suspense fallback={<div>Loading filters...</div>}>
        <RoomFilters />
      </Suspense>
      <Suspense fallback={<div>Loading rooms...</div>}>
        <RoomList />
      </Suspense>
    </div>
  )
}
