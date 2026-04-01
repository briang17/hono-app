import { z } from 'zod/v4'
import {
    agentSchema,
    agentWithUserSchema,
    type CreateAgentInput,
    type UpdateAgentInput,
} from '@/lib/schemas/agent.schema'
import { apiClient } from './client'

export const agentApi = {
    getAgents: async () => {
        const res = await apiClient.api.agents.$get()
        if (!res.ok) {
            throw new Error('Failed to fetch agents')
        }
        const data = await res.json()
        return z.array(agentWithUserSchema).parse(data.data)
    },

    getAgent: async (id: string) => {
        const res = await apiClient.api.agents[':id'].$get({ param: { id } })
        if (!res.ok) {
            throw new Error('Failed to fetch agent')
        }
        const data = await res.json()
        return agentSchema.parse(data.data)
    },

    createAgent: async (data: CreateAgentInput) => {
        const res = await apiClient.api.agents.$post({ json: data })
        if (!res.ok) {
            throw new Error('Failed to create agent')
        }
        const resData = await res.json()
        return agentSchema.parse(resData.data)
    },

    updateAgent: async (id: string, data: UpdateAgentInput) => {
        const res = await apiClient.api.agents[':id'].$patch({ param: { id }, json: data })
        if (!res.ok) {
            throw new Error('Failed to update agent')
        }
        const resData = await res.json()
        return agentSchema.parse(resData.data)
    },

    deleteAgent: async (id: string) => {
        const res = await apiClient.api.agents[':id'].$delete({ param: { id } })
        if (!res.ok) {
            throw new Error('Failed to delete agent')
        }
    },

    deactivateAgent: async (id: string) => {
        const res = await apiClient.api.agents[':id'].deactivate.$post({ param: { id } })
        if (!res.ok) {
            throw new Error('Failed to deactivate agent')
        }
        const data = await res.json()
        return agentSchema.parse(data.data)
    },

    reactivateAgent: async (id: string) => {
        const res = await apiClient.api.agents[':id'].reactivate.$post({ param: { id } })
        if (!res.ok) {
            throw new Error('Failed to reactivate agent')
        }
        const data = await res.json()
        return agentSchema.parse(data.data)
    },
}
