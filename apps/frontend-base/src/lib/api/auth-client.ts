import type { auth } from '@packages/auth'
import { ac, admin, agent, owner } from '@packages/auth/client/index'
import { adminClient, inferAdditionalFields, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
    baseURL: 'https://api.rs.hauntednuke.com/api/auth',
    plugins: [
        organizationClient({
            ac,
            roles: {
                owner,
                admin,
                agent,
            },
        }),
        adminClient({
            ac,
            roles: {
                owner,
                admin,
                agent,
            },
        }),
        inferAdditionalFields<typeof auth>(),
    ],
})

export const {
    useSession,
    useActiveMember,
    useActiveMemberRole,
    signIn,
    signUp,
    signOut,
    useActiveOrganization,
    organization,
} = authClient
