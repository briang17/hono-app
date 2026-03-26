import { codes } from "@config/constants";
import { db } from "@packages/database";
import { HTTPException } from "hono/http-exception";
import type { NewAgentInput, UpdateAgentInput } from "../domain/agent.entity";
import { type Agent, AgentFactory } from "../domain/agent.entity";
import type { IAgentRepository } from "../domain/interface.agent.repository";

export class AgentService {
    constructor(private repository: IAgentRepository) {}

    async createAgent(
        data: NewAgentInput,
        organizationId: string,
    ): Promise<Agent> {
        const agent = AgentFactory.create(data, organizationId);
        return await this.repository.create(agent);
    }

    async getAgents(organizationId: string) {
        return await this.repository.findByOrganization(organizationId);
    }

    async getAgent(id: string, organizationId: string) {
        const agent = await this.repository.findById(id, organizationId);
        if (!agent) {
            throw new HTTPException(codes.NOT_FOUND, {
                message: "Agent not found",
            });
        }
        return agent;
    }

    async updateAgent(
        id: string,
        organizationId: string,
        data: UpdateAgentInput,
    ) {
        await this.getAgent(id, organizationId);
        try {
            return await this.repository.update(id, organizationId, data);
        } catch {
            throw new HTTPException(codes.NOT_FOUND, {
                message: "Agent not found",
            });
        }
    }

    async deleteAgent(id: string, organizationId: string) {
        const agent = await this.getAgent(id, organizationId);

        await db.transaction(async (tx) => {
            await this.repository.deleteInvitationForAgent(
                organizationId,
                agent.email,
                tx,
            );
            await this.repository.deleteMemberForAgent(
                organizationId,
                agent.userId,
                tx,
            );
            await this.repository.delete(id, organizationId, tx);
        });
    }

    async deactivateAgent(id: string, organizationId: string) {
        await this.getAgent(id, organizationId);
        return await this.repository.setActive(id, organizationId, false);
    }

    async reactivateAgent(id: string, organizationId: string) {
        await this.getAgent(id, organizationId);
        return await this.repository.setActive(id, organizationId, true);
    }
}
