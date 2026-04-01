import type { Id } from "@features/common/values";
import type { Transaction } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import {
    type Agent,
    type AgentWithUser,
    type UpdateAgentInput,
} from "../domain/agent.entity";
import type { IAgentRepository } from "../domain/interface.agent.repository";
export declare class DbAgentRepository implements IAgentRepository {
    create(agent: Agent): Promise<Agent>;
    findById(id: Id, organizationId: Id): Promise<Agent | null>;
    findByOrganization(organizationId: Id): Promise<AgentWithUser[]>;
    findByUserId(userId: Id): Promise<Agent | null>;
    update(id: Id, organizationId: Id, data: UpdateAgentInput): Promise<Agent>;
    setActive(id: Id, organizationId: Id, isActive: boolean): Promise<Agent>;
    delete(
        id: Id,
        organizationId: Id,
        tx?: Transaction<PgTransaction<"readwrite">>,
    ): Promise<void>;
    deleteInvitationForAgent(
        organizationId: Id,
        email: string,
        tx?: Transaction<PgTransaction<"readwrite">>,
    ): Promise<void>;
    deleteMemberForAgent(
        organizationId: Id,
        userId: Id | null,
        tx?: Transaction<PgTransaction<"readwrite">>,
    ): Promise<void>;
    linkUser(organizationId: Id, email: string, userId: Id): Promise<void>;
}
