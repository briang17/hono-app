import {defineConfig} from "drizzle-kit";
import { databaseEnv as env } from "@packages/env";
import { globalEnv } from "@packages/env";

export default defineConfig({
    out: './drizzle',
    schema: './src/schemas/*schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        ssl: globalEnv.NODE_ENV === 'production' ? true : false
    }
})