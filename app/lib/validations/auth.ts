import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır')
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir email adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    confirmPassword: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword']
  })
