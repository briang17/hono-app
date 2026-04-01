import { useSortable } from '@dnd-kit/react/sortable'
import {
    AlignLeft,
    Calendar,
    CheckSquare,
    ChevronDown,
    CircleDot,
    GripVertical,
    Hash,
    SlidersHorizontal,
    Trash2,
    Type,
} from 'lucide-react'
import type { FormFieldConfig } from '@/lib/schemas/form-builder.schema'
import { useFormBuilderStore } from '@/lib/stores/form-builder-store'
import { cn } from '@/lib/utils'

const typeIcons: Record<string, React.ReactNode> = {
    text: <Type className="size-4 text-muted-foreground" />,
    textarea: <AlignLeft className="size-4 text-muted-foreground" />,
    number: <Hash className="size-4 text-muted-foreground" />,
    select: <ChevronDown className="size-4 text-muted-foreground" />,
    checkbox: <CheckSquare className="size-4 text-muted-foreground" />,
    radio: <CircleDot className="size-4 text-muted-foreground" />,
    date: <Calendar className="size-4 text-muted-foreground" />,
    range: <SlidersHorizontal className="size-4 text-muted-foreground" />,
}

interface SortableFieldCardProps {
    id: string
    index: number
    field: FormFieldConfig
}

export function SortableFieldCard({ id, index, field }: SortableFieldCardProps) {
    const { ref, handleRef, isDragSource } = useSortable({ id, index })
    const selectedFieldId = useFormBuilderStore((s) => s.selectedFieldId)
    const selectField = useFormBuilderStore((s) => s.selectField)
    const removeField = useFormBuilderStore((s) => s.removeField)

    const isSelected = selectedFieldId === id

    return (
        <div
            ref={ref}
            onClick={() => selectField(id)}
            className={cn(
                'group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors cursor-pointer',
                isSelected
                    ? 'border-primary ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/40',
                isDragSource && 'opacity-50',
            )}
        >
            <button
                ref={handleRef}
                type="button"
                className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical className="size-4" />
            </button>

            <div className="flex items-center gap-2 shrink-0">
                {typeIcons[field.type]}
                <span className="text-xs font-medium text-muted-foreground uppercase">
                    {field.type}
                </span>
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{field.label}</p>
                {field.required && <span className="text-xs text-muted-foreground">Required</span>}
            </div>

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    removeField(id)
                }}
                className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
            >
                <Trash2 className="size-4" />
            </button>
        </div>
    )
}
