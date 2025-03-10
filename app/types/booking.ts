export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Booking {
  id: string
  roomId: string
  userId: string
  checkIn: Date
  checkOut: Date
  status: BookingStatus
  totalPrice: number
  guestCount: number
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
}

export interface BookingFilter {
  status?: BookingStatus
  startDate?: Date
  endDate?: Date
  roomId?: string
  userId?: string
}

export interface BookingStats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  cancelledBookings: number
  completedBookings: number
  totalRevenue: number
  averageStayDuration: number
  occupancyRate: number
}
