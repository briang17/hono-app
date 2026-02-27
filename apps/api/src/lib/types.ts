import { auth } from "@packages/auth";
import { Context } from "hono";


export type HonoEnv = {
    Variables: {
    }
}
export type AuthEnv = HonoEnv & {
    Variables: {
        user: typeof auth.$Infer.Session.user;
        session: typeof auth.$Infer.Session.session;
    }
}

type ValidationMap = {
    json?: any; param?: any; query?: any
}

type ToHonoInput<V extends ValidationMap> = {
    out: {[K in keyof V]: V[K]};
}

export type AppContext<V extends ValidationMap ={}> = Context<
    HonoEnv,
    string,
    ToHonoInput<V>
>

export type AuthContext<V extends ValidationMap = {}> = Context<
    AuthEnv,
    string,
    ToHonoInput<V>
>

export type ToCtx<J, P, Q> = {
	json: J,
	param: P,
	query: Q
}