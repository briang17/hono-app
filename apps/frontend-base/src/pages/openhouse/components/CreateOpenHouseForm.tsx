import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { DatePickerSimple } from '@/components/ui/datepicker-simple'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { type CreateOpenHouseInput, createOpenHouseSchema } from '@/lib/schemas/openhouse.schema'
import { isFieldInvalid } from '@/lib/utils'

interface CreateOpenHouseFormProps {
    onSubmit: (values: CreateOpenHouseInput) => Promise<void>
    submitLabel: string
}

export function CreateOpenHouseForm({ onSubmit, submitLabel }: CreateOpenHouseFormProps) {
    const defaultOpenHouse: CreateOpenHouseInput = {
        propertyAddress: '',
        listingPrice: 100000,
        date: new Date(),
        startTime: '12:00',
        endTime: '16:00',
        listingImageUrl: '',
        notes: '',
    }

    const form = useForm({
        defaultValues: defaultOpenHouse,
        validators: {
            onSubmit: createOpenHouseSchema,
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
            <form.Field name="propertyAddress">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Property Address</FieldLabel>
                            <Input
                                id={field.name}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-invalid={invalid}
                                placeholder="123 Main St"
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Field name="listingPrice">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Listing Price</FieldLabel>
                            <Input
                                id={field.name}
                                type="number"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                                onBlur={field.handleBlur}
                                aria-invalid={invalid}
                                placeholder="500000"
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="date">
                    {(field) => (
                        <Field>
                            <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                            <DatePickerSimple
                                value={field.state.value}
                                onSelect={field.handleChange}
                            />
                        </Field>
                    )}
                </form.Field>

                <form.Field name="startTime">
                    {(field) => {
                        const { invalid, errors } = isFieldInvalid(field)
                        return (
                            <Field data-invalid={invalid}>
                                <FieldLabel htmlFor={field.name}>Start Time</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="time"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    aria-invalid={invalid}
                                />
                                {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                            </Field>
                        )
                    }}
                </form.Field>
            </div>

            <form.Field name="endTime">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>End Time</FieldLabel>
                            <Input
                                id={field.name}
                                type="time"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-invalid={invalid}
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Field name="listingImageUrl">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>
                                Listing Image URL (optional)
                            </FieldLabel>
                            <Input
                                id={field.name}
                                type="url"
                                value={field.state.value || ''}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-invalid={invalid}
                                placeholder="https://example.com/image.jpg"
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Field name="notes">
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Notes (optional)</FieldLabel>
                            <Textarea
                                id={field.name}
                                value={field.state.value || ''}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-invalid={invalid}
                                placeholder="Any additional notes..."
                                rows={3}
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
