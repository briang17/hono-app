import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createOpenHouseLeadSchema, type CreateOpenHouseLeadInput } from '@/lib/schemas/openhouse.schema'
import { isFieldInvalid } from '@/lib/utils'

interface CreateOpenHouseLeadFormProps {
    onSubmit: (values: { [key: string]: unknown }) => Promise<void>
    submitLabel: string
}

export function CreateOpenHouseLeadForm({ onSubmit, submitLabel }: CreateOpenHouseLeadFormProps) {
    const defaultOpenHouseLead: CreateOpenHouseLeadInput = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        workingWithAgent: false
    }
    
    const form = useForm({
        defaultValues: defaultOpenHouseLead,
        validators: {
            onSubmit: createOpenHouseLeadSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
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
                                        value={field.state.value}
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
                                        value={field.state.value}
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
                                    value={field.state.value || ''}
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
                                    value={field.state.value || ''}
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
                        <Field className="flex items-center gap-2">
                            <Checkbox
                                id={field.name}
                                checked={field.state.value}
                                onCheckedChange={(checked) => field.handleChange(checked === true)}
                            />
                            <label
                                htmlFor={field.name}
                                className="text-sm font-medium cursor-pointer"
                            >
                                Working with an agent?
                            </label>
                        </Field>
                    )}
                </form.Field>

                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                    {([canSubmit, isSubmitting]) => (
                        <Button
                            type="submit"
                            disabled={!canSubmit || isSubmitting}
                            className="w-full"
                        >
                            {isSubmitting ? 'Submitting...' : submitLabel}
                        </Button>
                    )}
                </form.Subscribe>
            </form>
    )
}
