import { auth } from "@packages/auth";
import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";

export const authMiddleware = createMiddleware(
	async (c: Context, next: Next) => {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});

		if (!session) {
			throw new Error("Unauthorized");
		}

		c.set("session", session.session);

		console.log(c.get("session"));
		return next();
	},
);
