import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFormBuilderStore } from '@/lib/stores/form-builder-store'
import { BuilderCanvas } from './BuilderCanvas'
import { BuilderToolbar } from './BuilderToolbar'
import { FieldEditor } from './FieldEditor'

interface FormBuilderProps {
    onSave: () => void
    isSaving?: boolean
}

export function FormBuilder({ onSave, isSaving }: FormBuilderProps) {
    const fields = useFormBuilderStore((s) => s.fields)
    const isDirty = useFormBuilderStore((s) => s.isDirty)

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
                <BuilderToolbar />
                <BuilderCanvas />
            </div>

            <div className="space-y-4">
                <FieldEditor />
            </div>

            <div className="lg:col-span-2">
                <Button
                    onClick={onSave}
                    disabled={!isDirty || fields.length === 0 || isSaving}
                    className="w-full sm:w-auto"
                >
                    <Save className="size-4" />
                    {isSaving ? 'Saving...' : 'Save Form'}
                </Button>
            </div>
        </div>
    )
}
