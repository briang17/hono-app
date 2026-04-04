import { useNavigate } from '@tanstack/react-router'
import { ListTodo } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useCreateTask } from '@/lib/mutations/useCreateTask'
import { useDeleteTask } from '@/lib/mutations/useDeleteTask'
import { useTasks } from '@/lib/queries/useTasks'
import type { CreateTaskInput, UpdateTaskInput } from '@/lib/schemas/task.schema'
import { TaskCard } from './components/TaskCard'
import { TaskForm } from './components/TaskForm'

export function TasksPage() {
    const navigate = useNavigate()
    const { data: tasks, isLoading } = useTasks()
    const createTask = useCreateTask()
    const deleteTask = useDeleteTask()
    const [createFormOpen, setCreateFormOpen] = useState(false)

    const handleCreateTask = async (values: CreateTaskInput | UpdateTaskInput) => {
        await createTask.mutateAsync(values as CreateTaskInput)
        setCreateFormOpen(false)
    }

    const handleViewTask = (id: string) => {
        navigate({ to: '/tasks/$taskId', params: { taskId: id } })
    }

    const handleDeleteTask = async (id: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            await deleteTask.mutateAsync(id)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Loading tasks...</div>
            </div>
        )
    }

    return (
        <div className="w-full space-y-8">
            <div className="flex items-center justify-between gap-4 w-full">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground mt-1">Manage your tasks</p>
                </div>
                <Dialog open={createFormOpen} onOpenChange={setCreateFormOpen}>
                    <DialogTrigger asChild>
                        <Button>Create Task</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Task</DialogTitle>
                        </DialogHeader>
                        <TaskForm onSubmit={handleCreateTask} submitLabel="Create Task" />
                    </DialogContent>
                </Dialog>
            </div>

            {tasks && tasks.length > 0 ? (
                <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onView={handleViewTask}
                            onDelete={handleDeleteTask}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center min-h-[400px] w-full">
                    <div className="text-center max-w-md w-full">
                        <ListTodo
                            size={48}
                            strokeWidth={1.5}
                            className="mx-auto mb-4 text-muted-foreground/50"
                        />
                        <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Create your first task to get started organizing your work.
                        </p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>Create Your First Task</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Task</DialogTitle>
                                </DialogHeader>
                                <TaskForm onSubmit={handleCreateTask} submitLabel="Create Task" />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            )}
        </div>
    )
}
