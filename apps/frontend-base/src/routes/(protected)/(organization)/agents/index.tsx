import { createFileRoute } from '@tanstack/react-router'
import { useAgents } from '@/lib/queries/agent'
import { AgentsPage } from '@/pages/agent/AgentsPage'

export const Route = createFileRoute('/(protected)/(organization)/agents/')({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(useAgents())
    },
    component: AgentsPage,
})
