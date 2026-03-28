import { FormConfigSchema, NewFormConfigSchema, } from "@formconfig/domain/form-config.entity";
import { z } from "zod";
/* POST /api/form-config -> createFormConfig() */
export const CreateFormConfigBodySchema = z.object({
    questions: NewFormConfigSchema.shape.questions,
});
/* PUT /api/form-config/:id -> updateFormConfig() */
export const UpdateFormConfigParamsSchema = z.object({
    id: FormConfigSchema.shape.id,
});
export const UpdateFormConfigBodySchema = z.object({
    questions: NewFormConfigSchema.shape.questions,
});
/* DELETE /api/form-config/:id -> deleteFormConfig() */
export const DeleteFormConfigParamsSchema = z.object({
    id: FormConfigSchema.shape.id,
});
