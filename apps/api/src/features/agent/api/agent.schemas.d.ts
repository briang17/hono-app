import { type NewAgentSchema, type UpdateAgentSchema } from "@agent/domain/agent.entity";
import { z } from "zod";
export declare const GetAgentParamsSchema: z.ZodObject<{
    id: z.ZodUUID;
}, z.core.$strip>;
export type GetAgentParams = z.infer<typeof GetAgentParamsSchema>;
export type CreateAgentInput = z.infer<typeof NewAgentSchema>;
export declare const UpdateAgentParamsSchema: z.ZodObject<{
    id: z.ZodUUID;
}, z.core.$strip>;
export type UpdateAgentParams = z.infer<typeof UpdateAgentParamsSchema>;
export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;
export declare const DeleteAgentParamsSchema: z.ZodObject<{
    id: z.ZodUUID;
}, z.core.$strip>;
export type DeleteAgentParams = z.infer<typeof DeleteAgentParamsSchema>;
export declare const DeactivateAgentParamsSchema: z.ZodObject<{
    id: z.ZodUUID;
}, z.core.$strip>;
export type DeactivateAgentParams = z.infer<typeof DeactivateAgentParamsSchema>;
export declare const ReactivateAgentParamsSchema: z.ZodObject<{
    id: z.ZodUUID;
}, z.core.$strip>;
export type ReactivateAgentParams = z.infer<typeof ReactivateAgentParamsSchema>;
