declare const formConfigRoutes: import("hono/hono-base").HonoBase<import("../../../lib/types").HonoEnv & {
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
}, {
    "/": {
        $get: {
            input: {};
            output: {
                data: {
                    id: string;
                    organizationId: string;
                    questions: {
                        id: string;
                        type: "number" | "short_text" | "long_text" | "multiple_choice" | "checkboxes";
                        label: string;
                        required: boolean;
                        order: number;
                        placeholder?: string | undefined;
                        options?: string[] | undefined;
                        validation?: {
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            min?: number | undefined;
                            max?: number | undefined;
                        } | undefined;
                    }[];
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
            input: {};
            output: {
                data: {
                    id: string;
                    organizationId: string;
                    questions: {
                        id: string;
                        type: "number" | "short_text" | "long_text" | "multiple_choice" | "checkboxes";
                        label: string;
                        required: boolean;
                        order: number;
                        placeholder?: string | undefined;
                        options?: string[] | undefined;
                        validation?: {
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            min?: number | undefined;
                            max?: number | undefined;
                        } | undefined;
                    }[];
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
        $put: {
            input: {
                param: {
                    id: string;
                };
            };
            output: {
                data: {
                    id: string;
                    organizationId: string;
                    questions: {
                        id: string;
                        type: "number" | "short_text" | "long_text" | "multiple_choice" | "checkboxes";
                        label: string;
                        required: boolean;
                        order: number;
                        placeholder?: string | undefined;
                        options?: string[] | undefined;
                        validation?: {
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            min?: number | undefined;
                            max?: number | undefined;
                        } | undefined;
                    }[];
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
            output: {
                message: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
}, "/", "/:id">;
export { formConfigRoutes };
