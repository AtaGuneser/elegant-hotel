import { compare } from 'bcryptjs'
import clientPromise from './db'
import { jwtVerify } from 'jose'

export async function verifyCredentials (email: string, password: string) {
  if (!email || !password) {
    throw new Error('Email and password required')
  }

  const client = await clientPromise
  const db = client.db()
  const user = await db.collection('users').findOne({ email })

  if (!user) {
    throw new Error('Email does not exist')
  }

  const isPasswordValid = await compare(password, user.password)

  if (!isPasswordValid) {
    throw new Error('Invalid password')
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role
  }
}

export async function verifyAuth (token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    throw new Error('Your token has expired.')
  }
}
