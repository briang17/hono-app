import { DragDropProvider } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import { useFormBuilderStore } from '@/lib/stores/form-builder-store'
import { SortableFieldCard } from './SortableFieldCard'

export function BuilderCanvas() {
    const fields = useFormBuilderStore((s) => s.fields)
    const reorderFields = useFormBuilderStore((s) => s.reorderFields)

    return (
        <DragDropProvider
            onDragEnd={(event) => {
                if (event.canceled) return

                const { source } = event.operation
                if (isSortable(source)) {
                    if (source.initialIndex !== source.index) {
                        reorderFields(source.initialIndex, source.index)
                    }
                }
            }}
        >
            <div className="space-y-2">
                {fields.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-muted-foreground">
                        <p className="text-sm">No fields yet</p>
                        <p className="text-xs">Click a field type above to add questions</p>
                    </div>
                )}
                {fields.map((field, index) => (
                    <SortableFieldCard key={field.id} id={field.id} index={index} field={field} />
                ))}
            </div>
        </DragDropProvider>
    )
}
