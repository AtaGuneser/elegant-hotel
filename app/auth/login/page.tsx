import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/app/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Login - Elegant Hotel',
  description: 'Login to your account'
}

export default function LoginPage () {
  return (
    <div className='container flex h-screen w-screen flex-col items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>Hoşgeldiniz</h1>
          <p className='text-sm text-muted-foreground'>
            Devam etmek için giriş yapın
          </p>
        </div>
        <LoginForm />
        <p className='px-8 text-center text-sm text-muted-foreground'>
          Hesabınız yok mu?{' '}
          <Link
            href='/auth/register'
            className='underline underline-offset-4 hover:text-primary'
          >
            Kayıt Olun
          </Link>
        </p>
      </div>
    </div>
  )
}
