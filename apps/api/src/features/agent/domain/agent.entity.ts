import {
    EmailSchema,
    type Id,
    IdSchema,
    PhoneSchema,
} from "@features/common/values";
import { z } from "zod";

export const AgentSchema = z.object({
    id: IdSchema,
    userId: IdSchema.nullable(),
    organizationId: IdSchema,
    email: EmailSchema,
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: PhoneSchema.nullable(),
    fubId: z.string().nullable(),
    imageUrl: z.string().url().nullable(),
    imagePublicId: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export const NewAgentSchema = AgentSchema.pick({
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    fubId: true,
});

export const UpdateAgentSchema = NewAgentSchema.partial().extend({
    imageUrl: z.string().url().nullable().optional(),
    imagePublicId: z.string().nullable().optional(),
});

export const UpdateMyAgentSchema = z.object({
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    phone: z.string().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    imagePublicId: z.string().nullable().optional(),
});

export const AgentWithUserSchema = AgentSchema.extend({
    userName: z.string().nullable(),
});

export type Agent = z.infer<typeof AgentSchema>;
export type NewAgentInput = z.infer<typeof NewAgentSchema>;
export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;
export type UpdateMyAgentInput = z.infer<typeof UpdateMyAgentSchema>;
export type AgentWithUser = z.infer<typeof AgentWithUserSchema>;

export const AgentFactory = {
    create: (params: NewAgentInput, organizationId: Id): Agent => {
        const now = new Date();
        return AgentSchema.parse({
            ...params,
            id: Bun.randomUUIDv7(),
            userId: null,
            organizationId,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });
    },
    fromDb: (params: z.input<typeof AgentSchema>): Agent => {
        return AgentSchema.parse(params);
    },
    fromDbWithUser: (
        params: z.input<typeof AgentWithUserSchema>,
    ): AgentWithUser => {
        return AgentWithUserSchema.parse(params);
    },
};
