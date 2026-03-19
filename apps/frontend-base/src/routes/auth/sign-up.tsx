import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod/v4'
import { SignUpPage } from '../../pages/auth/SignUpPage'

const SignUpSearchSchema = z.object({
    redirect: z.string('').default('').catch(''),
})

export const Route = createFileRoute('/auth/sign-up')({
    component: SignUpPage,
    validateSearch: zodValidator(SignUpSearchSchema),
})
