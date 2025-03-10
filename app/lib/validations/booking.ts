import { z } from 'zod'

export const bookingSchema = z
  .object({
    roomId: z.string().min(1, 'Oda seçimi gereklidir'),
    checkIn: z.date().min(new Date(), 'Giriş tarihi bugünden sonra olmalıdır'),
    checkOut: z.date().min(new Date(), 'Çıkış tarihi bugünden sonra olmalıdır'),
    guestCount: z.number().min(1, 'En az 1 misafir seçilmelidir'),
    specialRequests: z.string().optional()
  })
  .refine(
    data => {
      return data.checkOut > data.checkIn
    },
    {
      message: 'Çıkış tarihi giriş tarihinden sonra olmalıdır',
      path: ['checkOut']
    }
  )

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
