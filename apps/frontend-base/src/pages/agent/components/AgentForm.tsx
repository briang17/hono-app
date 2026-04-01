import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { CreateAgentInput, UpdateAgentInput } from '@/lib/schemas/agent.schema'
import { createAgentSchema } from '@/lib/schemas/agent.schema'
import { isFieldInvalid } from '@/lib/utils'

type CreateAgentFormProps = {
    mode: 'create'
    defaultValues?: never
    mutationFn: (value: CreateAgentInput) => Promise<unknown>
    onSuccess: () => void
    submitLabel: string
}

type EditAgentFormProps = {
    mode: 'edit'
    defaultValues?: UpdateAgentInput
    mutationFn: (value: UpdateAgentInput) => Promise<unknown>
    onSuccess: () => void
    submitLabel: string
}

type AgentFormProps = CreateAgentFormProps | EditAgentFormProps

function FormSubmitError({ error }: { error: unknown }) {
    if (!error || error === undefined) return null
    if (typeof error === 'string') return <p className="text-sm text-destructive">{error}</p>
    if (typeof error === 'object' && error !== null) {
        if ('form' in error && typeof error.form === 'string')
            return <p className="text-sm text-destructive">{error.form}</p>
        const issues = Object.values(error).flat() as { message?: string }[]
        const first = issues[0]?.message
        if (first) return <p className="text-sm text-destructive">{first}</p>
    }
    return null
}

function CreateAgentForm({ mutationFn, onSuccess, submitLabel }: CreateAgentFormProps) {
    const form = useForm({
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            phone: '' as string | null,
            fubId: '' as string | null,
        } satisfies CreateAgentInput,
        validators: {
            onSubmit: createAgentSchema,
            onSubmitAsync: async ({ value }) => {
                await mutationFn(value)
            },
        },
        onSubmit: onSuccess,
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
                {(onSubmit) => (onSubmit ? <FormSubmitError error={onSubmit} /> : null)}
            </form.Subscribe>

            <form.Field name="email">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                            <Input
                                id={field.name}
                                type="email"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-invalid={invalid}
                                placeholder="agent@example.com"
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="firstName">
                    {(field) => {
                        const { invalid, errors } = isFieldInvalid(field)
                        return (
                            <Field data-invalid={invalid}>
                                <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="text"
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
                                    type="text"
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

            <form.Field name="phone">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Phone (optional)</FieldLabel>
                            <Input
                                id={field.name}
                                type="tel"
                                value={field.state.value ?? ''}
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

            <form.Field name="fubId">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>FollowUpBoss ID (optional)</FieldLabel>
                            <Input
                                id={field.name}
                                type="text"
                                value={field.state.value ?? ''}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-invalid={invalid}
                                placeholder="12345"
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || isSubmitting} className="w-full">
                        {isSubmitting ? 'Saving...' : submitLabel}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    )
}

function EditAgentForm({ defaultValues, mutationFn, onSuccess, submitLabel }: EditAgentFormProps) {
    const form = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: null as string | null,
            fubId: null as string | null,
            ...defaultValues,
        },
        validators: {
            onSubmit: createAgentSchema.omit({ email: true }),
            onSubmitAsync: async ({ value }) => {
                await mutationFn(value)
            },
        },
        onSubmit: onSuccess,
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
                {(onSubmit) => (onSubmit ? <FormSubmitError error={onSubmit} /> : null)}
            </form.Subscribe>

            <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="firstName">
                    {(field) => {
                        const { invalid, errors } = isFieldInvalid(field)
                        return (
                            <Field data-invalid={invalid}>
                                <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="text"
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
                                    type="text"
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

            <form.Field name="phone">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Phone (optional)</FieldLabel>
                            <Input
                                id={field.name}
                                type="tel"
                                value={field.state.value ?? ''}
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

            <form.Field name="fubId">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>FollowUpBoss ID (optional)</FieldLabel>
                            <Input
                                id={field.name}
                                type="text"
                                value={field.state.value ?? ''}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-invalid={invalid}
                                placeholder="12345"
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || isSubmitting} className="w-full">
                        {isSubmitting ? 'Saving...' : submitLabel}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    )
}

export function AgentForm(props: AgentFormProps) {
    if (props.mode === 'create') {
        return <CreateAgentForm {...props} />
    }
    return <EditAgentForm {...props} />
}
