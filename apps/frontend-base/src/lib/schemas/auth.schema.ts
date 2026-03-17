import { z } from 'zod/v4'

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

export const userSchema = z.object({
    id: z.string(),
    email: z.email(),
})

export const sessionSchema = z.object({
    id: z.string(),
    activeOrganizationId: z.string().nullish(),
})

export type User = z.infer<typeof userSchema>
export type Session = z.infer<typeof sessionSchema>
export type SignInInput = z.infer<typeof authSchema.signIn>
export type SignUpInput = z.infer<typeof authSchema.signUp>
