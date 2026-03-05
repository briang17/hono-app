import {
    FormConfigSchema,
    NewFormConfigSchema,
} from "@formconfig/domain/form-config.entity";
import type { ToCtx } from "@lib/types";
import { z } from "zod";

/* GET /api/form-config -> getFormConfig() */
export type GetFormConfigInput = undefined;
export type GetFormConfigQuery = undefined;

export type GetFormConfigCtx = ToCtx<
    GetFormConfigInput,
    undefined,
    GetFormConfigQuery
>;

/* POST /api/form-config -> createFormConfig() */
export const CreateFormConfigBodySchema = z.object({
    questions: NewFormConfigSchema.shape.questions,
});
export type CreateFormConfigInput = z.infer<typeof CreateFormConfigBodySchema>;

export type CreateFormConfigCtx = ToCtx<
    CreateFormConfigInput,
    undefined,
    undefined
>;

/* PUT /api/form-config/:id -> updateFormConfig() */
export const UpdateFormConfigParamsSchema = z.object({
    id: FormConfigSchema.shape.id,
});
export const UpdateFormConfigBodySchema = z.object({
    questions: NewFormConfigSchema.shape.questions,
});
export type UpdateFormConfigInput = z.infer<typeof UpdateFormConfigBodySchema>;
type UpdateFormConfigParams = z.infer<typeof UpdateFormConfigParamsSchema>;

export type UpdateFormConfigCtx = ToCtx<
    UpdateFormConfigInput,
    UpdateFormConfigParams,
    undefined
>;

/* DELETE /api/form-config/:id -> deleteFormConfig() */
export const DeleteFormConfigParamsSchema = z.object({
    id: FormConfigSchema.shape.id,
});
type DeleteFormConfigParams = z.infer<typeof DeleteFormConfigParamsSchema>;

export type DeleteFormConfigCtx = ToCtx<
    undefined,
    DeleteFormConfigParams,
    undefined
>;
