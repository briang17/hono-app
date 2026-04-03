import {
    AgentSchema,
    type NewAgentSchema,
    type UpdateAgentSchema,
} from "@agent/domain/agent.entity";
import { z } from "zod";

/* GET /api/agents → getAgents() */

/* GET /api/agents/:id → getAgent() */
export const GetAgentParamsSchema = z.object({ id: AgentSchema.shape.id });
export type GetAgentParams = z.infer<typeof GetAgentParamsSchema>;

/* POST /api/agents → createAgent() */
export type CreateAgentInput = z.infer<typeof NewAgentSchema>;

/* PATCH /api/agents/:id → updateAgent() */
export const UpdateAgentParamsSchema = z.object({ id: AgentSchema.shape.id });
export type UpdateAgentParams = z.infer<typeof UpdateAgentParamsSchema>;
export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;

/* DELETE /api/agents/:id → deleteAgent() */
export const DeleteAgentParamsSchema = z.object({ id: AgentSchema.shape.id });
export type DeleteAgentParams = z.infer<typeof DeleteAgentParamsSchema>;

/* POST /api/agents/:id/deactivate → deactivateAgent() */
export const DeactivateAgentParamsSchema = z.object({
    id: AgentSchema.shape.id,
});
export type DeactivateAgentParams = z.infer<typeof DeactivateAgentParamsSchema>;

/* POST /api/agents/:id/reactivate → reactivateAgent() */
export const ReactivateAgentParamsSchema = z.object({
    id: AgentSchema.shape.id,
});
export type ReactivateAgentParams = z.infer<typeof ReactivateAgentParamsSchema>;

/* PATCH /api/agents/me → updateMyAgent() */
export const UpdateMyAgentSchema = z.object({
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    phone: z.string().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    imagePublicId: z.string().nullable().optional(),
});
export type UpdateMyAgentInput = z.infer<typeof UpdateMyAgentSchema>;
