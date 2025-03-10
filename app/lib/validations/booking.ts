import { z } from 'zod'

export const bookingSchema = z.object({
  roomId: z.string(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  totalPrice: z.number()
})

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
