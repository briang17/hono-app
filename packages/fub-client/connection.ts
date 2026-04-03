import { type RedisOptions } from "ioredis";
import { fubClientEnv } from "@packages/env";

export const connection: RedisOptions = {
    host: fubClientEnv.REDIS_HOST,
    port: fubClientEnv.REDIS_PORT,
};
