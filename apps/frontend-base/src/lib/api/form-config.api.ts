import type { SaveFormConfigInput } from '@/lib/schemas/form-builder.schema'
import { apiClient } from './client'

export const formConfigApi = {
    getFormConfig: async () => {
        const res = await apiClient.api['form-config'].$get()
        if (!res.ok) {
            throw new Error('Failed to fetch form config')
        }
        const data = await res.json()
        return data.data
    },

    createFormConfig: async (data: SaveFormConfigInput) => {
        const res = await apiClient.api['form-config'].$post({ json: data })
        if (!res.ok) {
            throw new Error('Failed to create form config')
        }
        const resData = await res.json()
        return resData.data
    },

    updateFormConfig: async (id: string, data: SaveFormConfigInput) => {
        const res = await apiClient.api['form-config'][':id'].$put({
            param: { id },
            json: data,
        })
        if (!res.ok) {
            throw new Error('Failed to update form config')
        }
        const resData = await res.json()
        return resData.data
    },
}
