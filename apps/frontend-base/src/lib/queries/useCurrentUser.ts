import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/api'
import { useAuthStore } from '@/lib/stores/authStore'

export function useCurrentUser() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    return useQuery({
        queryKey: ['user'],
        queryFn: authClient.getSession,
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
