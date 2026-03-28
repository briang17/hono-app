import { EmailSchema, IdSchema, PhoneSchema, } from "@features/common/values";
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
export const UpdateAgentSchema = NewAgentSchema.partial();
export const AgentWithUserSchema = AgentSchema.extend({
    userName: z.string().nullable(),
});
export const AgentFactory = {
    create: (params, organizationId) => {
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
    fromDb: (params) => {
        return AgentSchema.parse(params);
    },
    fromDbWithUser: (params) => {
        return AgentWithUserSchema.parse(params);
    },
};
