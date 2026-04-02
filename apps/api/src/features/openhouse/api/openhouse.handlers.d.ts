export declare const createOpenHouseHandlers: [
    import("hono/types").H<
        import("hono").Env,
        string,
        {
            in: {
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
            out: {
                json: {
                    date: Date;
                    propertyAddress: string;
                    listingPrice: number;
                    startTime: string;
                    endTime: string;
                    images: {
                        url: string;
                        publicId: string;
                        isMain: boolean;
                        orderIndex: number;
                    }[];
                    notes?: string | null | undefined;
                };
            };
        },
        Response
    >,
    import("hono/types").H<
        {
            Variables: import("../../../middlewares/org.middleware").OrgVariables;
        },
        string,
        {},
        Response
    >,
    import("hono/types").H<
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
            Variables: {
                organizationId: string;
            };
        } & {
            Variables: import("../../../middlewares/org.middleware").OrgVariables;
        },
        string,
        {
            in: {
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
            out: {
                json: {
                    date: Date;
                    propertyAddress: string;
                    listingPrice: number;
                    startTime: string;
                    endTime: string;
                    images: {
                        url: string;
                        publicId: string;
                        isMain: boolean;
                        orderIndex: number;
                    }[];
                    notes?: string | null | undefined;
                };
            };
        },
        Promise<
            Response &
                import("hono").TypedResponse<
                    {
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
                    },
                    201,
                    "json"
                >
        >
    >,
];
export declare const getOpenHousesHandlers: [
    import("hono/types").H<
        {
            Variables: import("../../../middlewares/org.middleware").OrgVariables;
        },
        string,
        {},
        Response
    >,
    import("hono/types").H<
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
            Variables: {
                organizationId: string;
            };
        } & {
            Variables: import("../../../middlewares/org.middleware").OrgVariables;
        },
        string,
        {},
        Promise<
            Response &
                import("hono").TypedResponse<
                    {
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
                    },
                    import("hono/utils/http-status").ContentfulStatusCode,
                    "json"
                >
        >
    >,
];
export declare const getOpenHouseHandlers: [
    import("hono/types").H<
        import("hono").Env,
        string,
        {
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
        },
        Response
    >,
    import("hono/types").H<
        {
            Variables: import("../../../middlewares/org.middleware").OrgVariables;
        },
        string,
        {},
        Response
    >,
    import("hono/types").H<
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
            Variables: {
                organizationId: string;
            };
        } & {
            Variables: import("../../../middlewares/org.middleware").OrgVariables;
        },
        string,
        {
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
        },
        Promise<
            Response &
                import("hono").TypedResponse<
                    {
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
                    },
                    import("hono/utils/http-status").ContentfulStatusCode,
                    "json"
                >
        >
    >,
];
export declare const getOpenHouseLeadsHandlers: [
    import("hono/types").H<
        import("hono").Env,
        string,
        {
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
        },
        Response
    >,
    import("hono/types").H<
        {
            Variables: import("../../../middlewares/org.middleware").OrgVariables;
        },
        string,
        {},
        Response
    >,
    import("hono/types").H<
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
            Variables: {
                organizationId: string;
            };
        } & {
            Variables: import("../../../middlewares/org.middleware").OrgVariables;
        },
        string,
        {
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
        },
        Promise<
            Response &
                import("hono").TypedResponse<
                    {
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
                    },
                    import("hono/utils/http-status").ContentfulStatusCode,
                    "json"
                >
        >
    >,
];
export declare const getPublicOpenHouseHandlers: [
    import("hono/types").H<
        import("hono").Env,
        string,
        {
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
        },
        Response
    >,
    import("hono/types").H<
        import("../../../lib/types").HonoEnv,
        string,
        {
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
        },
        Promise<
            Response &
                import("hono").TypedResponse<
                    {
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
                    },
                    import("hono/utils/http-status").ContentfulStatusCode,
                    "json"
                >
        >
    >,
];
export declare const createOpenHouseLeadHandlers: [
    import("hono/types").H<
        import("hono").Env,
        string,
        {
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
        },
        Response
    >,
    import("hono/types").H<
        import("hono").Env,
        string,
        {
            in: {
                json: {
                    firstName: string;
                    lastName: string;
                    email?: string | null | undefined;
                    phone?: string | null | undefined;
                    workingWithAgent?: boolean | undefined;
                    consent?: boolean | undefined;
                    responses?:
                        | Record<string, string | number | string[] | number[]>
                        | null
                        | undefined;
                };
            };
            out: {
                json: {
                    firstName: string;
                    lastName: string;
                    workingWithAgent: boolean;
                    consent: boolean;
                    email?: string | null | undefined;
                    phone?: string | null | undefined;
                    responses?:
                        | Record<string, string | number | string[] | number[]>
                        | null
                        | undefined;
                };
            };
        },
        Response
    >,
    import("hono/types").H<
        import("../../../lib/types").HonoEnv,
        string,
        {
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
                    firstName: string;
                    lastName: string;
                    email?: string | null | undefined;
                    phone?: string | null | undefined;
                    workingWithAgent?: boolean | undefined;
                    consent?: boolean | undefined;
                    responses?:
                        | Record<string, string | number | string[] | number[]>
                        | null
                        | undefined;
                };
            };
            out: {
                json: {
                    firstName: string;
                    lastName: string;
                    workingWithAgent: boolean;
                    consent: boolean;
                    email?: string | null | undefined;
                    phone?: string | null | undefined;
                    responses?:
                        | Record<string, string | number | string[] | number[]>
                        | null
                        | undefined;
                };
            };
        },
        Promise<
            Response &
                import("hono").TypedResponse<
                    {
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
                    },
                    201,
                    "json"
                >
        >
    >,
];
