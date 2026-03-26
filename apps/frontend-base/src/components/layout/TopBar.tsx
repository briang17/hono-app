import { Link } from '@tanstack/react-router'
import { ChartLine, Home, ListChecks, Menu, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { authClient } from '@/lib/api/auth-client'
import { useUIStore } from '@/lib/stores/uiStore'
import { Can } from '../Can'

const navItems = [
    { to: '/openhouse', label: 'Open Houses', icon: Home, permission: { openhouse: ["view"], } },
    { to: '/agents', label: 'Agents', icon: Users, permission: { agent: ["view"], } } 
];

export function TopBar() {
    const { data: session, isPending } = authClient.useSession()
    const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen)
    const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu)

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
                    <Sheet open={mobileMenuOpen} onOpenChange={toggleMobileMenu}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden">
                                <Menu />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64">
                            <nav className="flex flex-col gap-1 mt-8">
                                {navItems.map((item) => (
                                    <Can permission={item.permission}>
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            onClick={() => toggleMobileMenu()}
                                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                                            activeProps={{ className: 'bg-accent font-semibold' }}
                                        >
                                            <item.icon strokeWidth={1.5} size={20} />
                                            <span>{item.label}</span>
                                        </Link>
                                    </Can>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <h1 className="text-xl font-semibold tracking-tight">Task Manager</h1>
                </div>
                <div className="flex items-center gap-4">
                    {session?.user && (
                        <>
                            <span className="text-sm text-muted-foreground hidden sm:inline">
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
