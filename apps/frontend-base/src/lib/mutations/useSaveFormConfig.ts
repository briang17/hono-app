import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formConfigApi } from '@/lib/api/form-config.api'
import type { SaveFormConfigInput } from '@/lib/schemas/form-builder.schema'
import { useFormBuilderStore } from '@/lib/stores/form-builder-store'

export function useSaveFormConfig() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ existingId }: { existingId?: string }) => {
            const { fields } = useFormBuilderStore.getState()
            const data: SaveFormConfigInput = { questions: fields }
            if (existingId) {
                return await formConfigApi.updateFormConfig(existingId, data)
            }
            return await formConfigApi.createFormConfig(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['form-config'] })
            useFormBuilderStore.getState().markSaved()
        },
        onError: (error) => {
            console.error('Failed to save form config:', error)
        },
    })
}
