import type {
    CreateOpenHouseInput,
    CreateOpenHouseLeadInput,
    UpdateOpenHouseInput,
} from '../schemas/openhouse.schema'
import { teamOpenHouseSchema } from '../schemas/openhouse.schema'
import {z} from 'zod/v4';
import { apiClient } from './client'

export const openhouseApi = {
    getOpenHouses: async () => {
        const res = await apiClient.api['open-houses'].$get()
        if (!res.ok) {
            throw new Error('Failed to fetch open houses')
        }
        const data = await res.json()
        return data.data
    },

    getTeamOpenHouses: async () => {
        const res = await apiClient.api['open-houses'].team.$get()
        if (!res.ok) {
            throw new Error('Failed to fetch team open houses')
        }
        const data = await res.json()
        return z.array(teamOpenHouseSchema).parse(data.data);
    },

    getOpenHouse: async (id: string) => {
        const res = await apiClient.api['open-houses'][':id'].$get({ param: { id } })
        if (!res.ok) {
            throw new Error('Failed to fetch open house')
        }
        const data = await res.json()
        return data.data
    },

    createOpenHouse: async (data: CreateOpenHouseInput) => {
        const res = await apiClient.api['open-houses'].$post({ json: data })
        if (!res.ok) {
            throw new Error('Failed to create open house')
        }
        const resData = await res.json()
        return resData.data
    },

    updateOpenHouse: async (id: string, data: UpdateOpenHouseInput) => {
        const res = await apiClient.api['open-houses'][':id'].$put({
            param: { id },
            json: data,
        })
        if (!res.ok) {
            throw new Error('Failed to update open house')
        }
        const resData = await res.json()
        return resData.data
    },

    deleteOpenHouse: async (id: string) => {
        const res = await apiClient.api['open-houses'][':id'].$delete({
            param: { id },
        })
        if (!res.ok) {
            throw new Error('Failed to delete open house')
        }
        const resData = await res.json()
        return resData.data
    },

    getOpenHouseLeads: async (id: string) => {
        const res = await apiClient.api['open-houses'][':id'].leads.$get({ param: { id } })
        if (!res.ok) {
            throw new Error('Failed to fetch leads')
        }
        const data = await res.json()
        return data.data
    },

    getPublicOpenHouse: async (id: string) => {
        const res = await apiClient.api.public['open-houses'][':id'].$get({ param: { id } })
        if (!res.ok) {
            throw new Error('Failed to fetch public open house')
        }
        const data = await res.json()
        return data.data
    },

    createOpenHouseLead: async (id: string, data: CreateOpenHouseLeadInput) => {
        const res = await apiClient.api.public['open-houses'][':id']['sign-in'].$post({
            param: { id },
            json: data,
        })
        if (!res.ok) {
            throw new Error('Failed to create lead')
        }
        const resData = await res.json()
        return resData.data
    },
}
