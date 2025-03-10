export type RoomCategory = 'Basic' | 'Premium' | 'Suite'

export interface Room {
  _id: string
  number: string
  type: string
  price: number
  description: string
  amenities: string[]
  images: string[]
  capacity: number
  status: 'available' | 'occupied' | 'maintenance'
  createdAt: Date
  updatedAt: Date
}

export interface RoomAvailability {
  roomId: string
  dates: Date[]
}

export interface RoomFilter {
  category?: RoomCategory
  minPrice?: number
  maxPrice?: number
  startDate?: Date
  endDate?: Date
  capacity?: number
}

export interface RoomStats {
  totalRooms: number
  availableRooms: number
  occupancyRate: number
  averagePrice: number
  categoryDistribution: Record<RoomCategory, number>
}
