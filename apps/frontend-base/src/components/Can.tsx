import type { ReactNode } from 'react'
import { authClient } from '@/lib/api/auth-client'

interface Props {
    permission: Record<string, string[]>
    children: ReactNode
    fallback?: ReactNode
}

type OrgRole = 'owner' | 'admin' | 'agent'

const VALID_ROLES: OrgRole[] = ['owner', 'admin', 'agent']

function toOrgRole(role: string | undefined): OrgRole {
    if (role && (VALID_ROLES as string[]).includes(role)) {
        return role as OrgRole
    }
    return 'agent'
}

export const Can = ({ permission, children, fallback = null }: Props) => {
    const activeMember = authClient.useActiveMember()
    const role = toOrgRole(activeMember.data?.role)
    console.log("ROLEEE IN CANN!!!");
    console.log(role);
    const can = authClient.organization.checkRolePermission({
        permissions: permission,
        role,
    })
    console.log("CAN???:", can);
    console.log(children);
    if (can) {
        return <>{children}</>
    }
    return <>{fallback}</>
}
