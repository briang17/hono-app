import { apiClient } from './client'

export interface CloudinaryConfig {
    cloudName: string
    apiKey: string
    folder: string
    agentHeadshotsFolder: string
}

export interface SignatureResponse {
    signature: string
    timestamp: number
    apiKey: string
}

export const cloudinaryApi = {
    getConfig: async (): Promise<CloudinaryConfig> => {
        const res = await apiClient.api.cloudinary.config.$get()
        if (!res.ok) {
            throw new Error('Failed to get cloudinary config')
        }
        const data = await res.json()
        return data.data
    },
    getSignature: async (paramsToSign: Record<string, unknown>): Promise<SignatureResponse> => {
        const res = await apiClient.api.cloudinary.signature.$post({
            json: paramsToSign,
        })
        if (!res.ok) {
            throw new Error('Failed to get upload signature')
        }
        const data = await res.json()
        return data.data
    },
}
