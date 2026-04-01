import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { generateDefaultValues, generateFormSchema } from '@/lib/schema-generator'
import type { FormFieldConfig } from '@/lib/schemas/form-builder.schema'
import { isFieldInvalid } from '@/lib/utils'
import { FieldRenderer } from './FieldRenderer'

interface DynamicFormProps {
    fields: FormFieldConfig[]
    onSubmit: (responses: Record<string, unknown>) => Promise<void>
    submitLabel?: string
}

export function DynamicForm({ fields, onSubmit, submitLabel = 'Submit' }: DynamicFormProps) {
    const schema = generateFormSchema(fields)
    const defaultValues = generateDefaultValues(fields)

    const form = useForm({
        defaultValues: defaultValues as Record<string, unknown>,
        validators: {
            onSubmit: schema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value as Record<string, unknown>)
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
            {fields.map((field) => (
                <form.Field key={field.id} name={field.id}>
                    {(formField) => {
                        const { invalid, errors } = isFieldInvalid(formField)
                        return (
                            <Field data-invalid={invalid}>
                                <FieldLabel htmlFor={field.id}>
                                    {field.label}
                                    {field.required && (
                                        <span className="text-destructive ml-1">*</span>
                                    )}
                                </FieldLabel>
                                <FieldRenderer field={field} formField={formField} />
                                {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                            </Field>
                        )
                    }}
                </form.Field>
            ))}

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                    <Button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                        className="w-full bg-re-gold hover:bg-re-gold-hover text-re-gold-foreground"
                    >
                        {isSubmitting ? 'Submitting...' : submitLabel}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    )
}
