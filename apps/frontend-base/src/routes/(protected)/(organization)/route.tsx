import { createFileRoute, redirect } from '@tanstack/react-router'
import { OrganizationLayout } from '@/components/layout/OrganizationLayout'
import { authClient } from '@/lib/api/auth-client'
export const Route = createFileRoute('/(protected)/(organization)')({
    component: OrganizationLayout,
    beforeLoad: async ({ context, location }) => {
        if (context.session?.isPending) {
            return
        }

        if (!context.session?.data?.session?.activeOrganizationId) {
            throw redirect({
                to: '/create-organization',
                search: { redirect: location.href },
            })
        }

        const activeMemberRoleResponse = await authClient.organization.getActiveMemberRole()

        if (activeMemberRoleResponse.error) {
            throw redirect({
                to: '/error',
                search: {
                    error: activeMemberRoleResponse.error.message || 'Failed to load role',
                },
            })
        }

        return {
            activeMemberRole: activeMemberRoleResponse.data?.role ?? 'agent',
        }
    },
})
