import type { z } from 'zod'
import type { authSchema } from '@/lib/schemas/auth.schema'
import {createAuthClient} from "better-auth/react";
import {organizationClient} from "better-auth/client/plugins";

const betterAuthClient = createAuthClient({
    baseURL: "https://api.rs.hauntednuke.com/api/auth",
    plugins: [organizationClient()]
})



// Mock better-auth client - replace with real implementation
export const authClient = {
    signIn: async (credentials: z.infer<typeof authSchema.signIn>) => {
        // Mock auth delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock successful login
        return {
            user: {
                id: crypto.randomUUID(),
                email: credentials.email,
            },
            session: {
                id: crypto.randomUUID(),
                activeOrganizationId: null,
            },
        }
    },

    signOut: async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
    },

    getSession: async () => {
        // Mock session check
        return null
    },
}
