import { queryOptions } from '@tanstack/react-query'
import { formConfigApi } from '@/lib/api/form-config.api'

export function useFormConfig() {
    return queryOptions({
        queryKey: ['form-config'],
        queryFn: () => formConfigApi.getFormConfig(),
    })
}
