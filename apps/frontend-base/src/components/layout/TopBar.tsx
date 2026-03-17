import { Button } from '@/components/ui/button'
import { useLogout } from '@/lib/mutations/useLogout'
import { useAuthStore } from '@/lib/stores/authStore'

export function TopBar() {
    const user = useAuthStore((state) => state.user)
    const logout = useLogout()

    const handleLogout = () => {
        logout.mutate()
    }

    return (
        <header className="border-b border-border bg-background">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold tracking-tight">Task Manager</h1>
                </div>
                <div className="flex items-center gap-4">
                    {user && (
                        <>
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="transition-all duration-200"
                            >
                                Logout
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
