import { createFileRoute } from '@tanstack/react-router'
import { useTeamOpenHouses } from '@/lib/queries/openhouse'
import { TeamOpenHouseListPage } from '@/pages/team-openhouse/TeamOpenHouseListPage'

export const Route = createFileRoute('/(protected)/(organization)/team-openhouses/')({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(useTeamOpenHouses())
    },
    component: TeamOpenHouseListPage,
})
