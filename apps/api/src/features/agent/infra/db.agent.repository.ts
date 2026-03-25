import type { Id } from "@features/common/values";
import { db } from "@packages/database";
import { agent as agentTable } from "@packages/database/src/schemas/agent.schema";
import { user } from "@packages/database/src/schemas/auth.schema";
import { and, eq } from "drizzle-orm";
import {
    type Agent,
    AgentFactory,
    type AgentWithUser,
    type UpdateAgentInput,
} from "../domain/agent.entity";
import type { IAgentRepository } from "../domain/interface.agent.repository";

export class DbAgentRepository implements IAgentRepository {
    async create(agent: Agent): Promise<Agent> {
        const [result] = await db.insert(agentTable).values(agent).returning();
        if (!result) throw new Error("Failed to create agent");
        return AgentFactory.fromDb(result);
    }

    async findById(id: Id, organizationId: Id): Promise<Agent | null> {
        const [result] = await db
            .select()
            .from(agentTable)
            .where(
                and(
                    eq(agentTable.id, id),
                    eq(agentTable.organizationId, organizationId),
                ),
            )
            .limit(1);
        if (!result) return null;
        return AgentFactory.fromDb(result);
    }

    async findByOrganization(organizationId: Id): Promise<AgentWithUser[]> {
        const results = await db
            .select({
                id: agentTable.id,
                userId: agentTable.userId,
                organizationId: agentTable.organizationId,
                email: agentTable.email,
                firstName: agentTable.firstName,
                lastName: agentTable.lastName,
                phone: agentTable.phone,
                fubId: agentTable.fubId,
                isActive: agentTable.isActive,
                createdAt: agentTable.createdAt,
                updatedAt: agentTable.updatedAt,
                userName: user.name,
            })
            .from(agentTable)
            .leftJoin(user, eq(agentTable.userId, user.id))
            .where(eq(agentTable.organizationId, organizationId))
            .orderBy(agentTable.lastName, agentTable.firstName);

        return results.map((r) =>
            AgentFactory.fromDbWithUser({ ...r, userName: r.userName ?? null }),
        );
    }

    async findByUserId(userId: Id): Promise<Agent | null> {
        const [result] = await db
            .select()
            .from(agentTable)
            .where(eq(agentTable.userId, userId))
            .limit(1);
        if (!result) return null;
        return AgentFactory.fromDb(result);
    }

    async update(
        id: Id,
        organizationId: Id,
        data: UpdateAgentInput,
    ): Promise<Agent> {
        const [result] = await db
            .update(agentTable)
            .set(data)
            .where(
                and(
                    eq(agentTable.id, id),
                    eq(agentTable.organizationId, organizationId),
                ),
            )
            .returning();
        if (!result) throw new Error("Agent not found");
        return AgentFactory.fromDb(result);
    }

    async setActive(
        id: Id,
        organizationId: Id,
        isActive: boolean,
    ): Promise<Agent> {
        const [result] = await db
            .update(agentTable)
            .set({ isActive })
            .where(
                and(
                    eq(agentTable.id, id),
                    eq(agentTable.organizationId, organizationId),
                ),
            )
            .returning();
        if (!result) throw new Error("Agent not found");
        return AgentFactory.fromDb(result);
    }

    async delete(id: Id, organizationId: Id): Promise<void> {
        await db
            .delete(agentTable)
            .where(
                and(
                    eq(agentTable.id, id),
                    eq(agentTable.organizationId, organizationId),
                ),
            );
    }

    async linkUser(
        organizationId: Id,
        email: string,
        userId: Id,
    ): Promise<void> {
        await db
            .update(agentTable)
            .set({ userId })
            .where(
                and(
                    eq(agentTable.organizationId, organizationId),
                    eq(agentTable.email, email),
                ),
            );
    }
}
