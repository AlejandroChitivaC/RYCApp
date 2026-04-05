import { create } from 'zustand'
import type { AuthUser } from './types'

const TOKEN_KEY = 'rycapp_token'
const USER_KEY = 'rycapp_user'

function readUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  setSession: (token: string, user: AuthUser) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  user: typeof localStorage !== 'undefined' ? readUser() : null,

  setSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ token: null, user: null })
  },

  hydrate: () => {
    set({
      token: localStorage.getItem(TOKEN_KEY),
      user: readUser(),
    })
  },
}))

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
