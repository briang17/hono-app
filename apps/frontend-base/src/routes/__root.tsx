import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { authClient } from '@/lib/api/auth-client'

const RootLayout = () => (
    <>
        <div className="h-full w-full">
            <Outlet />
            <TanStackRouterDevtools />
        </div>
    </>
)

interface RouterContext {
    session: ReturnType<typeof authClient.useSession>
    activeMember: ReturnType<typeof authClient.useActiveMember>
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootLayout,
})
