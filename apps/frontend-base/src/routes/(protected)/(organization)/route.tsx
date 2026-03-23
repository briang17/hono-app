import { createFileRoute, redirect } from '@tanstack/react-router'
import { OrganizationLayout } from '@/components/layout/OrganizationLayout'

export const Route = createFileRoute('/(protected)/(organization)')({
    component: OrganizationLayout,
    beforeLoad: ({ context, location }) => {
        if (context.session?.isPending) {
            return
        }
        if (!context.session?.data?.session?.activeOrganizationId) {
            throw redirect({
                to: '/create-organization',
                search: { redirect: location.href },
            })
        }
    },
})
