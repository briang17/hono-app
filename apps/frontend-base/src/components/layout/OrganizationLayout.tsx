import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function OrganizationLayout() {
    return (
        <div className="flex h-screen w-full flex-col bg-background">
            <TopBar />
            <div className="flex flex-1 w-full overflow-hidden">
                <Sidebar />
                <main className="flex-1 w-full min-w-0 overflow-y-auto p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
