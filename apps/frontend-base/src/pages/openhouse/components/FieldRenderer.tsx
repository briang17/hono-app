import type { AnyFieldApi } from '@tanstack/react-form'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePickerSimple } from '@/components/ui/datepicker-simple'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import type { FormFieldConfig } from '@/lib/schemas/form-builder.schema'

interface FieldRendererProps {
    field: FormFieldConfig
    formField: AnyFieldApi
}

export function FieldRenderer({ field, formField }: FieldRendererProps) {
    const value = formField.state.value
    const onChange = formField.handleChange

    switch (field.type) {
        case 'text':
            return (
                <Input
                    id={field.id}
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={formField.handleBlur}
                    placeholder={field.placeholder}
                />
            )

        case 'textarea':
            return (
                <Textarea
                    id={field.id}
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={formField.handleBlur}
                    placeholder={field.placeholder}
                    rows={3}
                />
            )

        case 'number':
            return (
                <Input
                    id={field.id}
                    type="number"
                    value={value ?? ''}
                    onChange={(e) => {
                        const val = e.target.value
                        onChange(val === '' ? val : Number(val))
                    }}
                    onBlur={formField.handleBlur}
                    placeholder={field.placeholder}
                    min={field.validation?.min}
                    max={field.validation?.max}
                />
            )

        case 'select':
            return (
                <Select value={value ?? ''} onValueChange={(v) => onChange(v)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                        {(field.options ?? []).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )

        case 'checkbox':
            return (
                <div className="space-y-2">
                    {(field.options ?? []).map((option) => {
                        const checked =
                            (value as string[] | undefined)?.includes(option.value) ?? false
                        return (
                            <div key={option.value} className="flex items-center gap-2">
                                <Checkbox
                                    id={`${field.id}-${option.value}`}
                                    checked={checked}
                                    onCheckedChange={(isChecked) => {
                                        const current = (value as string[] | undefined) ?? []
                                        if (isChecked) {
                                            onChange([...current, option.value])
                                        } else {
                                            onChange(current.filter((v) => v !== option.value))
                                        }
                                    }}
                                />
                                <label
                                    htmlFor={`${field.id}-${option.value}`}
                                    className="text-sm font-medium cursor-pointer"
                                >
                                    {option.label}
                                </label>
                            </div>
                        )
                    })}
                </div>
            )

        case 'radio':
            return (
                <RadioGroup value={value ?? ''} onValueChange={(v) => onChange(v)}>
                    {(field.options ?? []).map((option) => (
                        <div key={option.value} className="flex items-center gap-2">
                            <RadioGroupItem
                                value={option.value}
                                id={`${field.id}-${option.value}`}
                            />
                            <label
                                htmlFor={`${field.id}-${option.value}`}
                                className="text-sm font-medium cursor-pointer"
                            >
                                {option.label}
                            </label>
                        </div>
                    ))}
                </RadioGroup>
            )

        case 'date':
            return (
                <DatePickerSimple
                    value={value ? new Date(value) : undefined}
                    onSelect={(date: Date | undefined) => {
                        onChange(date ? date.toISOString() : '')
                    }}
                />
            )

        case 'range': {
            const DEFAULT_RANGE_MIN = 0
            const DEFAULT_RANGE_MAX = 100
            const DEFAULT_RANGE_STEP = 1
            const min = field.validation?.min ?? DEFAULT_RANGE_MIN
            const max = field.validation?.max ?? DEFAULT_RANGE_MAX
            const step = field.step ?? DEFAULT_RANGE_STEP
            const rangeValue = Array.isArray(value) ? value : [min, max]
            const clamped = [
                Math.max(min, Math.min(rangeValue[0] ?? min, max)),
                Math.max(min, Math.min(rangeValue[1] ?? max, max)),
            ] as [number, number]
            return (
                <div className="space-y-2">
                    <Slider
                        value={clamped}
                        onValueChange={(v) => onChange(v)}
                        min={min}
                        max={max}
                        step={step}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{min}</span>
                        <span>
                            {clamped[0]} — {clamped[1]}
                        </span>
                        <span>{max}</span>
                    </div>
                </div>
            )
        }
    }
}
