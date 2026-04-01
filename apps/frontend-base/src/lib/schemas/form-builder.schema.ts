import { z } from 'zod/v4'

export const QuestionTypeSchema = z.enum([
    'text',
    'textarea',
    'number',
    'select',
    'checkbox',
    'radio',
    'date',
    'range',
])

export const OptionSchema = z.object({
    label: z.string().min(1),
    value: z.string().min(1),
})

export const QuestionValidationSchema = z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
})

export const QuestionSchema = z.object({
    id: z.uuid(),
    type: QuestionTypeSchema,
    label: z.string().min(1),
    placeholder: z.string().optional(),
    required: z.boolean(),
    options: z.array(OptionSchema).optional(),
    validation: QuestionValidationSchema.optional(),
    step: z.number().positive().optional(),
})

export const FormConfigSchema = z.object({
    id: z.uuid(),
    organizationId: z.uuid(),
    questions: z.array(QuestionSchema),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
})

export const SaveFormConfigSchema = z
    .object({
        questions: z.array(QuestionSchema),
    })
    .refine((data) => {
        const ids = data.questions.map((q) => q.id)
        return ids.length === new Set(ids).size
    }, 'Question IDs must be unique')

export type FieldType = z.infer<typeof QuestionTypeSchema>
export type Option = z.infer<typeof OptionSchema>
export type QuestionValidation = z.infer<typeof QuestionValidationSchema>
export type FormFieldConfig = z.infer<typeof QuestionSchema>
export type FormConfig = z.infer<typeof FormConfigSchema>
export type SaveFormConfigInput = z.infer<typeof SaveFormConfigSchema>
