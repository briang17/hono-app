import { z } from "zod/v4";
import { secretsClient } from "@packages/secrets";
import { InfisicalSDK, ListSecretsResponse, Secret } from "@infisical/sdk";

const globalEnvScope = {
    name: "global",
    schema: z.object({
        NODE_ENV: z.enum(["development", "production"]).default("development"),
        DEBUG_LEVEL: z.enum(["ERROR", "WARN", "INFO", "DEBUG"]).default("DEBUG"),
        BETTER_AUTH_URL: z.url().default("http://localhost:3000")
    }),
};

const apiEnvScope = {
    name:"api", 
    schema: z.object({
        DATABASE_URL: z.url(),
    }),
}

const databaseEnvScope = {
    name: "database",
    schema: z.object({
        DB_HOST: z.string(),
        DB_PORT: z.coerce.number().default(5432),
        DB_USER: z.string(),
        DB_PASSWORD: z.string(),
        DB_NAME: z.string(),
    })
}


const infisicalEnvScope = {
    name: "infisical",
    schema: z.object({
        INFISICAL_CLIENT_ID: z.string(),
        INFISICAL_CLIENT_SECRET: z.string(),
        INFISICAL_PROJECT_ID: z.string(),
    })
}

const authEnvScope = {
    name: "auth",
    schema: z.object({
        GITHUB_CLIENT_ID: z.string(),
        GITHUB_CLIENT_SECRET: z.string()
    })
}

const fubClientEnvScope = {
    name: "fubClient",
    schema: z.object({
        RATE: z.coerce.number().default(80),
    })
}

function validate<T>(name: string, schema: z.ZodType<T>, source: unknown): T {
    const result = schema.safeParse(source);
    if(!result.success) {
        throw new Error(`ENV validation error: ${name} environment. ${result.error.message}`);
    }
    return result.data;
}

const envSource = process.env;

const globalEnv = validate(globalEnvScope.name, globalEnvScope.schema, envSource);
const apiEnv = validate(apiEnvScope.name, apiEnvScope.schema, envSource);
const databaseEnv = validate(databaseEnvScope.name, databaseEnvScope.schema, envSource);
const infisicalEnv = validate(infisicalEnvScope.name, infisicalEnvScope.schema, envSource);
const authEnv = validate(authEnvScope.name, authEnvScope.schema, envSource);
const fubClientEnv = validate(fubClientEnvScope.name, fubClientEnvScope.schema, envSource);

const trueclient = new InfisicalSDK();
await trueclient.auth().universalAuth.login({
    clientId: infisicalEnv.INFISICAL_CLIENT_ID,
    clientSecret: infisicalEnv.INFISICAL_CLIENT_SECRET,
})

const envSlug = globalEnv.NODE_ENV === "production" ? "prod" : "dev";

interface SecretScope<T> {
    name: string,
    path: string,
    schema: z.ZodType<T>
}
 
function validateSecrets<T>(secretsScope: SecretScope<T>, groupedSecrets: Secret[]) {
    const parsedSecrets = Object.assign({}, ...groupedSecrets.map((secret) => {
        return {[secret.secretKey]: secret.secretValue}
    }));
    const result = secretsScope.schema.safeParse(parsedSecrets);
    if(!result.success) {
        throw new Error(`Secret validation error: ${secretsScope.name} environment. ${result.error.message}`)
    }
}

const secretsSource = await trueclient.secrets().listSecretsWithImports({
    environment: envSlug,
    projectId: infisicalEnv.INFISICAL_PROJECT_ID,
    recursive: true
})

const authSecretsScope = {
    name: "auth",
    path: "/auth",
    schema: z.object({
        BETTER_AUTH_SECRET: z.string()
    })
}

const groupedAuthSecrets = secretsSource.filter((secret) => secret.secretPath === authSecretsScope.path);

const authSecrets = validateSecrets(authSecretsScope, groupedAuthSecrets);

export {
    globalEnv, apiEnv, databaseEnv, infisicalEnv, authEnv, fubClientEnv,
    authSecrets
}