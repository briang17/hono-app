import type { AppType } from '@apps/api/src'
import { hc } from 'hono/client'

export const apiClient = hc<AppType>('https://api.rs.hauntednuke.com/', {
    init: {
        credentials: 'include',
    },
})
