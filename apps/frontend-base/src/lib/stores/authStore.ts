import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, User } from '@/lib/schemas/auth.schema'

export interface AuthState {
    user: User | null
    session: Session | null
    isAuthenticated: boolean
    setAuth: (data: { user: User; session: Session }) => void
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            session: null,
            isAuthenticated: false,
            setAuth: (data) => set({ ...data, isAuthenticated: true }),
            clearAuth: () => set({ user: null, session: null, isAuthenticated: false }),
        }),
        { name: 'auth-storage' },
    ),
)
