import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Frown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteTask } from '@/lib/mutations/useDeleteTask'
import { useUpdateTask } from '@/lib/mutations/useUpdateTask'
import { useTask } from '@/lib/queries/useTask'
import type { UpdateTaskInput } from '@/lib/schemas/task.schema'
import { cn } from '@/lib/utils'
import { TaskCard } from './components/TaskCard'
import { TaskForm } from './components/TaskForm'

export function TaskDetailError() {
    const navigate = useNavigate()
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="text-4xl mb-4">
                    <Frown size={48} strokeWidth={1.5} className={cn('mx-auto text-destructive')} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Task not found</h3>
                <p className="text-muted-foreground mb-4">
                    The task you're looking for doesn't exist or has been deleted.
                </p>
                <Button variant="outline" onClick={() => navigate({ to: '/tasks' })}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tasks
                </Button>
            </div>
        </div>
    )
}

export function TaskDetailPage() {
    const routeApi = getRouteApi('/(protected)/(organization)/tasks/$taskId')
    const navigate = useNavigate()

    const { taskId } = routeApi.useParams()

    const { data: task } = useSuspenseQuery(useTask(taskId))

    console.log(task)

    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()

    const handleUpdateTask = async (values: UpdateTaskInput) => {
        if (task) {
            await updateTask.mutateAsync({ id: task.id, data: values })
        }
    }

    const handleDeleteTask = async () => {
        if (task && confirm('Are you sure you want to delete this task?')) {
            await deleteTask.mutateAsync(task.id)
            navigate({ to: '/tasks' })
        }
    }

    return (
        <div className="w-full space-y-8">
            <Button
                variant="ghost"
                onClick={() => navigate({ to: '/tasks' })}
                className="transition-all duration-200"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tasks
            </Button>

            <div className="grid w-full gap-8 lg:grid-cols-2">
                <div className="w-full">
                    <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
                        Task Details
                    </h2>
                    <TaskCard task={task} onView={() => {}} onDelete={handleDeleteTask} />
                </div>
                <div className="w-full">
                    <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Edit Task</h2>
                    <TaskForm
                        onSubmit={handleUpdateTask}
                        defaultValues={task}
                        submitLabel="Update Task"
                    />
                </div>
            </div>
        </div>
    )
}
