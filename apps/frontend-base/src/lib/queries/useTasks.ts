import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api/tasks.api'

export function useTasks() {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: tasksApi.getTasks,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
