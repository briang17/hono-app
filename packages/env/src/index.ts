import dotenv from "dotenv";
import { z } from "zod/v4";

const {parsed: result} = dotenv.config({ path: "../../../.env", quiet: true });

const globalEnvScope = {
    name: "global",
    schema: z.object({
        NODE_ENV: z.enum(["development", "production"]).default("development"),
    }),
};

const apiEnvScope = {
    name:"api", 
    schema: z.object({
        DATABASE_URL: z.url(),
    }),
}

const secretsEnvScope = {
    name: "secrets",
    schema: z.object({
        INFISICAL_CLIENT_ID: z.string(),
        INFISICAL_CLIENT_SECRET: z.string(),
    })
}

const fubClientEnvScope = {
    name: "fubClient",
    schema: z.object({
        RATE: z.coerce.number().default(80),
    })
}

const scopes = [globalEnvScope, apiEnvScope, secretsEnvScope, fubClientEnvScope]

const results: Record<string, unknown> = {};

for (const scope of scopes) {
    const parseResult = scope.schema.safeParse(result);
    if(parseResult.error) throw new Error(`ENV validation error: ${scope.name} environment. ${parseResult.error}`);
    results[scope.name] = parseResult.data;
}

const {global: globalEnv, api: apiEnv, secrets: secretsEnv, fubClient: fubClientEnv} = results;

export {
    globalEnv, apiEnv, secretsEnv, fubClientEnv
}