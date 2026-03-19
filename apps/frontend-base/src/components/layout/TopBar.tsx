import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/api/auth-client'

export function TopBar() {
    const { data: session, isPending } = authClient.useSession()

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.href = '/auth/login'
                },
            },
        })
    }

    if (isPending) {
        return (
            <header className="border-b border-border bg-background">
                <div className="flex h-16 items-center justify-between px-6">
                    <span>Loading...</span>
                </div>
            </header>
        )
    }

    return (
        <header className="border-b border-border bg-background">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold tracking-tight">Task Manager</h1>
                </div>
                <div className="flex items-center gap-4">
                    {session?.user && (
                        <>
                            <span className="text-sm text-muted-foreground">
                                {session.user.email}
                            </span>
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
