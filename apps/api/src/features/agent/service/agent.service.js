import { codes } from "@config/constants";
import { db } from "@packages/database";
import { HTTPException } from "hono/http-exception";
import { AgentFactory } from "../domain/agent.entity";
export class AgentService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async createAgent(data, organizationId) {
        const agent = AgentFactory.create(data, organizationId);
        return await this.repository.create(agent);
    }
    async getAgents(organizationId) {
        return await this.repository.findByOrganization(organizationId);
    }
    async getAgent(id, organizationId) {
        const agent = await this.repository.findById(id, organizationId);
        if (!agent) {
            throw new HTTPException(codes.NOT_FOUND, {
                message: "Agent not found",
            });
        }
        return agent;
    }
    async updateAgent(id, organizationId, data) {
        await this.getAgent(id, organizationId);
        try {
            return await this.repository.update(id, organizationId, data);
        }
        catch {
            throw new HTTPException(codes.NOT_FOUND, {
                message: "Agent not found",
            });
        }
    }
    async deleteAgent(id, organizationId) {
        const agent = await this.getAgent(id, organizationId);
        await db.transaction(async (tx) => {
            await this.repository.deleteInvitationForAgent(organizationId, agent.email, tx);
            await this.repository.deleteMemberForAgent(organizationId, agent.userId, tx);
            await this.repository.delete(id, organizationId, tx);
        });
    }
    async deactivateAgent(id, organizationId) {
        await this.getAgent(id, organizationId);
        return await this.repository.setActive(id, organizationId, false);
    }
    async reactivateAgent(id, organizationId) {
        await this.getAgent(id, organizationId);
        return await this.repository.setActive(id, organizationId, true);
    }
}
