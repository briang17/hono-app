import { codes } from "@config/constants";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { AuthVariables } from "./auth.middleware";

export type OrgVariables = AuthVariables & {
    organizationId: string;
};

export const orgMiddleware = createMiddleware<{ Variables: OrgVariables }>(
    async (c, next) => {
        const session = c.get("session");
        const organizationId = session.activeOrganizationId;
        if (!organizationId) {
            throw new HTTPException(codes.FORBIDDEN, {
                message:
                    "No active organization selected. Please create or select one.",
            });
        }

        c.set("organizationId", organizationId);
        return await next();
    },
);
