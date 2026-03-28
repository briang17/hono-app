import { auth } from "@packages/auth";
export declare const getAgentsHandlers: [import("hono/types").H<{
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {}, Response>, import("hono/types").H<import("../../../lib/types").HonoEnv & {
    Variables: {
        user: typeof auth.$Infer.Session.user;
        session: typeof auth.$Infer.Session.session;
    };
} & {
    Variables: {
        organizationId: string;
    };
} & {
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {}, Promise<Response & import("hono").TypedResponse<{
    data: {
        id: string;
        userId: string | null;
        organizationId: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        fubId: string | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        userName: string | null;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">>>];
export declare const getAgentHandlers: [import("hono/types").H<import("hono").Env, string, {
    in: {
        param: {
            id: string;
        };
    };
    out: {
        param: {
            id: string;
        };
    };
}, Response>, import("hono/types").H<{
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {}, Response>, import("hono/types").H<import("../../../lib/types").HonoEnv & {
    Variables: {
        user: typeof auth.$Infer.Session.user;
        session: typeof auth.$Infer.Session.session;
    };
} & {
    Variables: {
        organizationId: string;
    };
} & {
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {
    in: {
        param: {
            id: string;
        };
    };
    out: {
        param: {
            id: string;
        };
    };
}, Promise<Response & import("hono").TypedResponse<{
    data: {
        id: string;
        userId: string | null;
        organizationId: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        fubId: string | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">>>];
export declare const createAgentHandlers: [import("hono/types").H<import("hono").Env, string, {
    in: {
        json: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            fubId: string | null;
        };
    };
    out: {
        json: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            fubId: string | null;
        };
    };
}, Response>, import("hono/types").H<{
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {}, Response>, import("hono/types").H<import("../../../lib/types").HonoEnv & {
    Variables: {
        user: typeof auth.$Infer.Session.user;
        session: typeof auth.$Infer.Session.session;
    };
} & {
    Variables: {
        organizationId: string;
    };
} & {
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {
    in: {
        json: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            fubId: string | null;
        };
    };
    out: {
        json: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            fubId: string | null;
        };
    };
}, Promise<Response & import("hono").TypedResponse<{
    data: {
        id: string;
        userId: string | null;
        organizationId: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        fubId: string | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
}, 201, "json">>>];
export declare const updateAgentHandlers: [import("hono/types").H<import("hono").Env, string, {
    in: {
        param: {
            id: string;
        };
    };
    out: {
        param: {
            id: string;
        };
    };
}, Response>, import("hono/types").H<import("hono").Env, string, {
    in: {
        json: {
            email?: string | undefined;
            firstName?: string | undefined;
            lastName?: string | undefined;
            phone?: string | null | undefined;
            fubId?: string | null | undefined;
        };
    };
    out: {
        json: {
            email?: string | undefined;
            firstName?: string | undefined;
            lastName?: string | undefined;
            phone?: string | null | undefined;
            fubId?: string | null | undefined;
        };
    };
}, Response>, import("hono/types").H<{
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {}, Response>, import("hono/types").H<import("../../../lib/types").HonoEnv & {
    Variables: {
        user: typeof auth.$Infer.Session.user;
        session: typeof auth.$Infer.Session.session;
    };
} & {
    Variables: {
        organizationId: string;
    };
} & {
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {
    in: {
        param: {
            id: string;
        };
    };
    out: {
        param: {
            id: string;
        };
    };
} & {
    in: {
        json: {
            email?: string | undefined;
            firstName?: string | undefined;
            lastName?: string | undefined;
            phone?: string | null | undefined;
            fubId?: string | null | undefined;
        };
    };
    out: {
        json: {
            email?: string | undefined;
            firstName?: string | undefined;
            lastName?: string | undefined;
            phone?: string | null | undefined;
            fubId?: string | null | undefined;
        };
    };
}, Promise<Response & import("hono").TypedResponse<{
    data: {
        id: string;
        userId: string | null;
        organizationId: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        fubId: string | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">>>];
export declare const deleteAgentHandlers: [import("hono/types").H<import("hono").Env, string, {
    in: {
        param: {
            id: string;
        };
    };
    out: {
        param: {
            id: string;
        };
    };
}, Response>, import("hono/types").H<{
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {}, Response>, import("hono/types").H<import("../../../lib/types").HonoEnv & {
    Variables: {
        user: typeof auth.$Infer.Session.user;
        session: typeof auth.$Infer.Session.session;
    };
} & {
    Variables: {
        organizationId: string;
    };
} & {
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {
    in: {
        param: {
            id: string;
        };
    };
    out: {
        param: {
            id: string;
        };
    };
}, Promise<Response & import("hono").TypedResponse<null, 200, "body">>>];
export declare const deactivateAgentHandlers: [import("hono/types").H<import("hono").Env, string, {
    in: {
        param: {
            id: string;
        };
    };
    out: {
        param: {
            id: string;
        };
    };
}, Response>, import("hono/types").H<{
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {}, Response>, import("hono/types").H<import("../../../lib/types").HonoEnv & {
    Variables: {
        user: typeof auth.$Infer.Session.user;
        session: typeof auth.$Infer.Session.session;
    };
} & {
    Variables: {
        organizationId: string;
    };
} & {
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {
    in: {
        param: {
            id: string;
        };
    };
    out: {
        param: {
            id: string;
        };
    };
}, Promise<Response & import("hono").TypedResponse<{
    data: {
        id: string;
        userId: string | null;
        organizationId: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        fubId: string | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">>>];
export declare const reactivateAgentHandlers: [import("hono/types").H<import("hono").Env, string, {
    in: {
        param: {
            id: string;
        };
    };
    out: {
        param: {
            id: string;
        };
    };
}, Response>, import("hono/types").H<{
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {}, Response>, import("hono/types").H<import("../../../lib/types").HonoEnv & {
    Variables: {
        user: typeof auth.$Infer.Session.user;
        session: typeof auth.$Infer.Session.session;
    };
} & {
    Variables: {
        organizationId: string;
    };
} & {
    Variables: import("../../../middlewares/org.middleware").OrgVariables;
}, string, {
    in: {
        param: {
            id: string;
        };
    };
    out: {
        param: {
            id: string;
        };
    };
}, Promise<Response & import("hono").TypedResponse<{
    data: {
        id: string;
        userId: string | null;
        organizationId: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        fubId: string | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">>>];
