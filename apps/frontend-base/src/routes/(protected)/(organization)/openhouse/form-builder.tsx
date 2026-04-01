import { createFileRoute } from '@tanstack/react-router'
import { FormBuilderPage } from '@/pages/openhouse/FormBuilderPage'

export const Route = createFileRoute('/(protected)/(organization)/openhouse/form-builder')({
    component: FormBuilderPage,
})
