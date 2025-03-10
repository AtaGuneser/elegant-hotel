import { create } from 'zustand'
import { User } from '../types/auth'
import Cookies from 'js-cookie'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
  login: (email: string, password: string) => Promise<void>
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  token: null,
  setUser: user => set({ user, isAuthenticated: !!user }),
  setToken: token => set({ token }),
  logout: () => {
    Cookies.remove('token')
    set({ user: null, token: null, isAuthenticated: false })
  },
  login: async (email: string, password: string) => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    const result = await response.json()
    Cookies.set('token', result.token, { expires: 7 })
    set({ user: result.user, token: result.token, isAuthenticated: true })
  }
}))
