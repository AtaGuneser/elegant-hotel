import { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/app/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Register - Elegant Hotel',
  description: 'Create a new account'
}

export default function RegisterPage () {
  return (
    <div className='container flex h-screen w-screen flex-col items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Hesap Oluştur
          </h1>
          <p className='text-sm text-muted-foreground'>
            Bilgilerinizi girerek kayıt olun
          </p>
        </div>
        <RegisterForm />
        <p className='px-8 text-center text-sm text-muted-foreground'>
          Zaten hesabınız var mı?{' '}
          <Link
            href='/auth/login'
            className='underline underline-offset-4 hover:text-primary'
          >
            Giriş Yapın
          </Link>
        </p>
      </div>
    </div>
  )
}
