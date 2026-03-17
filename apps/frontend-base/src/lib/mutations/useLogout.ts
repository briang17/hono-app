import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/api'
import { useAuthStore } from '@/lib/stores/authStore'

export function useLogout() {
    const clearAuth = useAuthStore((state) => state.clearAuth)
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: authClient.signOut,
        onSuccess: () => {
            clearAuth()
            queryClient.clear()
        },
        onError: (error) => {
            console.error('Logout failed:', error)
        },
    })
}
