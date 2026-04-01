import type { RBACParams } from "@packages/auth/lib/permissions";
import type { OrgVariables } from "./org.middleware";
export declare const rbacMiddleware: (
    permissions: RBACParams,
) => import("hono").MiddlewareHandler<
    {
        Variables: OrgVariables;
    },
    string,
    {},
    Response
>;
