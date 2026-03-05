import {z} from 'zod/v4';

const envSource = import.meta.env;

const envSchema = z.object({
    VITE_API_URL: z.url()
})

function validate<T>(name: string, schema: z.ZodType<T>, source: unknown): T {
    const result = schema.safeParse(source);
    if (!result.success) {
        throw new Error(
            `ENV validation error: ${name} environment. ${result.error.message}`,
        );
    }
    return result.data;
}


const env = validate("env", envSchema, envSource);

export {env}