import { OrganizationLayout } from '@/components/layout/OrganizationLayout'
import { createFileRoute } from '@tanstack/react-router'
import { redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/(organization)')({
    component: OrganizationLayout,
    beforeLoad: ({ context, location }) => {
            if (!context.auth?.session?.activeOrganizationId) {
                throw redirect({ to: '/create-organization', search: { redirect: location.href } })
            }
        },
})