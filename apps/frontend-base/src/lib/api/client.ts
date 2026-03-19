import type { AppType } from '@apps/api/src'
import { hc } from 'hono/client'

const apiClient = hc<AppType>('https://api.rs.hauntednuke.com/')
