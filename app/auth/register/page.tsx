import { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/app/components/auth/register-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card'

export const metadata: Metadata = {
  title: 'Register - Elegant Hotel',
  description: 'Create a new account'
}

export default function RegisterPage () {
  return (
    <div className='min-h-screen flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className='mt-4 text-sm text-center'>
            Already have an account?{' '}
            <Link
              href='/auth/login'
              className='font-medium cursor-pointer text-blue-600 hover:text-blue-500'
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
