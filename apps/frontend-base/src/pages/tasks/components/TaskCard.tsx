import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Task } from '@/lib/schemas/task.schema'
import { cn } from '@/lib/utils'

interface TaskCardProps {
    task: Task
    onView: (id: string) => void
    onDelete: (id: string) => void
}

export function TaskCard({ task, onView, onDelete }: TaskCardProps) {
    const priorityStyles = {
        low: 'bg-success/10 text-success border-success/20',
        medium: 'bg-warning/10 text-warning border-warning/20',
        high: 'bg-destructive/10 text-destructive border-destructive/20',
    }

    const statusStyles = {
        todo: 'text-muted-foreground',
        'in-progress': 'text-info',
        done: 'text-success',
    }

    return (
        <Card
            className="group/card hover:border-ring/30 transition-all duration-200 cursor-pointer"
            onClick={() => {
                onView(task.id)
            }}
        >
            <CardHeader>
                <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <CardTitle
                            className="cursor-pointer truncate group-hover/card:text-primary transition-colors"
                            onClick={() => onView(task.id)}
                        >
                            {task.title}
                        </CardTitle>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className={cn(priorityStyles[task.priority])}>
                                {task.priority}
                            </Badge>
                            <span className={cn('text-xs', statusStyles[task.status])}>
                                priority
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(task.id)
                        }}
                        className="shrink-0 opacity-60 group-hover/card:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className={cn('h-full flex flex-col justify-between')}>
                {task.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {task.description}
                    </p>
                )}
                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                    <span className={cn('capitalize', statusStyles[task.status])}>
                        {task.status.replace('-', ' ')}
                    </span>
                    {task.dueDate && (
                        <span
                            className={cn(
                                task.dueDate < new Date() && task.status !== 'done'
                                    ? 'text-destructive'
                                    : '',
                            )}
                        >
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
