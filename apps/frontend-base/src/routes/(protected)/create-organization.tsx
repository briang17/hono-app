import { CreateOrganizationPage } from '@/pages/CreateOrganizationPage'
import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod/v4'

const CreateOrganizationSearchSchema = z.object({
    redirect: z.string('').default('').catch(''),
})

export const Route = createFileRoute('/(protected)/create-organization')({
  component: CreateOrganizationPage,
  validateSearch: zodValidator(CreateOrganizationSearchSchema)
})
