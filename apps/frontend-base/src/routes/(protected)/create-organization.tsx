import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod/v4'
import { CreateOrganizationPage } from '@/pages/CreateOrganizationPage'

const CreateOrganizationSearchSchema = z.object({
    redirect: z.string('').default('').catch(''),
})

export const Route = createFileRoute('/(protected)/create-organization')({
    component: CreateOrganizationPage,
    validateSearch: zodValidator(CreateOrganizationSearchSchema),
})
