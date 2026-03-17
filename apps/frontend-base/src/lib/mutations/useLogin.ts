import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { z } from 'zod'
import { authClient } from '@/lib/api'
import type { authSchema } from '@/lib/schemas/auth.schema'
import { useAuthStore } from '@/lib/stores/authStore'

export function useLogin() {
    const setAuth = useAuthStore((state) => state.setAuth)
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (credentials: z.infer<typeof authSchema.signIn>) =>
            authClient.signIn(credentials),
        onSuccess: (data) => {
            setAuth(data)
            queryClient.invalidateQueries({ queryKey: ['user'] })
        },
        onError: (error) => {
            console.error('Login failed:', error)
            // TODO: Add toast notification
        },
    })
}
