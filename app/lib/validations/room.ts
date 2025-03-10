import { z } from 'zod'
import { RoomCategory } from '@/types/room'

export const roomSchema = z.object({
  number: z.string().min(1, 'Oda numarası gereklidir'),
  category: z.enum(['Basic', 'Premium', 'Suite'] as const),
  price: z.number().min(0, "Fiyat 0'dan büyük olmalıdır"),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  amenities: z.array(z.string()).min(1, 'En az bir özellik eklenmelidir'),
  images: z
    .array(z.string().url('Geçerli bir URL giriniz'))
    .min(1, 'En az bir resim eklenmelidir'),
  capacity: z.number().min(1, 'Kapasite en az 1 olmalıdır')
})

export const roomFilterSchema = z
  .object({
    category: z.enum(['Basic', 'Premium', 'Suite'] as const).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    capacity: z.number().min(1).optional()
  })
  .refine(
    data => {
      if (data.minPrice && data.maxPrice) {
        return data.maxPrice >= data.minPrice
      }
      return true
    },
    {
      message: 'Maksimum fiyat minimum fiyattan büyük olmalıdır',
      path: ['maxPrice']
    }
  )
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate
      }
      return true
    },
    {
      message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır',
      path: ['endDate']
    }
  )
