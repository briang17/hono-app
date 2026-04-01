import { type Id } from "@features/common/values";
import { z } from "zod";
export declare const AgentSchema: z.ZodObject<
    {
        id: z.ZodUUID;
        userId: z.ZodNullable<z.ZodUUID>;
        organizationId: z.ZodUUID;
        email: z.ZodEmail;
        firstName: z.ZodString;
        lastName: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
        fubId: z.ZodNullable<z.ZodString>;
        isActive: z.ZodBoolean;
        createdAt: z.ZodCoercedDate<unknown>;
        updatedAt: z.ZodCoercedDate<unknown>;
    },
    z.core.$strip
>;
export declare const NewAgentSchema: z.ZodObject<
    {
        email: z.ZodEmail;
        firstName: z.ZodString;
        lastName: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
        fubId: z.ZodNullable<z.ZodString>;
    },
    z.core.$strip
>;
export declare const UpdateAgentSchema: z.ZodObject<
    {
        email: z.ZodOptional<z.ZodEmail>;
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        fubId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    },
    z.core.$strip
>;
export declare const AgentWithUserSchema: z.ZodObject<
    {
        id: z.ZodUUID;
        userId: z.ZodNullable<z.ZodUUID>;
        organizationId: z.ZodUUID;
        email: z.ZodEmail;
        firstName: z.ZodString;
        lastName: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
        fubId: z.ZodNullable<z.ZodString>;
        isActive: z.ZodBoolean;
        createdAt: z.ZodCoercedDate<unknown>;
        updatedAt: z.ZodCoercedDate<unknown>;
        userName: z.ZodNullable<z.ZodString>;
    },
    z.core.$strip
>;
export type Agent = z.infer<typeof AgentSchema>;
export type NewAgentInput = z.infer<typeof NewAgentSchema>;
export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;
export type AgentWithUser = z.infer<typeof AgentWithUserSchema>;
export declare const AgentFactory: {
    create: (params: NewAgentInput, organizationId: Id) => Agent;
    fromDb: (params: z.input<typeof AgentSchema>) => Agent;
    fromDbWithUser: (
        params: z.input<typeof AgentWithUserSchema>,
    ) => AgentWithUser;
};
