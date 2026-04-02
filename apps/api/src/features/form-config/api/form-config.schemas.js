import { FormConfigSchema, NewFormConfigSchema, } from "@formconfig/domain/form-config.entity";
import { z } from "zod";
export const GetFormConfigParamsSchema = z.object({});
export const CreateFormConfigBodySchema = z.object({
    questions: NewFormConfigSchema.shape.questions,
});
export const UpdateFormConfigParamsSchema = z.object({
    id: FormConfigSchema.shape.id,
});
export const UpdateFormConfigBodySchema = z.object({
    questions: NewFormConfigSchema.shape.questions,
});
export const DeleteFormConfigParamsSchema = z.object({
    id: FormConfigSchema.shape.id,
});
