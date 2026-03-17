import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod/v4'
import { LoginPage } from '../../pages/auth/LoginPage'

const LoginSearchSchema = z.object({
    redirect: z.string('').default('').catch(''),
})

export const Route = createFileRoute('/auth/login')({
    component: LoginPage,
    validateSearch: zodValidator(LoginSearchSchema),
})
