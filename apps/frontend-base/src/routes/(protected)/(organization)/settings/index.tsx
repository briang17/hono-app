import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/api/auth-client'
import { OrganizationSettingsPage } from '@/pages/settings/OrganizationSettingsPage'

export const Route = createFileRoute('/(protected)/(organization)/settings/')({
    beforeLoad: async ({ context }) => {
        const role = context.activeMemberRole ?? 'agent'
        const canUpdate = authClient.organization.checkRolePermission({
            permissions: { organization: ['update'] },
            role: role as any,
        })
        if (!canUpdate) {
            throw redirect({ to: '/dashboard' })
        }
    },
    component: OrganizationSettingsPage,
})
