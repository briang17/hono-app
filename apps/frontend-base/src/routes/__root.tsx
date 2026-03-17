import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { AuthState } from '@/lib/stores/authStore'

const RootLayout = () => (
    <>
        <div className="h-full w-full">
            <Outlet />
            <TanStackRouterDevtools />
        </div>
    </>
)

interface RouterContext {
    auth: AuthState | null
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({ component: RootLayout })
