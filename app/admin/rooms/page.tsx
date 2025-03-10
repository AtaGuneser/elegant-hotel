'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Room } from '@/app/types/room'

async function fetchRooms () {
  const response = await fetch('/api/rooms')
  if (!response.ok) {
    throw new Error('Failed to fetch rooms')
  }
  return response.json()
}

async function createRoom (data: Omit<Room, 'id'>) {
  const response = await fetch('/api/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create room')
  }

  return response.json()
}

async function updateRoom (id: string, data: Omit<Room, 'id'>) {
  const response = await fetch(`/api/rooms/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update room')
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const queryClient = useQueryClient()

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms
  })

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setIsAddModalOpen(false)
      toast.success('Room added successfully')
    },
    onError: (error: { details?: string[] | undefined; message?: string }) => {
      if (error.details) {
        error.details.forEach((detail: string) => {
          toast.error(detail)
        })
      } else {
        toast.error(error.message || 'Failed to create room')
      }
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Room, 'id'> }) =>
      updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setIsEditModalOpen(false)
      setSelectedRoom(null)
      toast.success('Room updated successfully')
    },
    onError: (error: { details?: string[] | undefined; message?: string }) => {
      if (error.details) {
        error.details.forEach((detail: string) => {
          toast.error(detail)
        })
      } else {
        toast.error(error.message || 'Failed to update room')
      }
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Oda başarıyla silindi')
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
        <h1 className='text-2xl font-bold'>Oda Yönetimi</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
        >
          <Plus size={20} />
          Yeni Oda Ekle
        </button>
      </div>

      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Oda Numarası
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Kategori
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Fiyat
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Kapasite
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Durum
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {rooms?.map((room: Room) => (
              <tr key={room.id}>
                <td className='px-6 py-4 whitespace-nowrap'>{room.number}</td>
                <td className='px-6 py-4 whitespace-nowrap'>{room.category}</td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {room.price.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  })}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>{room.capacity}</td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      room.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {room.isAvailable ? 'Müsait' : 'Dolu'}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  <button
                    onClick={() => {
                      setSelectedRoom(room)
                      setIsEditModalOpen(true)
                    }}
                    className='text-blue-600 hover:text-blue-900 mr-4'
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm('Bu odayı silmek istediğinizden emin misiniz?')
                      ) {
                        deleteMutation.mutate(room.id)
                      }
                    }}
                    className='text-red-600 hover:text-red-900'
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <h2 className='text-xl font-bold mb-4'>Yeni Oda Ekle</h2>
            <form
              onSubmit={e => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const amenities = (formData.get('amenities') as string)
                  .split(',')
                  .map(a => a.trim())
                const images = (formData.get('images') as string)
                  .split(',')
                  .map(i => i.trim())

                const roomData = {
                  number: formData.get('number') as string,
                  category: formData.get('category') as Room['category'],
                  price: Number(formData.get('price')),
                  description: formData.get('description') as string,
                  amenities,
                  images,
                  capacity: Number(formData.get('capacity')),
                  isAvailable: true,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }

                console.log('Submitting room data:', roomData)
                createMutation.mutate(roomData)
              }}
              className='space-y-4'
            >
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Oda Numarası
                </label>
                <input
                  type='text'
                  name='number'
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Kategori
                </label>
                <select
                  name='category'
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                >
                  <option value='Basic'>Basic</option>
                  <option value='Premium'>Premium</option>
                  <option value='Suite'>Suite</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Fiyat
                </label>
                <input
                  type='number'
                  name='price'
                  required
                  min='0'
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Açıklama
                </label>
                <textarea
                  name='description'
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Özellikler (virgülle ayırın)
                </label>
                <input
                  type='text'
                  name='amenities'
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Resimler (virgülle ayırın)
                </label>
                <input
                  type='text'
                  name='images'
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Kapasite
                </label>
                <input
                  type='number'
                  name='capacity'
                  required
                  min='1'
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div className='flex justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => setIsAddModalOpen(false)}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                >
                  İptal
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {isEditModalOpen && selectedRoom && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <h2 className='text-xl font-bold mb-4'>Oda Düzenle</h2>
            <form
              onSubmit={e => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const amenities = (formData.get('amenities') as string)
                  .split(',')
                  .map(a => a.trim())
                const images = (formData.get('images') as string)
                  .split(',')
                  .map(i => i.trim())

                const roomData = {
                  number: formData.get('number') as string,
                  category: formData.get('category') as Room['category'],
                  price: Number(formData.get('price')),
                  description: formData.get('description') as string,
                  amenities,
                  images,
                  capacity: Number(formData.get('capacity')),
                  isAvailable: selectedRoom.isAvailable,
                  createdAt: selectedRoom.createdAt,
                  updatedAt: new Date()
                }

                console.log('Submitting room data:', roomData)
                updateMutation.mutate({
                  id: selectedRoom.id,
                  data: roomData
                })
              }}
              className='space-y-4'
            >
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Oda Numarası
                </label>
                <input
                  type='text'
                  name='number'
                  defaultValue={selectedRoom.number}
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Kategori
                </label>
                <select
                  name='category'
                  defaultValue={selectedRoom.category}
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                >
                  <option value='Basic'>Basic</option>
                  <option value='Premium'>Premium</option>
                  <option value='Suite'>Suite</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Fiyat
                </label>
                <input
                  type='number'
                  name='price'
                  defaultValue={selectedRoom.price}
                  required
                  min='0'
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Açıklama
                </label>
                <textarea
                  name='description'
                  defaultValue={selectedRoom.description}
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Özellikler (virgülle ayırın)
                </label>
                <input
                  type='text'
                  name='amenities'
                  defaultValue={selectedRoom.amenities.join(',')}
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Resimler (virgülle ayırın)
                </label>
                <input
                  type='text'
                  name='images'
                  defaultValue={selectedRoom.images.join(',')}
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Kapasite
                </label>
                <input
                  type='number'
                  name='capacity'
                  defaultValue={selectedRoom.capacity}
                  required
                  min='1'
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div className='flex justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setSelectedRoom(null)
                  }}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                >
                  İptal
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
