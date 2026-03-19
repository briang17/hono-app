import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/api/auth-client'
import { useTasks } from '@/lib/queries/useTasks'
import { cn } from '@/lib/utils'

export function DashboardPage() {
    const { data: session } = authClient.useSession()
    const { data: tasks } = useTasks()

    const stats = {
        total: tasks?.length || 0,
        todo: tasks?.filter((t) => t.status === 'todo').length || 0,
        inProgress: tasks?.filter((t) => t.status === 'in-progress').length || 0,
        done: tasks?.filter((t) => t.status === 'done').length || 0,
    }

    const statCards = [
        {
            title: 'Total Tasks',
            value: stats.total,
            color: 'text-foreground',
            bgColor: 'bg-background',
        },
        {
            title: 'To Do',
            value: stats.todo,
            color: 'text-muted-foreground',
            bgColor: 'bg-muted/30',
        },
        {
            title: 'In Progress',
            value: stats.inProgress,
            color: 'text-info',
            bgColor: 'bg-info/10',
        },
        {
            title: 'Done',
            value: stats.done,
            color: 'text-success',
            bgColor: 'bg-success/10',
        },
    ]

    return (
        <div className="w-full space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back, {session?.user?.email || 'User'}!
                </p>
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card
                        key={stat.title}
                        className={cn(
                            'border transition-all duration-200',
                            stat.bgColor,
                            'hover:border-ring/30 hover:shadow-sm',
                        )}
                    >
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={cn('text-2xl font-bold', stat.color)}>{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {stats.total === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground text-center">
                            No tasks yet. Create your first task to get started!
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
