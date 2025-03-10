'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card'

export default function LoginPage () {
  const [email, setEmail] = useState('johndoe@example.com')
  const [password, setPassword] = useState('123456')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Login successful
      toast.success('Login successful')
      router.push('/')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Email
              </label>
              <Input
                id='email'
                type='email'
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='mt-1 block w-full'
                placeholder='Enter your email'
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
                type='password'
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='mt-1 block w-full'
                placeholder='Enter your password'
              />
            </div>
            <Button
              type='submit'
              className='w-full cursor-pointer'
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className='text-sm text-center'>
              <Link
                href='/auth/register'
                className='font-medium cursor-pointer text-blue-600 hover:text-blue-500'
              >
                Don&apos;t have an account? Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
