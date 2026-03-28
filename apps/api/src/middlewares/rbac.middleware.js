import { codes } from "@config/constants";
import { auth } from "@packages/auth";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
export const rbacMiddleware = (permissions) => createMiddleware(async (c, next) => {
    const result = await auth.api.hasPermission({
        headers: c.req.raw.headers,
        body: { permissions },
    });
    if (!result.success) {
        throw new HTTPException(codes.FORBIDDEN, {
            message: "Forbidden: missing required permissions",
        });
    }
    return await next();
});
