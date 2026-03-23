import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UIState {
    sidebarCollapsed: boolean
    mobileMenuOpen: boolean
    toggleSidebar: () => void
    toggleMobileMenu: () => void
    closeMobileMenu: () => void
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarCollapsed: false,
            mobileMenuOpen: false,
            toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
            toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
            closeMobileMenu: () => set({ mobileMenuOpen: false }),
        }),
        { name: 'ui-storage' },
    ),
)
