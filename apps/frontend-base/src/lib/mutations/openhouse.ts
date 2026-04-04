import { useMutation, useQueryClient } from '@tanstack/react-query'
import { openhouseApi } from '@/lib/api/openhouse.api'
import type {
    CreateOpenHouseInput,
    CreateOpenHouseLeadInput,
    UpdateOpenHouseInput,
} from '@/lib/schemas/openhouse.schema'

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

export function useUpdateOpenHouse(openHouseId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateOpenHouseInput) => openhouseApi.updateOpenHouse(openHouseId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['openhouses'] })
            queryClient.invalidateQueries({ queryKey: ['openhouses', openHouseId] })
        },
        onError: (error) => {
            console.error('Failed to update open house:', error)
        },
    })
}

export function useDeleteOpenHouse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => openhouseApi.deleteOpenHouse(id),
        onSuccess: () => {
           queryClient.invalidateQueries({ queryKey: ['openhouses'], exact: true })
        },
        onError: (error) => {
            console.error('Failed to delete open house:', error)
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
