'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '../ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form'
import { Input } from '../ui/input'
import { loginSchema } from '@/app/lib/validations/auth'
import { useAuthStore } from '@/app/store/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm () {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  async function onSubmit (data: LoginFormValues) {
    setIsLoading(true)
    try {
      // TODO: Implement actual login API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const result = await response.json()
      setUser(result.user)
      setToken(result.token)
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='ornek@email.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şifre</FormLabel>
              <FormControl>
                <Input type='password' placeholder='******' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </Button>
      </form>
    </Form>
  )
}
