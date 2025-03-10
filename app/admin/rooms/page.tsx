'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Room } from '@/app/types/room'
import { RoomForm } from '@/app/components/admin/room-form'

import { Button } from '@/app/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/app/components/ui/dialog'

async function fetchRooms () {
  const response = await fetch('/api/rooms')
  if (!response.ok) {
    throw new Error('Failed to fetch rooms')
  }
  return response.json()
}

async function deleteRoom (id: string) {
  const response = await fetch(`/api/rooms/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete room')
  }

  return response.json()
}

export default function RoomsPage () {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Room deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Room Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add New Room
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
            </DialogHeader>
            <RoomForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Room Number
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Type
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Price
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Capacity
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {rooms?.map((room: Room) => (
              <tr key={room._id}>
                <td className='px-6 py-4 whitespace-nowrap'>{room.number}</td>
                <td className='px-6 py-4 whitespace-nowrap'>{room.type}</td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  ${room.price.toLocaleString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>{room.capacity}</td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (room.status || 'available') === 'available'
                        ? 'bg-green-100 text-green-800'
                        : (room.status || 'available') === 'occupied'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {(room.status || 'available').charAt(0).toUpperCase() +
                      (room.status || 'available').slice(1)}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <Edit className='h-4 w-4' />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-3xl'>
                      <DialogHeader>
                        <DialogTitle>Edit Room</DialogTitle>
                      </DialogHeader>
                      <RoomForm initialData={room} />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => {
                      if (
                        confirm('Are you sure you want to delete this room?')
                      ) {
                        deleteMutation.mutate(room._id)
                      }
                    }}
                  >
                    <Trash2 className='h-4 w-4 text-red-500' />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
