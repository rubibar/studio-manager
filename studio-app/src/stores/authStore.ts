import { create } from 'zustand'
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { auth, googleProvider } from '@/firebase'
import { ALLOWED_EMAILS, EMAIL_TO_TEAM, ADMIN_EMAILS } from '@/lib/constants'

interface AuthState {
  user: User | null
  teamMemberId: string
  isAdmin: boolean
  loading: boolean
  error: string | null
  login: () => Promise<void>
  logout: () => Promise<void>
  init: () => () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  teamMemberId: 'rubi',
  isAdmin: false,
  loading: true,
  error: null,

  login: async () => {
    set({ loading: true, error: null })
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      set({ loading: false, error: (err as Error).message })
    }
  },

  logout: async () => {
    await signOut(auth)
  },

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (!ALLOWED_EMAILS.includes(user.email as typeof ALLOWED_EMAILS[number])) {
          set({ error: 'אין לך הרשאת גישה. פנה למנהל המערכת.', loading: false })
          signOut(auth)
          return
        }
        const teamMemberId = EMAIL_TO_TEAM[user.email || ''] || 'rubi'
        const isAdmin = ADMIN_EMAILS.includes(user.email as typeof ADMIN_EMAILS[number])
        set({ user, teamMemberId, isAdmin, loading: false, error: null })
      } else {
        set({ user: null, teamMemberId: 'rubi', isAdmin: false, loading: false, error: null })
      }
    })
    return unsubscribe
  },
}))
