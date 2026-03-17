import { createFileRoute } from '@tanstack/react-router'
import { useTask } from '@/lib/queries/useTask'
import { TaskDetailError, TaskDetailPage } from '../../../../pages/tasks/TaskDetailPage'

export const Route = createFileRoute('/(protected)/(organization)/tasks/$taskId')({
    loader: async ({ context: { queryClient }, params }) => {
        return queryClient.ensureQueryData(useTask(params.taskId))
    },
    errorComponent: TaskDetailError,
    component: TaskDetailPage,
})
