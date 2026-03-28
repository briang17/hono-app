import type { AuthVariables } from "./auth.middleware";
export type OrgVariables = AuthVariables & {
    organizationId: string;
};
export declare const orgMiddleware: import("hono").MiddlewareHandler<{
    Variables: OrgVariables;
}, string, {}, Response>;
