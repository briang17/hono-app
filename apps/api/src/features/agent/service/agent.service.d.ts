import type { NewAgentInput, UpdateAgentInput } from "../domain/agent.entity";
import { type Agent } from "../domain/agent.entity";
import type { IAgentRepository } from "../domain/interface.agent.repository";
export declare class AgentService {
    private repository;
    constructor(repository: IAgentRepository);
    createAgent(data: NewAgentInput, organizationId: string): Promise<Agent>;
    getAgents(organizationId: string): Promise<
        {
            id: string;
            userId: string | null;
            organizationId: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            fubId: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            userName: string | null;
        }[]
    >;
    getAgent(
        id: string,
        organizationId: string,
    ): Promise<{
        id: string;
        userId: string | null;
        organizationId: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        fubId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateAgent(
        id: string,
        organizationId: string,
        data: UpdateAgentInput,
    ): Promise<{
        id: string;
        userId: string | null;
        organizationId: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        fubId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteAgent(id: string, organizationId: string): Promise<void>;
    deactivateAgent(
        id: string,
        organizationId: string,
    ): Promise<{
        id: string;
        userId: string | null;
        organizationId: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        fubId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    reactivateAgent(
        id: string,
        organizationId: string,
    ): Promise<{
        id: string;
        userId: string | null;
        organizationId: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        fubId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
