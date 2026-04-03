import { createFileRoute } from '@tanstack/react-router'
import { useMyAgent } from '@/lib/queries/agent'
import { ProfilePage } from '@/pages/profile/ProfilePage'

export const Route = createFileRoute('/(protected)/(organization)/profile/')({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(useMyAgent())
    },
    component: ProfilePage,
})
