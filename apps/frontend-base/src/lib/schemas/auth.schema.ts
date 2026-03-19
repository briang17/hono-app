import { z } from 'zod/v4'
import type { authClient } from '@/lib/api/auth-client'

export const authSchema = {
    signIn: z.object({
        email: z.email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
    }),

    signUp: z
        .object({
            name: z.string().min(2, 'Name must be at least 2 characters'),
            email: z.email('Invalid email address'),
            password: z.string().min(8, 'Password must be at least 8 characters'),
            confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords don't match",
            path: ['confirmPassword'],
        }),
}

export type User = typeof authClient.$Infer.Session.user
export type Session = typeof authClient.$Infer.Session.session
export type SignInInput = z.infer<typeof authSchema.signIn>
export type SignUpInput = z.infer<typeof authSchema.signUp>
