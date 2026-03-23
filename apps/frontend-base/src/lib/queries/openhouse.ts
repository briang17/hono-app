import { queryOptions } from '@tanstack/react-query'
import { openhouseApi } from '@/lib/api/openhouse.api'

export function useOpenHouses() {
    return queryOptions({
        queryKey: ['openhouses'],
        queryFn: () => openhouseApi.getOpenHouses(),
        staleTime: 300000,
    })
}

export function useOpenHouse(id: string) {
    return queryOptions({
        queryKey: ['openhouses', id],
        queryFn: () => openhouseApi.getOpenHouse(id),
        enabled: !!id,
    })
}

export function useOpenHouseLeads(openHouseId: string) {
    return queryOptions({
        queryKey: ['openhouses', openHouseId, 'leads'],
        queryFn: () => openhouseApi.getOpenHouseLeads(openHouseId),
        enabled: !!openHouseId,
    })
}

export function usePublicOpenHouse(id: string) {
    return queryOptions({
        queryKey: ['public', 'openhouses', id],
        queryFn: () => openhouseApi.getPublicOpenHouse(id),
        enabled: !!id,
    })
}
