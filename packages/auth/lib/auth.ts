import { betterAuth} from "better-auth";
import {organization, admin, openAPI} from "better-auth/plugins";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "@packages/database";
import {eq, and} from "drizzle-orm";
import * as authSchema from "@packages/database/src/schemas/auth.schema";
import { agent } from "@packages/database/src/schemas/agent.schema";
import { authEnv as env } from "@packages/env";
import { ac, owner, admin as adminRole, agent as agentRole } from "./permissions";
import { addInvitationEmailJob } from "@packages/emailer";

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
            agent: agentRole
        },
        allowUserToCreateOrganization: async (user) => {
            return user.role === "admin" || user.role === "tenant";
        },
        async sendInvitationEmail(data) {
            addInvitationEmailJob({
                invitationId: data.id,
                email: data.email,
                organizationName: data.organization.name,
                inviterName: data.inviter?.name,
            }).catch((err) => {
                console.error("[emailer] Failed to queue invitation email:", err);
            });
        },
        organizationHooks: {
            afterAcceptInvitation: async ({ invitation, user, organization }) => {
                await db.update(agent)
                    .set({ userId: user.id })
                    .where(
                        and(
                            eq(agent.organizationId, organization.id),
                            eq(agent.email, invitation.email)
                        )
                    );
            }
        }
    }), admin({
        ac,
        roles: {
            owner,
            admin: adminRole,
            agent: agentRole
        }
    }), openAPI()],
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