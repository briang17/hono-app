import { RedisOptions } from "ioredis";
import { emailerEnv } from "@packages/env";

console.log(emailerEnv);

export const connection: RedisOptions = {
	host: emailerEnv.REDIS_HOST,
	port: emailerEnv.REDIS_PORT,
};