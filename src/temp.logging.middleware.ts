import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";

export const logReq = createMiddleware(async (c: Context, next: Next) => {
	const body = await c.req.json();
	console.log(c.req.method, c.req.path);
	console.log(body);

	await next();
});
