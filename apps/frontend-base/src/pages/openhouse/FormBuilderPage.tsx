import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useSaveFormConfig } from '@/lib/mutations/useSaveFormConfig'
import { useFormConfig } from '@/lib/queries/useFormConfig'
import { useFormBuilderStore } from '@/lib/stores/form-builder-store'
import { FormBuilder } from '@/pages/openhouse/components/form-builder/FormBuilder'

export function FormBuilderPage() {
    const { data: formConfig } = useQuery({
        ...useFormConfig(),
        retry: false,
    })
    const saveMutation = useSaveFormConfig()
    const setFields = useFormBuilderStore((s) => s.setFields)
    const reset = useFormBuilderStore((s) => s.reset)

    useEffect(() => {
        if (formConfig?.questions) {
            setFields(formConfig.questions)
        }
        return () => reset()
    }, [formConfig, setFields, reset])

    function handleSave() {
        saveMutation.mutate({ existingId: formConfig?.id })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Form Builder</h1>
                <p className="text-muted-foreground">
                    Design the visitor sign-in form for your open houses.
                </p>
            </div>
            <FormBuilder onSave={handleSave} isSaving={saveMutation.isPending} />
        </div>
    )
}
