import {InfisicalSDK} from '@infisical/sdk';
import { secretsEnv } from '@packages/env/src';
const client = new InfisicalSDK();

await client.auth().universalAuth.login({
    clientId: secretsEnv.INFISICAL_CLIENT_ID,
    clientSecret: secretsEnv.INFISICAL_CLIENT_SECRET
});

const getSecrets = async (tags: string[]) => {
    const result = await client.secrets().listSecretsWithImports({
        environment: "dev",
        projectId: "1988e3bf-8e03-4b0b-a203-6ff984f01039",
        tagSlugs: tags ?? undefined
    })
    return result;
}

export {
    getSecrets
}