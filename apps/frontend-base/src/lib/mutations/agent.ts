import { useMutation, useQueryClient } from '@tanstack/react-query'
import { agentApi } from '@/lib/api/agent.api'
import type {
    CreateAgentInput,
    UpdateAgentInput,
    UpdateMyAgentInput,
} from '@/lib/schemas/agent.schema'

export function useCreateAgent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateAgentInput) => agentApi.createAgent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] })
        },
        onError: (error) => {
            console.error('Failed to create agent:', error)
        },
    })
}

export function useUpdateAgent(id: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateAgentInput) => agentApi.updateAgent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] })
            queryClient.invalidateQueries({ queryKey: ['agents', id] })
        },
        onError: (error) => {
            console.error('Failed to update agent:', error)
        },
    })
}

export function useDeleteAgent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => agentApi.deleteAgent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] })
        },
        onError: (error) => {
            console.error('Failed to delete agent:', error)
        },
    })
}

export function useDeactivateAgent(id: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => agentApi.deactivateAgent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] })
            queryClient.invalidateQueries({ queryKey: ['agents', id] })
        },
        onError: (error) => {
            console.error('Failed to deactivate agent:', error)
        },
    })
}

export function useReactivateAgent(id: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => agentApi.reactivateAgent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] })
            queryClient.invalidateQueries({ queryKey: ['agents', id] })
        },
        onError: (error) => {
            console.error('Failed to reactivate agent:', error)
        },
    })
}

export function useUpdateMyAgent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateMyAgentInput) => agentApi.updateMyAgent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-agent'] })
        },
        onError: (error) => {
            console.error('Failed to update profile:', error)
        },
    })
}
