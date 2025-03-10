import { z } from 'zod'

export const bookingSchema = z
  .object({
    roomId: z.string(),
    checkIn: z.string().refine(date => {
      try {
        new Date(date)
        return true
      } catch {
        return false
      }
    }, 'Invalid date format'),
    checkOut: z.string().refine(date => {
      try {
        new Date(date)
        return true
      } catch {
        return false
      }
    }, 'Invalid date format'),
    guests: z.number().min(1)
  })
  .refine(
    data => {
      const checkIn = new Date(data.checkIn)
      const checkOut = new Date(data.checkOut)
      return checkOut > checkIn
    },
    {
      message: 'Check-out date must be after check-in date',
      path: ['checkOut']
    }
  )

export type BookingInput = z.infer<typeof bookingSchema>

export const bookingFilterSchema = z
  .object({
    status: z
      .enum(['pending', 'confirmed', 'cancelled', 'completed'])
      .optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    roomId: z.string().optional(),
    userId: z.string().optional()
  })
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate
      }
      return true
    },
    {
      message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır',
      path: ['endDate']
    }
  )
