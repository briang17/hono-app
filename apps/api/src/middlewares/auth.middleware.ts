import { auth } from "@packages/auth";
import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export const authMiddleware = createMiddleware(
	async (c: Context, next: Next) => {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});

		if (!session) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		c.set("session", session.session);
		return await next();
	},
);
