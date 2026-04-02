import { createFileRoute } from '@tanstack/react-router'
import { useOpenHouse } from '@/lib/queries/openhouse'
import { OpenHouseDetailError } from '@/pages/openhouse/OpenHouseDetailPage'
import { UpdateOpenHousePage } from '@/pages/openhouse/UpdateOpenHousePage'

export const Route = createFileRoute('/(protected)/(organization)/openhouse/$openHouseId/edit')({
    loader: async ({ context: { queryClient }, params }) => {
        await queryClient.ensureQueryData(useOpenHouse(params.openHouseId))
    },
    errorComponent: OpenHouseDetailError,
    component: UpdateOpenHousePage,
})
