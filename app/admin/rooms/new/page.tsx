import { Metadata } from 'next'
import { RoomForm } from '@/app/components/admin/room-form'

export const metadata: Metadata = {
  title: 'Create Room - Elegant Hotel',
  description: 'Create a new room'
}

export default function NewRoomPage () {
  return (
    <div className='container py-10'>
      <RoomForm />
    </div>
  )
}
