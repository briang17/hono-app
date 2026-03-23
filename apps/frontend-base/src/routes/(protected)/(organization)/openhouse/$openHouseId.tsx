import { createFileRoute } from '@tanstack/react-router'
import { useOpenHouse, useOpenHouseLeads } from '@/lib/queries/openhouse'
import { OpenHouseDetailError, OpenHouseDetailPage } from '@/pages/openhouse/OpenHouseDetailPage'

export const Route = createFileRoute('/(protected)/(organization)/openhouse/$openHouseId')({
    loader: async ({ context: { queryClient }, params }) => {
        await queryClient.ensureQueryData(useOpenHouse(params.openHouseId))
        await queryClient.ensureQueryData(useOpenHouseLeads(params.openHouseId))
    },
    errorComponent: OpenHouseDetailError,
    component: OpenHouseDetailPage,
})
