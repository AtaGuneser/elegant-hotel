import { Metadata } from 'next'
import { RoomFilters } from '../components/rooms/room-filters'
import { RoomList } from '../components/rooms/room-list'

export const metadata: Metadata = {
  title: 'Rooms - Elegant Hotel',
  description: 'View all rooms at Elegant Hotel'
}

export default function RoomsPage () {
  return (
    <div className='container py-10'>
      <h1 className='text-3xl font-bold mb-8'>Our Rooms</h1>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <aside className='md:col-span-1'>
          <RoomFilters />
        </aside>
        <main className='md:col-span-3'>
          <RoomList />
        </main>
      </div>
    </div>
  )
}
