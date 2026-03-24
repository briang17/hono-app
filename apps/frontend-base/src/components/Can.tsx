import { useRouteContext } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { authClient } from '@/lib/api/auth-client'

interface Props {
    permission: Record<string, string[]>
    children: ReactNode
    fallback?: ReactNode
}

export const Can = ({ permission, children, fallback = null }: Props) => {
    const { activeMember } = useRouteContext({ strict: false })
    const role = activeMember.data?.role ?? 'member'

    const can = authClient.organization.checkRolePermission({
        permissions: permission,
        role,
    })

    if (can) {
        return <>{children}</>
    }
    return <>{fallback}</>
}
