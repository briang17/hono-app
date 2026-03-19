import { betterAuth} from "better-auth";
import {organization, admin, openAPI} from "better-auth/plugins";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "@packages/database";
import * as authSchema from "@packages/database/src/schemas/auth.schema"
import { authEnv as env } from "@packages/env";


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
    plugins: [organization(), admin(), openAPI()],
    advanced: {
        database: {
            generateId: () => crypto.randomUUID()
        },
    },
    trustedOrigins: ["https://app.rs.hauntednuke.com"],
})