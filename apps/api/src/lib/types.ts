import type { auth } from "@packages/auth";
import type { Context } from "hono";

export type HonoEnv = {
    Variables: object;
};
export type AuthEnv = HonoEnv & {
    Variables: {
        user: typeof auth.$Infer.Session.user;
        session: typeof auth.$Infer.Session.session;
    };
};

export type OrgEnv = AuthEnv & {
    Variables: {
        organizationId: string;
    };
};

type ValidationMap = {
    json?: object;
    param?: object;
    query?: object;
};

type ToHonoInput<V extends ValidationMap> = {
    out: { [K in keyof V]: V[K] };
};

export type AppContext<V extends ValidationMap = object> = Context<
    HonoEnv,
    string,
    ToHonoInput<V>
>;

export type AuthContext<V extends ValidationMap = object> = Context<
    AuthEnv,
    string,
    ToHonoInput<V>
>;

export type ToCtx<J, P, Q> = {
    json: J;
    param: P;
    query: Q;
};
