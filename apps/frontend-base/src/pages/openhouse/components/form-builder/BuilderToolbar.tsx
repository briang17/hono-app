import {
    AlignLeft,
    Calendar,
    CheckSquare,
    ChevronDown,
    CircleDot,
    Hash,
    SlidersHorizontal,
    Type,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FieldType } from '@/lib/schemas/form-builder.schema'
import { useFormBuilderStore } from '@/lib/stores/form-builder-store'

const fieldTypes: { type: FieldType; label: string; icon: React.ReactNode }[] = [
    { type: 'text', label: 'Text', icon: <Type className="size-4" /> },
    { type: 'textarea', label: 'Textarea', icon: <AlignLeft className="size-4" /> },
    { type: 'number', label: 'Number', icon: <Hash className="size-4" /> },
    { type: 'select', label: 'Select', icon: <ChevronDown className="size-4" /> },
    { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="size-4" /> },
    { type: 'radio', label: 'Radio', icon: <CircleDot className="size-4" /> },
    { type: 'date', label: 'Date', icon: <Calendar className="size-4" /> },
    { type: 'range', label: 'Range', icon: <SlidersHorizontal className="size-4" /> },
]

export function BuilderToolbar() {
    const addField = useFormBuilderStore((s) => s.addField)

    return (
        <div className="flex flex-wrap gap-1.5">
            {fieldTypes.map(({ type, label, icon }) => (
                <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => addField(type)}
                    className="gap-1.5"
                >
                    {icon}
                    {label}
                </Button>
            ))}
        </div>
    )
}
