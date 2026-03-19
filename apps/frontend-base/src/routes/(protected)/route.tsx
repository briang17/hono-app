import { createFileRoute, redirect } from '@tanstack/react-router'
import { ProtectedLayout } from '../../components/layout/ProtectedLayout'

export const Route = createFileRoute('/(protected)')({
    component: ProtectedLayout,
    beforeLoad: ({ context, location }) => {
        if (context.session?.isPending) {
            return
        }

        if (!context.session?.data?.user) {
            console.log('YOU BEEN REDIRECTED')
            console.log(context)
            throw redirect({
                to: '/auth/login',
                search: { redirect: location.href },
            })
        }
    },
})
