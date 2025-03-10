'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/app/components/ui/dialog'
import { RoomForm } from '@/app/components/admin/room-form'
import { Room } from '@/app/types/room'
import { Pencil, Trash2, Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/ui/table'
export default function RoomsPage () {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      if (!response.ok) {
        throw new Error('Failed to fetch rooms')
      }
      const data = await response.json()
      console.log('Fetched rooms:', data)
      setRooms(data)
    } catch (error) {
      console.error('Error fetching rooms:', error)
      toast.error('Failed to load rooms')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    console.log('Deleting room with id:', id)
    if (!id) {
      toast.error('Invalid room ID')
      return
    }

    if (!confirm('Are you sure you want to delete this room?')) return

    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete room')
      }

      toast.success('Room deleted successfully')
      fetchRooms()
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error('Failed to delete room')
    }
  }

  const handleEdit = (room: Room) => {
    setSelectedRoom(room)
    setIsDialogOpen(true)
  }

  const filteredRooms = rooms.filter(room =>
    Object.values(room).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Rooms Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add New Room
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                {selectedRoom ? 'Edit Room' : 'Add New Room'}
              </DialogTitle>
              <DialogDescription>
                {selectedRoom
                  ? 'Update the room details below'
                  : 'Fill in the room details below'}
              </DialogDescription>
            </DialogHeader>
            <RoomForm
              initialData={selectedRoom || undefined}
              onSuccess={() => {
                setIsDialogOpen(false)
                setSelectedRoom(null)
                fetchRooms()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className='mb-4'>
        <Input
          type='text'
          placeholder='Search rooms...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='max-w-sm'
        />
      </div>

      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRooms.map(room => (
              <TableRow key={room._id}>
                <TableCell>{room.number}</TableCell>
                <TableCell>{room.category}</TableCell>
                <TableCell>${room.price}</TableCell>
                <TableCell>{room.capacity}</TableCell>
                <TableCell>{room.status}</TableCell>
                <TableCell>
                  <div className='flex gap-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleEdit(room)}
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDelete(room._id)}
                    >
                      <Trash2 className='h-4 w-4 text-red-500' />
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
