import { z } from 'zod/v4'
import type { authClient } from '@/lib/api/auth-client'

export const organizationSchema = z.object({
    id: z.uuid(),
    name: z.string().min(2, 'Organization name must be at least 2 characters'),
    slug: z
        .string()
        .min(2, 'Slug must be at least 2 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    createdAt: z.date(),
    logo: z.url('Invalid URL format').nullish(),
    logoPublicId: z.string().nullish(),
    smallLogo: z.string().nullish(),
    smallLogoPublicId: z.string().nullish(),
    metadata: z.any().optional(),
})

export const orgSchema = {
    create: organizationSchema.pick({
        name: true,
        slug: true,
        logo: true,
        logoPublicId: true,
        smallLogo: true,
        smallLogoPublicId: true,
    }),
}

export const createOrganizationSchema = organizationSchema.pick({
    name: true,
    slug: true,
    logo: true,
    logoPublicId: true,
    smallLogo: true,
    smallLogoPublicId: true,
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>

export type Organization = typeof authClient.$Infer.Organization
