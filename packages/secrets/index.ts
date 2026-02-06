import {InfisicalSDK} from '@infisical/sdk';

const secretsClient = async (config: {clientId: string, clientSecret: string, projectId: string, environment: "production" |"development"}) => {
    
    return async (tags?: string[]) => {
        const client = new InfisicalSDK();
        try {
    
            await client.auth().universalAuth.login({
                clientId: config.clientId,
                clientSecret: config.clientSecret
            });
    
            const result = await client.secrets().listSecretsWithImports({
                environment: config.environment === "production" ? "prod" : "dev",
                projectId: config.projectId,
                tagSlugs: tags ?? undefined
            })
    
            if(!result || result.length < 1) throw new Error("!result || result.length < 1");
    
            const secrets: Record<string, any> = {};
            for(const secret of result) {
                secrets[secret.secretKey] = secret.secretValue;
            }
        
            return secrets;
    
        } catch (error: unknown) {
            console.error("SECRETS ERROR DO PROPER LOGGING: ", error);
        }    
        return [];
    }

}

export {
    secretsClient
}