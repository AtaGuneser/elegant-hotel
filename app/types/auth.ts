export type UserRole = 'customer' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  name: string
  confirmPassword: string
}
