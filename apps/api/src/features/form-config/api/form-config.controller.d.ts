import type { AuthContext } from "@lib/types";
import type { CreateFormConfigCtx, DeleteFormConfigCtx, GetFormConfigCtx, UpdateFormConfigCtx } from "./form-config.schemas";
export declare const formConfigController: {
    getFormConfig: (c: AuthContext<GetFormConfigCtx>) => Promise<Response & import("hono").TypedResponse<{
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
    }, import("hono/utils/http-status").ContentfulStatusCode, "json">>;
    createFormConfig: (c: AuthContext<CreateFormConfigCtx>) => Promise<Response & import("hono").TypedResponse<{
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
    }, 201, "json">>;
    updateFormConfig: (c: AuthContext<UpdateFormConfigCtx>) => Promise<Response & import("hono").TypedResponse<{
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
    }, import("hono/utils/http-status").ContentfulStatusCode, "json">>;
    deleteFormConfig: (c: AuthContext<DeleteFormConfigCtx>) => Promise<Response & import("hono").TypedResponse<{
        message: string;
    }, import("hono/utils/http-status").ContentfulStatusCode, "json">>;
};
