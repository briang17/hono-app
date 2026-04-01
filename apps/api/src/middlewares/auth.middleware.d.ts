import type { AuthEnv } from "@lib/types";
import { auth } from "@packages/auth";
export type AuthVariables = {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
};
export declare const authMiddleware: import("hono").MiddlewareHandler<
    AuthEnv,
    string,
    {},
    Response
>;
