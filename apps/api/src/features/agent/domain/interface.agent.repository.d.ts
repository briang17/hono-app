import type { Id } from "@features/common/values";
import type { Transaction } from "drizzle-orm";
import type { Agent, AgentWithUser, UpdateAgentInput } from "./agent.entity";
export interface IAgentRepository {
    create(agent: Agent): Promise<Agent>;
    findById(id: Id, organizationId: Id): Promise<Agent | null>;
    findByOrganization(organizationId: Id): Promise<AgentWithUser[]>;
    findByUserId(userId: Id): Promise<Agent | null>;
    update(id: Id, organizationId: Id, data: UpdateAgentInput): Promise<Agent>;
    setActive(id: Id, organizationId: Id, isActive: boolean): Promise<Agent>;
    delete(
        id: Id,
        organizationId: Id,
        tx?: Transaction<
            import("drizzle-orm/pg-core").PgTransaction<"readwrite">
        >,
    ): Promise<void>;
    deleteInvitationForAgent(
        organizationId: Id,
        email: string,
        tx?: Transaction<
            import("drizzle-orm/pg-core").PgTransaction<"readwrite">
        >,
    ): Promise<void>;
    deleteMemberForAgent(
        organizationId: Id,
        userId: Id | null,
        tx?: Transaction<
            import("drizzle-orm/pg-core").PgTransaction<"readwrite">
        >,
    ): Promise<void>;
    linkUser(organizationId: Id, email: string, userId: Id): Promise<void>;
}
