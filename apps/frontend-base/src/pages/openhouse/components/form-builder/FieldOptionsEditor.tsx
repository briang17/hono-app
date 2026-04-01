import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { FormFieldConfig, Option } from '@/lib/schemas/form-builder.schema'
import { useFormBuilderStore } from '@/lib/stores/form-builder-store'

interface FieldOptionsEditorProps {
    field: FormFieldConfig
}

function slugify(label: string): string {
    return label
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '_')
        .replace(/^_|_$/g, '')
}

function deriveValue(label: string, existingOptions: Option[]): string {
    const base = slugify(label) || 'option'
    let value = base
    let counter = 1
    while (existingOptions.some((o) => o.value === value)) {
        value = `${base}_${counter}`
        counter++
    }
    return value
}

export function FieldOptionsEditor({ field }: FieldOptionsEditorProps) {
    const updateField = useFormBuilderStore((s) => s.updateField)
    const options = field.options ?? []

    function addOption() {
        const nextIndex = options.length + 1
        const label = `Option ${nextIndex}`
        updateField(field.id, {
            options: [...options, { label, value: deriveValue(label, options) }],
        })
    }

    function updateLabel(index: number, label: string) {
        const newOptions = options.map((opt, i) =>
            i === index
                ? {
                      label,
                      value: deriveValue(
                          label,
                          options.filter((_, j) => j !== i),
                      ),
                  }
                : opt,
        )
        updateField(field.id, { options: newOptions })
    }

    function removeOption(index: number) {
        const newOptions = options.filter((_, i) => i !== index)
        updateField(field.id, { options: newOptions })
    }

    return (
        <div className="space-y-2">
            <FieldLabel>Options</FieldLabel>
            {options.map((option, index) => (
                <div key={option.value} className="flex items-center gap-2">
                    <Input
                        value={option.label}
                        onChange={(e) => updateLabel(index, e.target.value)}
                        placeholder="Option label"
                        className="flex-1"
                        aria-label={`Option ${index + 1}`}
                    />
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeOption(index)}
                        aria-label={`Remove option ${index + 1}`}
                    >
                        <X className="size-3" />
                    </Button>
                </div>
            ))}
            <Button variant="outline" size="sm" onClick={addOption} className="w-full">
                <Plus className="size-3" />
                Add Option
            </Button>
        </div>
    )
}
