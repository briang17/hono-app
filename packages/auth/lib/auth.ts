import { betterAuth} from "better-auth";
import {organization, admin, openAPI} from "better-auth/plugins";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "@packages/database";
import {eq} from "drizzle-orm";
import * as authSchema from "@packages/database/src/schemas/auth.schema";
import { authEnv as env } from "@packages/env";
import { ac, owner, admin as adminRole, agent } from "./permissions";

export const auth = betterAuth({
    basePath: "/api/auth",
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: authSchema
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false
    },
    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET
        }
    },
    plugins: [organization({
        ac,
        roles: {
            owner,
            admin: adminRole,
            agent
        },
        async sendInvitationEmail(data) {
            console.log(`[invitation] send to ${data.email} for org ${data.organization.name}, id: ${data.id}`);
        },
    }), admin(), openAPI()],
    user: {
        additionalFields: {
            defaultOrganizationId: {
                type: "string",
                required: false
            }
        }
    },
    advanced: {
        database: {
            generateId: () => crypto.randomUUID()
        },
    },
    databaseHooks: {
        session: {
            create: {
                before: async (session) => {
                    const user = authSchema.user;
                    const activeUser = await db.select().from(user).where(eq(user.id, session.userId)).limit(1)
                    if(activeUser[0]?.defaultOrganizationId) {
                        return {
                            data: {
                                ...session,
                                activeOrganizationId: activeUser[0].defaultOrganizationId
                            }
                        }
                    }
                    return {data:session}
                }
            },
            update: {
                after: async (session) => {
                    const user = authSchema.user;
                    const activeOrgId: string = (session as any).activeOrganizationId
                    if(activeOrgId) {
                        await db.update(user).set({defaultOrganizationId: activeOrgId}).where(eq(user.id, session.userId))
                    }
                }
            }
        }
    },
    trustedOrigins: ["https://app.rs.hauntednuke.com"],
})