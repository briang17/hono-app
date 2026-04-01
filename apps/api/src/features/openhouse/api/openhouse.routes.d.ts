declare const openhouseRoutes: import("hono/hono-base").HonoBase<
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
        "/": {
            $get: {
                input: {};
                output: {
                    data: {
                        id: string;
                        organizationId: string;
                        createdByUserId: string;
                        propertyAddress: string;
                        listingPrice: number;
                        date: string;
                        startTime: string;
                        endTime: string;
                        createdAt: string;
                        updatedAt: string;
                        listingImageUrl?: string | null | undefined;
                        notes?: string | null | undefined;
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
                        organizationId: string;
                        createdByUserId: string;
                        propertyAddress: string;
                        listingPrice: number;
                        date: string;
                        startTime: string;
                        endTime: string;
                        createdAt: string;
                        updatedAt: string;
                        listingImageUrl?: string | null | undefined;
                        notes?: string | null | undefined;
                    };
                };
                outputFormat: "json";
                status: import("hono/utils/http-status").ContentfulStatusCode;
            };
        };
    } & {
        "/:id/leads": {
            $get: {
                input: {
                    param: {
                        id: string;
                    };
                };
                output: {
                    data: {
                        id: string;
                        openHouseId: string;
                        organizationId: string;
                        firstName: string;
                        lastName: string;
                        workingWithAgent: boolean;
                        submittedAt: string;
                        consent: boolean;
                        email?: string | null | undefined;
                        phone?: string | null | undefined;
                        responses?:
                            | {
                                  [
                                      x: string
                                  ]: import("hono/utils/types").JSONValue;
                                  [
                                      x: number
                                  ]: import("hono/utils/types").JSONValue;
                              }
                            | null
                            | undefined;
                    }[];
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
                        date: unknown;
                        propertyAddress: string;
                        listingPrice: number;
                        startTime: string;
                        endTime: string;
                        listingImageUrl?: string | null | undefined;
                        notes?: string | null | undefined;
                    };
                };
                output: {
                    data: {
                        id: string;
                        organizationId: string;
                        createdByUserId: string;
                        propertyAddress: string;
                        listingPrice: number;
                        date: string;
                        startTime: string;
                        endTime: string;
                        createdAt: string;
                        updatedAt: string;
                        listingImageUrl?: string | null | undefined;
                        notes?: string | null | undefined;
                    };
                };
                outputFormat: "json";
                status: 201;
            };
        };
    },
    "/",
    "/"
>;
declare const publicOpenHouseRoutes: import("hono/hono-base").HonoBase<
    import("hono/types").BlankEnv,
    {
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
                        organizationId: string;
                        createdByUserId: string;
                        propertyAddress: string;
                        listingPrice: number;
                        date: string;
                        startTime: string;
                        endTime: string;
                        createdAt: string;
                        updatedAt: string;
                        listingImageUrl?: string | null | undefined;
                        notes?: string | null | undefined;
                    };
                };
                outputFormat: "json";
                status: import("hono/utils/http-status").ContentfulStatusCode;
            };
        };
    } & {
        "/:id/sign-in": {
            $post: {
                input: {
                    param: {
                        id: string;
                    };
                } & {
                    json: {
                        firstName: string;
                        lastName: string;
                        email?: string | null | undefined;
                        phone?: string | null | undefined;
                        consent?: boolean | undefined;
                        workingWithAgent?: boolean | undefined;
                        responses?:
                            | Record<PropertyKey, unknown>
                            | null
                            | undefined;
                    };
                };
                output: {
                    data: {
                        id: string;
                        openHouseId: string;
                        organizationId: string;
                        firstName: string;
                        lastName: string;
                        workingWithAgent: boolean;
                        submittedAt: string;
                        consent: boolean;
                        email?: string | null | undefined;
                        phone?: string | null | undefined;
                        responses?:
                            | {
                                  [
                                      x: string
                                  ]: import("hono/utils/types").JSONValue;
                                  [
                                      x: number
                                  ]: import("hono/utils/types").JSONValue;
                              }
                            | null
                            | undefined;
                    };
                };
                outputFormat: "json";
                status: 201;
            };
        };
    },
    "/",
    "/:id/sign-in"
>;
export { openhouseRoutes, publicOpenHouseRoutes };
