import { codes } from "@config/constants";
import { auth } from "@packages/auth";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
export const authMiddleware = createMiddleware(async (c, next) => {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });
    if (!session) {
        throw new HTTPException(codes.UNAUTHORIZED, {
            message: "Unauthorized",
        });
    }
    c.set("user", session.user);
    c.set("session", session.session);
    return await next();
});
