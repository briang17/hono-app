import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useFormBuilderStore } from '@/lib/stores/form-builder-store'
import { FieldOptionsEditor } from './FieldOptionsEditor'
import { FieldValidationEditor } from './FieldValidationEditor'

export function FieldEditor() {
    const fields = useFormBuilderStore((s) => s.fields)
    const selectedFieldId = useFormBuilderStore((s) => s.selectedFieldId)
    const updateField = useFormBuilderStore((s) => s.updateField)
    const removeField = useFormBuilderStore((s) => s.removeField)
    const selectField = useFormBuilderStore((s) => s.selectField)

    const field = fields.find((f) => f.id === selectedFieldId)

    if (!field) {
        return (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-12 text-muted-foreground">
                <p className="text-sm">Select a field to edit</p>
            </div>
        )
    }

    const hasOptions =
        field.type === 'select' || field.type === 'checkbox' || field.type === 'radio'
    const hasValidation =
        field.type === 'text' ||
        field.type === 'textarea' ||
        field.type === 'number' ||
        field.type === 'range'

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <FieldTitle>Edit {field.type} field</FieldTitle>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                        removeField(field.id)
                        selectField(null)
                    }}
                >
                    <Trash2 className="size-4 text-destructive" />
                </Button>
            </div>

            <Field>
                <FieldLabel htmlFor={`field-label-${field.id}`}>Label</FieldLabel>
                <Input
                    id={`field-label-${field.id}`}
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    placeholder="Question label"
                />
            </Field>

            {(field.type === 'text' || field.type === 'textarea' || field.type === 'number') && (
                <Field>
                    <FieldLabel htmlFor={`field-placeholder-${field.id}`}>Placeholder</FieldLabel>
                    <Input
                        id={`field-placeholder-${field.id}`}
                        value={field.placeholder ?? ''}
                        onChange={(e) =>
                            updateField(field.id, { placeholder: e.target.value || undefined })
                        }
                        placeholder="Placeholder text"
                    />
                </Field>
            )}

            <Field className="flex items-center gap-2" orientation="horizontal">
                <Checkbox
                    id={`field-required-${field.id}`}
                    checked={field.required}
                    onCheckedChange={(checked) =>
                        updateField(field.id, { required: checked === true })
                    }
                />
                <label
                    htmlFor={`field-required-${field.id}`}
                    className="text-sm font-medium cursor-pointer"
                >
                    Required
                </label>
            </Field>

            {hasOptions && <FieldOptionsEditor field={field} />}
            {hasValidation && <FieldValidationEditor field={field} />}
        </div>
    )
}
