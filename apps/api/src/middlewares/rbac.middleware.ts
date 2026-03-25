import { codes } from "@config/constants";
import { auth } from "@packages/auth";
import type { RBACParams } from "@packages/auth/lib/permissions";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { OrgVariables } from "./org.middleware";

export const rbacMiddleware = (permissions: RBACParams) =>
    createMiddleware<{ Variables: OrgVariables }>(async (c, next) => {
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
