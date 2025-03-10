import { create } from 'zustand'
import { User } from '../types/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  token: null,
  setUser: user => set({ user, isAuthenticated: !!user }),
  setToken: token => set({ token }),
  logout: () => set({ user: null, token: null, isAuthenticated: false })
}))
