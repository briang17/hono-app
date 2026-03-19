import { Outlet } from '@tanstack/react-router'
import { authClient } from '@/lib/api/auth-client'

export function ProtectedLayout() {
    const { isPending } = authClient.useSession()

    if (isPending) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    return <Outlet />
}
