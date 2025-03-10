'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'

export function RegisterForm () {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, confirmPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast.success('Registration successful')
      router.push('/auth/login')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Registration failed'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label
          htmlFor='name'
          className='block text-sm font-medium text-gray-700'
        >
          Name
        </label>
        <Input
          id='name'
          type='text'
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className='mt-1 block w-full'
          placeholder='Enter your name'
        />
      </div>
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
      <div>
        <label
          htmlFor='confirmPassword'
          className='block text-sm font-medium text-gray-700'
        >
          Confirm Password
        </label>
        <Input
          id='confirmPassword'
          type='password'
          required
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className='mt-1 block w-full'
          placeholder='Confirm your password'
        />
      </div>
      <Button type='submit' className='w-full' disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  )
}
