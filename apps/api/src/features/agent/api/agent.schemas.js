import { AgentSchema, } from "@agent/domain/agent.entity";
import { z } from "zod";
/* GET /api/agents → getAgents() */
/* GET /api/agents/:id → getAgent() */
export const GetAgentParamsSchema = z.object({ id: AgentSchema.shape.id });
/* PATCH /api/agents/:id → updateAgent() */
export const UpdateAgentParamsSchema = z.object({ id: AgentSchema.shape.id });
/* DELETE /api/agents/:id → deleteAgent() */
export const DeleteAgentParamsSchema = z.object({ id: AgentSchema.shape.id });
/* POST /api/agents/:id/deactivate → deactivateAgent() */
export const DeactivateAgentParamsSchema = z.object({
    id: AgentSchema.shape.id,
});
/* POST /api/agents/:id/reactivate → reactivateAgent() */
export const ReactivateAgentParamsSchema = z.object({
    id: AgentSchema.shape.id,
});
