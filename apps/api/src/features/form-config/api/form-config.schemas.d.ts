import type { ToCtx } from "@lib/types";
import { z } from "zod";
export type GetFormConfigInput = undefined;
export type GetFormConfigQuery = undefined;
export type GetFormConfigCtx = ToCtx<GetFormConfigInput, undefined, GetFormConfigQuery>;
export declare const CreateFormConfigBodySchema: z.ZodObject<{
    questions: z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        type: z.ZodEnum<{
            number: "number";
            short_text: "short_text";
            long_text: "long_text";
            multiple_choice: "multiple_choice";
            checkboxes: "checkboxes";
        }>;
        label: z.ZodString;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodBoolean;
        options: z.ZodOptional<z.ZodArray<z.ZodString>>;
        validation: z.ZodOptional<z.ZodObject<{
            minLength: z.ZodOptional<z.ZodNumber>;
            maxLength: z.ZodOptional<z.ZodNumber>;
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        order: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CreateFormConfigInput = z.infer<typeof CreateFormConfigBodySchema>;
export type CreateFormConfigCtx = ToCtx<CreateFormConfigInput, undefined, undefined>;
export declare const UpdateFormConfigParamsSchema: z.ZodObject<{
    id: z.ZodUUID;
}, z.core.$strip>;
export declare const UpdateFormConfigBodySchema: z.ZodObject<{
    questions: z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        type: z.ZodEnum<{
            number: "number";
            short_text: "short_text";
            long_text: "long_text";
            multiple_choice: "multiple_choice";
            checkboxes: "checkboxes";
        }>;
        label: z.ZodString;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodBoolean;
        options: z.ZodOptional<z.ZodArray<z.ZodString>>;
        validation: z.ZodOptional<z.ZodObject<{
            minLength: z.ZodOptional<z.ZodNumber>;
            maxLength: z.ZodOptional<z.ZodNumber>;
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        order: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type UpdateFormConfigInput = z.infer<typeof UpdateFormConfigBodySchema>;
type UpdateFormConfigParams = z.infer<typeof UpdateFormConfigParamsSchema>;
export type UpdateFormConfigCtx = ToCtx<UpdateFormConfigInput, UpdateFormConfigParams, undefined>;
export declare const DeleteFormConfigParamsSchema: z.ZodObject<{
    id: z.ZodUUID;
}, z.core.$strip>;
type DeleteFormConfigParams = z.infer<typeof DeleteFormConfigParamsSchema>;
export type DeleteFormConfigCtx = ToCtx<undefined, DeleteFormConfigParams, undefined>;
export {};
