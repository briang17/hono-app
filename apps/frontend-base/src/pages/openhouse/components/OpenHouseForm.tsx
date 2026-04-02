import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { DatePickerSimple } from '@/components/ui/datepicker-simple'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    createOpenHouseSchema,
    type UpdateOpenHouseInput,
    updateOpenHouseSchema,
} from '@/lib/schemas/openhouse.schema'
import { isFieldInvalid } from '@/lib/utils'
import { FeaturesInput } from './FeaturesInput'
import { ImageUploadWidget } from './ImageUploadWidget'

interface OpenHouseFormProps {
    mutationFn: (values: Record<string, unknown>) => Promise<unknown>
    onSuccess: () => void
    submitLabel: string
    initialValues?: UpdateOpenHouseInput
}

const defaultValues: UpdateOpenHouseInput = {
    propertyAddress: '',
    listingPrice: 100000,
    bedrooms: null,
    bathrooms: null,
    features: [],
    date: new Date(),
    startTime: '12:00',
    endTime: '16:00',
    images: [],
    notes: '',
}

export function OpenHouseForm({
    mutationFn,
    onSuccess,
    submitLabel,
    initialValues,
}: OpenHouseFormProps) {
    const isEdit = !!initialValues

    const form = useForm({
        defaultValues: isEdit ? { ...defaultValues, ...initialValues } : defaultValues,
        validators: {
            onSubmit: isEdit ? updateOpenHouseSchema : createOpenHouseSchema,
            onSubmitAsync: async ({ value }) => {
                await mutationFn(value as Record<string, unknown>)
            },
        },
        onSubmit: () => {
            if (!isEdit) form.reset()
            onSuccess()
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
            <form.Subscribe selector={(state) => state.errorMap}>
                {(errorMap) =>
                    errorMap.onSubmit ? (
                        <div className="p-2 text-sm text-destructive bg-destructive/10 rounded">
                            {errorMap.onSubmit.toString()}
                        </div>
                    ) : null
                }
            </form.Subscribe>

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
                <form.Field name="bedrooms">
                    {(field) => {
                        const { invalid, errors } = isFieldInvalid(field)
                        return (
                            <Field data-invalid={invalid}>
                                <FieldLabel htmlFor={field.name}>Bedrooms (optional)</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="number"
                                    value={field.state.value ?? ''}
                                    onChange={(e) =>
                                        field.handleChange(
                                            e.target.value === '' ? null : Number(e.target.value),
                                        )
                                    }
                                    onBlur={field.handleBlur}
                                    aria-invalid={invalid}
                                    placeholder="3"
                                    min={1}
                                />
                                {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                            </Field>
                        )
                    }}
                </form.Field>

                <form.Field name="bathrooms">
                    {(field) => {
                        const { invalid, errors } = isFieldInvalid(field)
                        return (
                            <Field data-invalid={invalid}>
                                <FieldLabel htmlFor={field.name}>Bathrooms (optional)</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="number"
                                    value={field.state.value ?? ''}
                                    onChange={(e) =>
                                        field.handleChange(
                                            e.target.value === '' ? null : Number(e.target.value),
                                        )
                                    }
                                    onBlur={field.handleBlur}
                                    aria-invalid={invalid}
                                    placeholder="2.5"
                                    min={0.5}
                                    step={0.5}
                                />
                                {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                            </Field>
                        )
                    }}
                </form.Field>
            </div>

            <form.Field name="features">
                {(field) => (
                    <Field>
                        <FieldLabel>Features (optional)</FieldLabel>
                        <FeaturesInput value={field.state.value} onChange={field.handleChange} />
                    </Field>
                )}
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

            <form.Field name="images">
                {(field) => (
                    <ImageUploadWidget images={field.state.value} onChange={field.handleChange} />
                )}
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

            <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : submitLabel}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    )
}
