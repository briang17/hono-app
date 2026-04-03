import { Link } from '@tanstack/react-router'
import { Building2, Home, Users } from 'lucide-react'
import { Can } from '@/components/Can'
import { cn } from '@/lib/utils'
import type { RBACParams } from '@packages/auth/lib/permissions'

interface SidebarProps {
    className?: string
}

interface NavItem {
    to: string
    label: string,
    icon: typeof Building2,
    permission: RBACParams
}

export function Sidebar({ className }: SidebarProps) {
    const navItems: NavItem[] = [
        { to: '/openhouse', label: 'Open Houses', icon: Home, permission: { openhouse: ['view'] } },
        {
            to: '/team-openhouses',
            label: 'Team Open Houses',
            icon: Building2,
            permission: { openhouse: ['view'] },
        },
        { to: '/agents', label: 'Agents', icon: Users, permission: { agent: ['view'] } },
    ]

    return (
        <aside className={cn('w-64 border-r border-border', className)}>
            <nav className="flex flex-col gap-1 p-4">
                {navItems.map((item) => (
                    <Can permission={item.permission}>
                        <Link
                            key={item.to}
                            to={item.to}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md',
                                'transition-all duration-200',
                                'hover:bg-accent hover:text-accent-foreground',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                'focus-visible:ring-offset-background',
                                'active:bg-accent active:text-accent-foreground font-semibold',
                            )}
                            activeProps={{
                                className: 'bg-accent text-accent-foreground font-semibold',
                            }}
                        >
                            {<item.icon strokeWidth={1.5} size={24} />}
                            <span>{item.label}</span>
                        </Link>
                    </Can>
                ))}
            </nav>
        </aside>
    )
}
