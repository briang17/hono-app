import { useMutation, useQueryClient } from '@tanstack/react-query'
import { openhouseApi } from '@/lib/api/openhouse.api'
import type { CreateOpenHouseInput, CreateOpenHouseLeadInput } from '@/lib/schemas/openhouse.schema'

export function useCreateOpenHouse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateOpenHouseInput) => openhouseApi.createOpenHouse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['openhouses'] })
        },
        onError: (error) => {
            console.error('Failed to create open house:', error)
        },
    })
}

export function useCreateOpenHouseLead(openHouseId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateOpenHouseLeadInput) =>
            openhouseApi.createOpenHouseLead(openHouseId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['openhouses', openHouseId, 'leads'] })
        },
        onError: (error) => {
            console.error('Failed to create lead:', error)
        },
    })
}
