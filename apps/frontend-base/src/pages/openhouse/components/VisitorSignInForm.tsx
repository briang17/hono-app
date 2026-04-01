import { useForm } from '@tanstack/react-form'
import { Info } from 'lucide-react'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Item, ItemContent, ItemDescription, ItemMedia } from '@/components/ui/item'
import { generateDefaultValues, generateFormSchema } from '@/lib/schema-generator'
import type { FormFieldConfig } from '@/lib/schemas/form-builder.schema'
import { isFieldInvalid } from '@/lib/utils'
import { FieldRenderer } from './FieldRenderer'

interface VisitorSignInFormProps {
    customFields: FormFieldConfig[]
    onSubmit: (values: {
        firstName: string
        lastName: string
        email: string | null
        phone: string | null
        workingWithAgent: boolean
        responses?: Record<string, unknown>
    }) => Promise<void>
}

function buildCombinedSchema(customFields: FormFieldConfig[]) {
    const coreSchema = z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.union([z.email(), z.literal('')]),
        phone: z.union([z.string().min(1), z.literal('')]),
        workingWithAgent: z.boolean().default(false),
    })

    const dynamicSchema = customFields.length > 0 ? generateFormSchema(customFields) : z.object({})

    return coreSchema.merge(dynamicSchema).refine((data) => data.email || data.phone, {
        message: 'Either email or phone is required',
        path: ['email'],
    })
}

export function VisitorSignInForm({ customFields, onSubmit }: VisitorSignInFormProps) {
    const hasCustomFields = customFields.length > 0
    const dynamicDefaults = hasCustomFields ? generateDefaultValues(customFields) : {}
    const combinedSchema = buildCombinedSchema(customFields)

    const form = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            workingWithAgent: false,
            ...dynamicDefaults,
        } as Record<string, unknown>,
        validators: {
            onSubmit: combinedSchema,
        },
        onSubmit: async ({ value }) => {
            const coreFields = {
                firstName: value.firstName as string,
                lastName: value.lastName as string,
                email: (value.email as string) || null,
                phone: (value.phone as string) || null,
                workingWithAgent: value.workingWithAgent as boolean,
            }

            const responses: Record<string, unknown> = {}
            for (const field of customFields) {
                if (value[field.id] !== undefined && value[field.id] !== '') {
                    responses[field.id] = value[field.id]
                }
            }

            await onSubmit({
                ...coreFields,
                ...(Object.keys(responses).length > 0 ? { responses } : {}),
            })
            form.reset()
        },
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="firstName">
                    {(field) => {
                        const { invalid, errors } = isFieldInvalid(field)
                        return (
                            <Field data-invalid={invalid}>
                                <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                                <Input
                                    id={field.name}
                                    value={field.state.value as string}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    aria-invalid={invalid}
                                    placeholder="John"
                                />
                                {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                            </Field>
                        )
                    }}
                </form.Field>

                <form.Field name="lastName">
                    {(field) => {
                        const { invalid, errors } = isFieldInvalid(field)
                        return (
                            <Field data-invalid={invalid}>
                                <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                                <Input
                                    id={field.name}
                                    value={field.state.value as string}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    aria-invalid={invalid}
                                    placeholder="Doe"
                                />
                                {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                            </Field>
                        )
                    }}
                </form.Field>
            </div>

            <form.Field name="email">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                            <Input
                                id={field.name}
                                type="email"
                                value={(field.state.value as string) ?? ''}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-invalid={invalid}
                                placeholder="john@example.com"
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Field name="phone">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                            <Input
                                id={field.name}
                                type="tel"
                                value={(field.state.value as string) ?? ''}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-invalid={invalid}
                                placeholder="(555) 123-4567"
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Field name="workingWithAgent">
                {(field) => (
                    <Field className="flex items-center gap-2" orientation="horizontal">
                        <Checkbox
                            id={field.name}
                            checked={field.state.value as boolean}
                            onCheckedChange={(checked) => field.handleChange(checked === true)}
                        />
                        <label htmlFor={field.name} className="text-sm font-medium cursor-pointer">
                            Working with an agent?
                        </label>
                    </Field>
                )}
            </form.Field>

            {hasCustomFields && (
                <>
                    <div className="pt-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            Additional Questions
                        </p>
                    </div>
                    {customFields.map((fieldConfig) => (
                        <form.Field key={fieldConfig.id} name={fieldConfig.id}>
                            {(field) => {
                                const { invalid, errors } = isFieldInvalid(field)
                                return (
                                    <Field data-invalid={invalid}>
                                        <FieldLabel htmlFor={fieldConfig.id}>
                                            {fieldConfig.label}
                                            {fieldConfig.required && (
                                                <span className="text-destructive ml-1">*</span>
                                            )}
                                        </FieldLabel>
                                        <FieldRenderer field={fieldConfig} formField={field} />
                                        {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                                    </Field>
                                )
                            }}
                        </form.Field>
                    ))}
                </>
            )}

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                    <Button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                        className="w-full bg-re-gold hover:bg-re-gold-hover text-re-gold-foreground"
                    >
                        {isSubmitting ? 'Submitting...' : 'Sign In'}
                    </Button>
                )}
            </form.Subscribe>
            <Item size={'xs'}>
                <ItemMedia>
                    <Info strokeWidth={1.5} className="text-re-gold" />
                </ItemMedia>
                <ItemContent>
                    <ItemDescription className="text-re-gold-foreground/80 whitespace-normal line-clamp-none">
                        By clicking Sign In, you consent to receive calls, texts, and emails from
                        ANEW Collective at LPT Realty about real estate matters. This includes
                        marketing by autodialer and prerecorded voice. Msg/data rates may apply.
                        Your consent is not a condition of any purchase and applies even if you are
                        on a corporate, state, or national Do Not Call list.
                    </ItemDescription>
                </ItemContent>
            </Item>
        </form>
    )
}
