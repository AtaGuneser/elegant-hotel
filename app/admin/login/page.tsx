'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { useAuthStore } from '@/app/store/auth'
import { toast } from 'react-hot-toast'

export default function AdminLoginPage () {
  const router = useRouter()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      await login(email, password)
      toast.success('Login successful')
      router.push('/admin')
    } catch {
      toast.error('Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md space-y-8 rounded-lg border bg-white p-6 shadow-lg'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold'>Admin Login</h2>
          <p className='mt-2 text-sm text-gray-600'>
            Please enter your credentials to access the admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Email
              </label>
              <Input
                id='email'
                name='email'
                type='email'
                defaultValue='admin@admin.com'
                required
                className='mt-1'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Password
              </label>
              <Input
                id='password'
                name='password'
                type='password'
                defaultValue='123456'
                required
                className='mt-1'
              />
            </div>
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  )
}
