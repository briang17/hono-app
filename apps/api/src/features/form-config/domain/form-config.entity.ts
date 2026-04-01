import { DateSchema, type Id, IdSchema } from "@features/common/values";
import { z } from "zod";

export const QuestionTypeSchema = z.enum([
    "text",
    "textarea",
    "number",
    "select",
    "checkbox",
    "radio",
    "date",
    "range",
]);

export const OptionSchema = z.object({
    label: z.string().min(1),
    value: z.string().min(1),
});

export const QuestionValidationSchema = z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
});

export const QuestionSchema = z.object({
    id: IdSchema,
    type: QuestionTypeSchema,
    label: z.string().min(1, "Question label is required"),
    placeholder: z.string().optional(),
    required: z.boolean(),
    options: z.array(OptionSchema).optional(),
    validation: QuestionValidationSchema.optional(),
    step: z.number().positive().optional(),
});

export type Question = z.infer<typeof QuestionSchema>;

export const FormConfigSchema = z.object({
    id: IdSchema,
    organizationId: IdSchema,
    questions: z.array(QuestionSchema),
    createdAt: DateSchema,
    updatedAt: DateSchema,
});

export const NewFormConfigSchema = z
    .object({
        questions: z.array(QuestionSchema),
    })
    .refine((data) => {
        const ids = data.questions.map((q) => q.id);
        return ids.length === new Set(ids).size;
    }, "Question IDs must be unique");

export type FormConfig = z.infer<typeof FormConfigSchema>;

export const FormConfigFactory = {
    create: (
        params: z.input<typeof NewFormConfigSchema>,
        organizationId: Id,
    ): FormConfig => {
        const now = new Date();
        const result = FormConfigSchema.parse({
            ...params,
            id: Bun.randomUUIDv7(),
            organizationId,
            createdAt: now,
            updatedAt: now,
        });
        return result;
    },
    fromDb: (params: z.input<typeof FormConfigSchema>): FormConfig => {
        const result = FormConfigSchema.parse(params);
        return result;
    },
};
