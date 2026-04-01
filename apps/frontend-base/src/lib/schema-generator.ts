import { z } from 'zod/v4'
import type { FormFieldConfig } from '@/lib/schemas/form-builder.schema'

export function generateFormSchema(fields: FormFieldConfig[]) {
    const shape: Record<string, z.ZodTypeAny> = {}

    for (const field of fields) {
        shape[field.id] = buildFieldSchema(field)
    }

    return z.object(shape)
}

function buildFieldSchema(field: FormFieldConfig): z.ZodTypeAny {
    let schema: z.ZodTypeAny

    switch (field.type) {
        case 'text':
        case 'textarea': {
            let s: z.ZodType = z.string();
            const v = field.validation;
            if (v?.minLength) s = (s as z.ZodString).min(v.minLength);
            if (v?.maxLength) s = (s as z.ZodString).max(v.maxLength);
            if (field.required) s = (s as z.ZodString).min(1, `${field.label} is required`);
            else s = z.string().optional().default('');
            schema = s;
            break
        }

        case 'number': {
            let s = z.coerce.number()
            const v = field.validation
            if (v?.min !== undefined) s = s.min(v.min)
            if (v?.max !== undefined) s = s.max(v.max)
            if (!field.required)
                schema = z.coerce
                    .number()
                    .optional()
                    .or(z.literal('').transform(() => undefined))
            else schema = s
            break
        }

        case 'select':
        case 'radio': {
            const optionValues = (field.options ?? []).map((o) => o.value)
            if (optionValues.length > 0) {
                schema = field.required
                    ? z.enum(optionValues as [string, ...string[]])
                    : z
                          .enum(optionValues as [string, ...string[]])
                          .optional()
                          .default('')
            } else {
                schema = field.required
                    ? z.string().min(1, `${field.label} is required`)
                    : z.string().optional().default('')
            }
            break
        }

        case 'checkbox': {
            const optionValues = (field.options ?? []).map((o) => o.value)
            let s: z.ZodType = z.array(z.string())
            if (optionValues.length > 0) {
                s = z.array(z.enum(optionValues as [string, ...string[]]))
            }
            if (!field.required) schema = z.array(z.string()).optional().default([])
            else schema = s
            break
        }

        case 'date': {
            if (field.required) schema = z.string().min(1, `${field.label} is required`)
            else schema = z.string().optional().default('')
            break
        }

        case 'range': {
            const v = field.validation
            const low = v?.min !== undefined ? z.number().min(v.min) : z.number()
            const high = v?.max !== undefined ? z.number().max(v.max) : z.number()
            const s = z
                .tuple([low, high])
                .refine(
                    ([lo, hi]) => lo <= hi,
                    `${field.label}: lower bound must not exceed upper bound`,
                )
            if (!field.required)
                schema = z
                    .tuple([z.number(), z.number()])
                    .optional()
                    .refine(
                        (val) => val == null || val[0] <= val[1],
                        `${field.label}: lower bound must not exceed upper bound`,
                    )
            else schema = s
            break
        }

        default:
            schema = z.any()
    }

    return schema
}

export function generateDefaultValues(fields: FormFieldConfig[]): Record<string, unknown> {
    const defaults: Record<string, unknown> = {}

    for (const field of fields) {
        switch (field.type) {
            case 'text':
            case 'textarea':
            case 'select':
            case 'radio':
            case 'date':
                defaults[field.id] = ''
                break
            case 'number':
                defaults[field.id] = ''
                break
            case 'checkbox':
                defaults[field.id] = []
                break
            case 'range': {
                const DEFAULT_MAX = 100
                defaults[field.id] = [
                    field.validation?.min ?? 0,
                    field.validation?.max ?? DEFAULT_MAX,
                ]
                break
            }
            default:
                defaults[field.id] = undefined
        }
    }

    return defaults
}
