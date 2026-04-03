import { queryOptions } from '@tanstack/react-query'
import { agentApi } from '@/lib/api/agent.api'

export function useAgents() {
    return queryOptions({
        queryKey: ['agents'],
        queryFn: () => agentApi.getAgents(),
        staleTime: 300000,
    })
}

export function useAgent(id: string) {
    return queryOptions({
        queryKey: ['agents', id],
        queryFn: () => agentApi.getAgent(id),
        enabled: !!id,
    })
}

export function useMyAgent() {
    return queryOptions({
        queryKey: ['my-agent'],
        queryFn: () => agentApi.getMyAgent(),
    })
}
