import { db } from "@packages/database";
import { agent as agentTable } from "@packages/database/src/schemas/agent.schema";
import { invitation, member, user, } from "@packages/database/src/schemas/auth.schema";
import { and, eq } from "drizzle-orm";
import { AgentFactory, } from "../domain/agent.entity";
export class DbAgentRepository {
    async create(agent) {
        const [result] = await db.insert(agentTable).values(agent).returning();
        if (!result)
            throw new Error("Failed to create agent");
        return AgentFactory.fromDb(result);
    }
    async findById(id, organizationId) {
        const [result] = await db
            .select()
            .from(agentTable)
            .where(and(eq(agentTable.id, id), eq(agentTable.organizationId, organizationId)))
            .limit(1);
        if (!result)
            return null;
        return AgentFactory.fromDb(result);
    }
    async findByOrganization(organizationId) {
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
        return results.map((r) => AgentFactory.fromDbWithUser({ ...r, userName: r.userName ?? null }));
    }
    async findByUserId(userId) {
        const [result] = await db
            .select()
            .from(agentTable)
            .where(eq(agentTable.userId, userId))
            .limit(1);
        if (!result)
            return null;
        return AgentFactory.fromDb(result);
    }
    async update(id, organizationId, data) {
        const [result] = await db
            .update(agentTable)
            .set(data)
            .where(and(eq(agentTable.id, id), eq(agentTable.organizationId, organizationId)))
            .returning();
        if (!result)
            throw new Error("Agent not found");
        return AgentFactory.fromDb(result);
    }
    async setActive(id, organizationId, isActive) {
        const [result] = await db
            .update(agentTable)
            .set({ isActive })
            .where(and(eq(agentTable.id, id), eq(agentTable.organizationId, organizationId)))
            .returning();
        if (!result)
            throw new Error("Agent not found");
        return AgentFactory.fromDb(result);
    }
    async delete(id, organizationId, tx) {
        const dbOrTx = tx ?? db;
        await dbOrTx
            .delete(agentTable)
            .where(and(eq(agentTable.id, id), eq(agentTable.organizationId, organizationId)));
    }
    async deleteInvitationForAgent(organizationId, email, tx) {
        const dbOrTx = tx ?? db;
        await dbOrTx
            .delete(invitation)
            .where(and(eq(invitation.organizationId, organizationId), eq(invitation.email, email)));
    }
    async deleteMemberForAgent(organizationId, userId, tx) {
        if (!userId)
            return;
        const dbOrTx = tx ?? db;
        await dbOrTx
            .delete(member)
            .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)));
    }
    async linkUser(organizationId, email, userId) {
        await db
            .update(agentTable)
            .set({ userId })
            .where(and(eq(agentTable.organizationId, organizationId), eq(agentTable.email, email)));
    }
}
