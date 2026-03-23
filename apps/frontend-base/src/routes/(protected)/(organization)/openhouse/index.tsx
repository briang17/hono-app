import { createFileRoute } from '@tanstack/react-router'
import { OpenHouseListPage } from '@/pages/openhouse/OpenHouseListPage'

export const Route = createFileRoute('/(protected)/(organization)/openhouse/')({
    component: OpenHouseListPage,
})
