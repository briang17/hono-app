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
                        images: {
                            id: string;
                            openHouseId: string;
                            url: string;
                            publicId: string;
                            isMain: boolean;
                            orderIndex: number;
                            createdAt: string;
                        }[];
                        createdAt: string;
                        updatedAt: string;
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
                        images: {
                            id: string;
                            openHouseId: string;
                            url: string;
                            publicId: string;
                            isMain: boolean;
                            orderIndex: number;
                            createdAt: string;
                        }[];
                        createdAt: string;
                        updatedAt: string;
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
                        leads: {
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
                                      [x: string]:
                                          | string
                                          | number
                                          | string[]
                                          | number[];
                                  }
                                | null
                                | undefined;
                        }[];
                        formConfig: {
                            id: string;
                            organizationId: string;
                            questions: {
                                id: string;
                                type:
                                    | "number"
                                    | "text"
                                    | "date"
                                    | "select"
                                    | "textarea"
                                    | "checkbox"
                                    | "radio"
                                    | "range";
                                label: string;
                                required: boolean;
                                placeholder?: string | undefined;
                                options?:
                                    | {
                                          label: string;
                                          value: string;
                                      }[]
                                    | undefined;
                                validation?:
                                    | {
                                          minLength?: number | undefined;
                                          maxLength?: number | undefined;
                                          min?: number | undefined;
                                          max?: number | undefined;
                                      }
                                    | undefined;
                                step?: number | undefined;
                            }[];
                            createdAt: string;
                            updatedAt: string;
                        } | null;
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
                        date: unknown;
                        propertyAddress: string;
                        listingPrice: number;
                        startTime: string;
                        endTime: string;
                        notes?: string | null | undefined;
                        images?:
                            | {
                                  url: string;
                                  publicId: string;
                                  isMain?: boolean | undefined;
                                  orderIndex?: number | undefined;
                              }[]
                            | undefined;
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
                        images: {
                            id: string;
                            openHouseId: string;
                            url: string;
                            publicId: string;
                            isMain: boolean;
                            orderIndex: number;
                            createdAt: string;
                        }[];
                        createdAt: string;
                        updatedAt: string;
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
                        propertyAddress: string;
                        date: string;
                        startTime: string;
                        endTime: string;
                        formConfig: {
                            id: string;
                            organizationId: string;
                            questions: {
                                id: string;
                                type:
                                    | "number"
                                    | "text"
                                    | "date"
                                    | "select"
                                    | "textarea"
                                    | "checkbox"
                                    | "radio"
                                    | "range";
                                label: string;
                                required: boolean;
                                placeholder?: string | undefined;
                                options?:
                                    | {
                                          label: string;
                                          value: string;
                                      }[]
                                    | undefined;
                                validation?:
                                    | {
                                          minLength?: number | undefined;
                                          maxLength?: number | undefined;
                                          min?: number | undefined;
                                          max?: number | undefined;
                                      }
                                    | undefined;
                                step?: number | undefined;
                            }[];
                            createdAt: string;
                            updatedAt: string;
                        } | null;
                        images: {
                            id: string;
                            openHouseId: string;
                            url: string;
                            publicId: string;
                            isMain: boolean;
                            orderIndex: number;
                            createdAt: string;
                        }[];
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
                        workingWithAgent?: boolean | undefined;
                        consent?: boolean | undefined;
                        responses?:
                            | Record<
                                  string,
                                  string | number | string[] | number[]
                              >
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
                                  [x: string]:
                                      | string
                                      | number
                                      | string[]
                                      | number[];
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
