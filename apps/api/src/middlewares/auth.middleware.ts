import { AuthEnv } from "@lib/types";
import { auth } from "@packages/auth";
import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export type AuthVariables = {
	user: typeof auth.$Infer.Session.user;
	session: typeof auth.$Infer.Session.session;
}

export const authMiddleware = createMiddleware<AuthEnv>(
	async (c: Context, next: Next) => {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});

		if (!session) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		c.set("user", session.user);
		c.set("session", session.session);
		return await next();
	},
);
