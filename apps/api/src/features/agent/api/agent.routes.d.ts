declare const agentRoutes: import("hono/hono-base").HonoBase<import("../../../lib/types").HonoEnv & {
    Variables: {
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            emailVerified: boolean;
            name: string;
            image?: string | null | undefined;
            defaultOrganizationId?: string | null | undefined;
            banned: boolean | null | undefined;
            role?: string | null | undefined;
            banReason?: string | null | undefined;
            banExpires?: Date | null | undefined;
        };
        session: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            expiresAt: Date;
            token: string;
            ipAddress?: string | null | undefined;
            userAgent?: string | null | undefined;
            activeOrganizationId?: string | null | undefined;
            impersonatedBy?: string | null | undefined;
        };
    };
} & {
    Variables: import("@middlewares/org.middleware").OrgVariables;
}, {
    "/": {
        $get: {
            input: {};
            output: {
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
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/:id": {
        $get: {
            input: {
                param: {
                    id: string;
                };
            };
            output: {
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
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/": {
        $post: {
            input: {
                json: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    phone: string | null;
                    fubId: string | null;
                };
            };
            output: {
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
            };
            outputFormat: "json";
            status: 201;
        };
    };
} & {
    "/:id": {
        $patch: {
            input: {
                param: {
                    id: string;
                };
            } & {
                json: {
                    email?: string | undefined;
                    firstName?: string | undefined;
                    lastName?: string | undefined;
                    phone?: string | null | undefined;
                    fubId?: string | null | undefined;
                };
            };
            output: {
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
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/:id": {
        $delete: {
            input: {
                param: {
                    id: string;
                };
            };
            output: null;
            outputFormat: "body";
            status: 200;
        };
    };
} & {
    "/:id/deactivate": {
        $post: {
            input: {
                param: {
                    id: string;
                };
            };
            output: {
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
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/:id/reactivate": {
        $post: {
            input: {
                param: {
                    id: string;
                };
            };
            output: {
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
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
}, "/", "/:id/reactivate">;
export { agentRoutes };
