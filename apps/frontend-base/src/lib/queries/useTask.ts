import { queryOptions, type UseQueryResult, useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api/tasks.api'
import type { Task } from '../schemas/task.schema'

export function useTaskQuery(id: string): UseQueryResult<Task> {
    return useQuery({
        queryKey: ['tasks', id],
        queryFn: () => tasksApi.getTask(id),
        enabled: !!id,
    })
}
/** this is not actually a useQuery result, but actually a queryOptions result. to use with useSuspenseQuery(queryOptions(args))  */
export function useTask(id: string) {
    return queryOptions({
        queryKey: ['tasks', id],
        queryFn: () => tasksApi.getTask(id),
        enabled: !!id,
    })
}
