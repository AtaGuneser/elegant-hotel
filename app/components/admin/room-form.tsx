'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/app/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card'
import { ROOM_AMENITIES } from '@/app/lib/constants'
import { Upload, X } from 'lucide-react'

interface RoomFormProps {
  initialData?: {
    _id: string
    number: string
    type: string
    price: number
    description: string
    amenities: string[]
    images: string[]
    capacity: number
    status: string
  }
}

export function RoomForm ({ initialData }: RoomFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [number, setNumber] = useState(initialData?.number || '')
  const [type, setType] = useState(initialData?.type || '')
  const [price, setPrice] = useState(initialData?.price || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [capacity, setCapacity] = useState(initialData?.capacity || '')
  const [status, setStatus] = useState(initialData?.status || 'available')
  const [amenities, setAmenities] = useState<string[]>(
    initialData?.amenities || []
  )
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [imageUrl, setImageUrl] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const imageUrl = URL.createObjectURL(file)
      setImages(prev => [...prev, imageUrl])
      toast.success('Image uploaded successfully')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  })

  const handleAddImageUrl = () => {
    if (imageUrl && !images.includes(imageUrl)) {
      setImages([...images, imageUrl])
      setImageUrl('')
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/rooms', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...(initialData && { _id: initialData._id }),
          number,
          type,
          price: Number(price),
          description,
          capacity: Number(capacity),
          status,
          amenities,
          images
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save room')
      }

      toast.success(
        initialData ? 'Room updated successfully' : 'Room created successfully'
      )
      router.push('/admin/rooms')
      router.refresh()
    } catch (error) {
      console.error('Error saving room:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to save room'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Room' : 'Create New Room'}</CardTitle>
        <CardDescription>
          Fill in the details to {initialData ? 'update' : 'create'} a room
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='number'
                className='block text-sm font-medium mb-1'
              >
                Room Number
              </label>
              <Input
                id='number'
                value={number}
                onChange={e => setNumber(e.target.value)}
                required
                placeholder='Enter room number'
              />
            </div>

            <div>
              <label htmlFor='type' className='block text-sm font-medium mb-1'>
                Room Type
              </label>
              <Input
                id='type'
                value={type}
                onChange={e => setType(e.target.value)}
                required
                placeholder='Enter room type'
              />
            </div>

            <div>
              <label htmlFor='price' className='block text-sm font-medium mb-1'>
                Price per Night
              </label>
              <Input
                id='price'
                type='number'
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                min='0'
                step='0.01'
                placeholder='Enter price'
              />
            </div>

            <div>
              <label
                htmlFor='capacity'
                className='block text-sm font-medium mb-1'
              >
                Capacity
              </label>
              <Input
                id='capacity'
                type='number'
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                required
                min='1'
                placeholder='Enter capacity'
              />
            </div>

            <div>
              <label
                htmlFor='status'
                className='block text-sm font-medium mb-1'
              >
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='available'>Available</SelectItem>
                  <SelectItem value='occupied'>Occupied</SelectItem>
                  <SelectItem value='maintenance'>Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor='amenities'
                className='block text-sm font-medium mb-1'
              >
                Amenities
              </label>
              <Select
                value={amenities[amenities.length - 1]}
                onValueChange={value => {
                  if (!amenities.includes(value)) {
                    setAmenities([...amenities, value])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select amenities' />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_AMENITIES.map(amenity => (
                    <SelectItem key={amenity} value={amenity}>
                      {amenity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className='mt-2 flex flex-wrap gap-2'>
                {amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-sm'
                  >
                    {amenity}
                    <button
                      type='button'
                      onClick={() =>
                        setAmenities(amenities.filter((_, i) => i !== index))
                      }
                      className='text-gray-500 hover:text-gray-700'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium mb-1'
            >
              Description
            </label>
            <textarea
              id='description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={4}
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              placeholder='Enter room description'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Images</label>
            <div className='space-y-4'>
              <div className='flex gap-2'>
                <Input
                  type='url'
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder='Enter image URL'
                  className='flex-1'
                />
                <Button
                  type='button'
                  onClick={handleAddImageUrl}
                  disabled={!imageUrl}
                >
                  Add URL
                </Button>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className='mx-auto h-12 w-12 text-gray-400' />
                <p className='mt-2 text-sm text-gray-600'>
                  {isDragActive
                    ? 'Drop the image here'
                    : 'Drag and drop an image here, or click to select'}
                </p>
              </div>

              {images.length > 0 && (
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {images.map((image, index) => (
                    <div key={index} className='relative group'>
                      <img
                        src={image}
                        alt={`Room image ${index + 1}`}
                        className='w-full h-32 object-cover rounded-lg'
                      />
                      <button
                        type='button'
                        onClick={() => handleRemoveImage(index)}
                        className='absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className='flex justify-end gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push('/admin/rooms')}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading
                ? 'Saving...'
                : initialData
                ? 'Update Room'
                : 'Create Room'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
