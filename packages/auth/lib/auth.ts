import { betterAuth } from "better-auth";
import {organization, admin, openAPI} from "better-auth/plugins";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "@packages/database";
import { authEnv as env } from "@packages/env";


export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg"
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET
        }
    },
    plugins: [organization(), admin(), openAPI()]
})