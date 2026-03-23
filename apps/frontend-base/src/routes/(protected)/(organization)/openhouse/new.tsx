import { createFileRoute } from '@tanstack/react-router'
import { CreateOpenHousePage } from '@/pages/openhouse/CreateOpenHousePage'

export const Route = createFileRoute('/(protected)/(organization)/openhouse/new')({
    component: CreateOpenHousePage,
})
