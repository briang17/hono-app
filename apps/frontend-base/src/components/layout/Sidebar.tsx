import { Link } from '@tanstack/react-router'
import { ChartLine, Home, ListChecks, Users } from 'lucide-react'
import { Can } from '@/components/Can'
import { cn } from '@/lib/utils'

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: ChartLine },
        { to: '/tasks', label: 'Tasks', icon: ListChecks },
        { to: '/openhouse', label: 'Open Houses', icon: Home },
    ]

    return (
        <aside className={cn('w-64 border-r border-border', className)}>
            <nav className="flex flex-col gap-1 p-4">
                {navItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md',
                            'transition-all duration-200',
                            'hover:bg-accent hover:text-accent-foreground',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            'focus-visible:ring-offset-background',
                            'active:bg-accent',
                        )}
                        activeProps={{
                            className: 'bg-accent text-accent-foreground font-semibold',
                        }}
                    >
                        {<item.icon strokeWidth={1.5} size={24} />}
                        <span>{item.label}</span>
                    </Link>
                ))}
                <Can permission={{ agent: ['view'] }}>
                    <Link
                        to="/agents"
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md',
                            'transition-all duration-200',
                            'hover:bg-accent hover:text-accent-foreground',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            'focus-visible:ring-offset-background',
                            'active:bg-accent',
                        )}
                        activeProps={{
                            className: 'bg-accent text-accent-foreground font-semibold',
                        }}
                    >
                        <Users strokeWidth={1.5} size={24} />
                        <span>Agents</span>
                    </Link>
                </Can>
            </nav>
        </aside>
    )
}
