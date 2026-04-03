import type { OrgRole } from '@packages/auth/client/index'
import type { ReactNode } from 'react'
import { authClient } from '@/lib/api/auth-client'
import { useRouteContext } from '@tanstack/react-router'
import type { RBACParams } from '@packages/auth/lib/permissions'

interface Props {
    permission: RBACParams
    children: ReactNode
    fallback?: ReactNode
}

export const Can = ({ permission, children, fallback = null}: Props) => {
    
    const {data: member} = useRouteContext({
        from: '/(protected)/(organization)',
        select: (context) => context.activeMember
    })

    console.log(`permission to check: ${JSON.stringify(permission)}. role: ${member?.role}`)
    const can = authClient.organization.checkRolePermission({
        permissions: permission,
        role: member?.role as OrgRole ?? 'agent',
    })

    console.log(can);

    return  can ? <>{children}</> : <>{fallback}</>
}
