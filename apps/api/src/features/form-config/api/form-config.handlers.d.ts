export declare const getFormConfigHandlers: [
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
                        };
                    },
                    import("hono/utils/http-status").ContentfulStatusCode,
                    "json"
                >
        >
    >,
];
export declare const createFormConfigHandlers: [
    import("hono/types").H<
        import("hono").Env,
        string,
        {
            in: {
                json: {
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
                };
            };
            out: {
                json: {
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
                };
            };
            out: {
                json: {
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
                        };
                    },
                    201,
                    "json"
                >
        >
    >,
];
export declare const updateFormConfigHandlers: [
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
                };
            };
            out: {
                json: {
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
        } & {
            in: {
                json: {
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
                };
            };
            out: {
                json: {
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
                        };
                    },
                    import("hono/utils/http-status").ContentfulStatusCode,
                    "json"
                >
        >
    >,
];
export declare const deleteFormConfigHandlers: [
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
                        message: string;
                    },
                    import("hono/utils/http-status").ContentfulStatusCode,
                    "json"
                >
        >
    >,
];
