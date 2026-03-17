import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api/tasks.api'
import type { UpdateTaskInput } from '@/lib/schemas/task.schema'

export function useUpdateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
            tasksApi.updateTask(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] })
        },
        onError: (error) => {
            console.error('Failed to update task:', error)
        },
    })
}
