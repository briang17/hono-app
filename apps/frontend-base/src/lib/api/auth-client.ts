import type { auth } from '@packages/auth'
import { inferAdditionalFields, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
    baseURL: 'https://api.rs.hauntednuke.com/api/auth',
    plugins: [organizationClient(), inferAdditionalFields<typeof auth>()],
})

export const { useSession, signIn, signUp, signOut, useActiveOrganization, organization } =
    authClient
