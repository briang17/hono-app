import { Outlet, useRouteContext } from '@tanstack/react-router'
import { authClient } from '@/lib/api'
import { cn } from '@/lib/utils'
import { NavigationProgressBar } from './NavigationProgressBar'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function OrganizationLayout() {
    const { isPending } = authClient.useActiveMember()

    if (isPending) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    return (
        <div className="flex h-screen w-full flex-col bg-background">
            <TopBar />
            <NavigationProgressBar />
            <div className="flex flex-1 w-full overflow-hidden">
                <aside
                    className={cn(
                        'hidden lg:flex border-r border-border transition-all duration-200',
                    )}
                >
                    <Sidebar />
                </aside>
                <main className="flex-1 w-full min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
