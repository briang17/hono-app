import { z } from 'zod/v4'

export const agentSchema = z.object({
    id: z.uuid(),
    userId: z.uuid().nullable(),
    organizationId: z.uuid(),
    email: z.email(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().nullable(),
    fubId: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
})

export const agentWithUserSchema = agentSchema.extend({
    userName: z.string().nullable(),
})

export const createAgentSchema = agentSchema.pick({
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    fubId: true,
})

export const updateAgentSchema = createAgentSchema.omit({ email: true }).partial()

export type Agent = z.infer<typeof agentSchema>
export type AgentWithUser = z.infer<typeof agentWithUserSchema>
export type CreateAgentInput = z.infer<typeof createAgentSchema>
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>
