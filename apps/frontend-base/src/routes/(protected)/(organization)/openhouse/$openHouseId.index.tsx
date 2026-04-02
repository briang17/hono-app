import { createFileRoute } from '@tanstack/react-router'
import { OpenHouseDetailPage } from '@/pages/openhouse/OpenHouseDetailPage'

export const Route = createFileRoute('/(protected)/(organization)/openhouse/$openHouseId/')({
    component: OpenHouseDetailPage,
})
