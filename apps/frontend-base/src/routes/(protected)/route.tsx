import { createFileRoute, redirect } from '@tanstack/react-router'
import { ProtectedLayout } from '../../components/layout/ProtectedLayout'

export const Route = createFileRoute('/(protected)')({
    component: ProtectedLayout,
    beforeLoad: ({ context, location }) => {
        if (!context.auth?.isAuthenticated) {
            throw redirect({ to: '/auth/login', search: { redirect: location.href } })
        }
    },
})
