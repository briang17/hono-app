import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/')({
    component: RouteComponent,
    beforeLoad: () => {
        throw redirect({ to: '/auth/login' })
    },
})

function RouteComponent() {
    return <Outlet />
}
