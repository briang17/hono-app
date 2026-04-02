declare const cloudinaryRoutes: import("hono/hono-base").HonoBase<
    import("../../../lib/types").HonoEnv & {
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
    },
    {
        "/signature": {
            $post: {
                input: {};
                output: {
                    data: {
                        signature: string;
                        timestamp: number;
                        apiKey: string;
                        cloudName: string;
                    };
                };
                outputFormat: "json";
                status: import("hono/utils/http-status").ContentfulStatusCode;
            };
        };
    },
    "/",
    "/signature"
>;
export { cloudinaryRoutes };
