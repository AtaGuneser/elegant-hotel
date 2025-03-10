'use client'

import { AdminLoginForm } from '@/app/components/admin/login-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AdminLoginPage () {
  return (
    <div className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Please login with your admin credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
        <CardFooter>
          <Link href='/' className='w-full'>
            <Button variant='outline' className='w-full'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
