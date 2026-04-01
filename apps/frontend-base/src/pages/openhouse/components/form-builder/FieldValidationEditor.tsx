import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { FormFieldConfig } from '@/lib/schemas/form-builder.schema'
import { useFormBuilderStore } from '@/lib/stores/form-builder-store'

interface FieldValidationEditorProps {
    field: FormFieldConfig
}

export function FieldValidationEditor({ field }: FieldValidationEditorProps) {
    const updateField = useFormBuilderStore((s) => s.updateField)
    const validation = field.validation ?? {}

    function updateValidation(key: string, value: number | undefined) {
        updateField(field.id, {
            validation: { ...validation, [key]: value },
        })
    }

    const showMinLength = field.type === 'text' || field.type === 'textarea'
    const showMaxLength = field.type === 'text' || field.type === 'textarea'
    const showMin = field.type === 'number' || field.type === 'range'
    const showMax = field.type === 'number' || field.type === 'range'
    const showStep = field.type === 'range'

    return (
        <div className="space-y-2">
            <FieldLabel>Validation</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
                {showMinLength && (
                    <Field>
                        <FieldLabel htmlFor={`val-min-length-${field.id}`} className="text-xs">
                            Min Length
                        </FieldLabel>
                        <Input
                            id={`val-min-length-${field.id}`}
                            type="number"
                            value={validation.minLength ?? ''}
                            onChange={(e) =>
                                updateValidation(
                                    'minLength',
                                    e.target.value ? Number(e.target.value) : undefined,
                                )
                            }
                            placeholder="0"
                            min={0}
                        />
                    </Field>
                )}
                {showMaxLength && (
                    <Field>
                        <FieldLabel htmlFor={`val-max-length-${field.id}`} className="text-xs">
                            Max Length
                        </FieldLabel>
                        <Input
                            id={`val-max-length-${field.id}`}
                            type="number"
                            value={validation.maxLength ?? ''}
                            onChange={(e) =>
                                updateValidation(
                                    'maxLength',
                                    e.target.value ? Number(e.target.value) : undefined,
                                )
                            }
                            placeholder="∞"
                            min={0}
                        />
                    </Field>
                )}
                {showMin && (
                    <Field>
                        <FieldLabel htmlFor={`val-min-${field.id}`} className="text-xs">
                            Min
                        </FieldLabel>
                        <Input
                            id={`val-min-${field.id}`}
                            type="number"
                            value={validation.min ?? ''}
                            onChange={(e) =>
                                updateValidation(
                                    'min',
                                    e.target.value ? Number(e.target.value) : undefined,
                                )
                            }
                            placeholder="0"
                        />
                    </Field>
                )}
                {showMax && (
                    <Field>
                        <FieldLabel htmlFor={`val-max-${field.id}`} className="text-xs">
                            Max
                        </FieldLabel>
                        <Input
                            id={`val-max-${field.id}`}
                            type="number"
                            value={validation.max ?? ''}
                            onChange={(e) =>
                                updateValidation(
                                    'max',
                                    e.target.value ? Number(e.target.value) : undefined,
                                )
                            }
                            placeholder="100"
                        />
                    </Field>
                )}
                {showStep && (
                    <Field>
                        <FieldLabel htmlFor={`val-step-${field.id}`} className="text-xs">
                            Step
                        </FieldLabel>
                        <Input
                            id={`val-step-${field.id}`}
                            type="number"
                            value={field.step ?? ''}
                            onChange={(e) =>
                                updateField(field.id, {
                                    step: e.target.value ? Number(e.target.value) : undefined,
                                })
                            }
                            placeholder="1"
                            min={1}
                        />
                    </Field>
                )}
            </div>
        </div>
    )
}
